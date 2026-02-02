import type { Order, ActionPriceRange } from '../types';

/**
 * Parses a CSV file from ATrad Order Tracker
 * Handles the specific format with headers and data rows
 */
export function parseOrderTrackerCSV(csvText: string): Order[] {
  const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines.length < 3) {
    throw new Error('Invalid CSV format: Expected at least 3 lines (title, empty, header)');
  }

  // Find the header row (usually line 2, index 2)
  // Look for line containing "Security,Side,Order Qty"
  let headerIndex = -1;
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    if (lines[i].includes('Security') && lines[i].includes('Side') && lines[i].includes('Order Qty')) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    throw new Error('Invalid CSV format: Could not find header row');
  }

  const headerLine = lines[headerIndex];
  const headers = parseCSVLine(headerLine);

  // Find column indices
  const securityIndex = headers.findIndex(h => h.toLowerCase().includes('security'));
  const sideIndex = headers.findIndex(h => h.toLowerCase().includes('side'));
  const orderQtyIndex = headers.findIndex(h => h.toLowerCase().includes('order qty'));
  const orderPriceIndex = headers.findIndex(h => h.toLowerCase().includes('order price'));
  const orderValueIndex = headers.findIndex(h => h.toLowerCase().includes('order value'));
  const orderStatusIndex = headers.findIndex(h => h.toLowerCase().includes('order status'));
  const remainingQtyIndex = headers.findIndex(h => h.toLowerCase().includes('remaining qty'));
  const filledQtyIndex = headers.findIndex(h => h.toLowerCase().includes('filled qty'));
  const orderDateTimeIndex = headers.findIndex(h => h.toLowerCase().includes('order date and time'));
  const exchangeOrderIdIndex = headers.findIndex(h => h.toLowerCase().includes('exchange order id'));

  if (securityIndex === -1 || sideIndex === -1 || orderQtyIndex === -1 || orderPriceIndex === -1) {
    throw new Error('Invalid CSV format: Missing required columns');
  }

  const orders: Order[] = [];
  const processedExchangeOrderIds = new Set<string>();

  // Process data rows (starting after header)
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || line.trim().length === 0) continue;

    const values = parseCSVLine(line);
    
    if (values.length < Math.max(securityIndex, sideIndex, orderQtyIndex, orderPriceIndex) + 1) {
      continue; // Skip incomplete rows
    }

    const security = values[securityIndex]?.trim();
    const side = values[sideIndex]?.trim().toUpperCase();
    const orderStatus = values[orderStatusIndex]?.trim() || '';
    const remainingQty = parseNumber(values[remainingQtyIndex] || '0');
    const filledQty = parseNumber(values[filledQtyIndex] || '0');
    const exchangeOrderId = values[exchangeOrderIdIndex]?.trim() || '';

    // Only process FILLED orders
    if (orderStatus !== 'FILLED') {
      continue;
    }

    // For orders with same Exchange Order Id, only process the one with Remaining Qty = 0
    if (exchangeOrderId) {
      if (processedExchangeOrderIds.has(exchangeOrderId)) {
        continue; // Already processed this exchange order
      }
      if (remainingQty !== 0) {
        continue; // Skip partial fills, wait for the complete fill
      }
      processedExchangeOrderIds.add(exchangeOrderId);
    }

    if (!security || (side !== 'BUY' && side !== 'SELL')) {
      continue;
    }

    const orderQty = parseNumber(values[orderQtyIndex] || '0');
    const orderPrice = parseNumber(values[orderPriceIndex] || '0');
    const orderValue = parseNumber(values[orderValueIndex] || '0');
    const orderDateTime = values[orderDateTimeIndex]?.trim() || '';

    // Parse date and time
    let orderDate = '';
    let orderTime = '';
    if (orderDateTime) {
      const dateTimeMatch = orderDateTime.match(/(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/);
      if (dateTimeMatch) {
        orderDate = dateTimeMatch[1];
        orderTime = dateTimeMatch[2];
      }
    }

    const order: Order = {
      id: `${exchangeOrderId || `order-${i}`}-${Date.now()}-${Math.random()}`,
      security,
      side: side as 'BUY' | 'SELL',
      orderQty,
      orderPrice,
      orderValue: orderValue || orderQty * orderPrice,
      orderDate,
      orderTime,
      orderDateTime,
      exchangeOrderId,
      filledQty: filledQty || orderQty,
      remainingQty,
      orderStatus,
    };

    orders.push(order);
  }

  return orders;
}

/**
 * Parses a CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Parses a number from string, handling commas and other formatting
 */
function parseNumber(value: string): number {
  if (!value) return 0;
  // Remove commas and other formatting
  const cleaned = value.toString().replace(/,/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parses a Watchlist CSV file from ATrad
 * Extracts Security -> Last Price mapping
 */
export function parseWatchlistCSV(csvText: string): Record<string, number> {
  const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines.length < 2) {
    throw new Error('Invalid Watchlist CSV format: Expected at least header and data rows');
  }

  // Find the header row (usually first line)
  let headerIndex = -1;
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    if (lines[i].includes('Security') && lines[i].includes('Last')) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    throw new Error('Invalid Watchlist CSV format: Could not find header row with Security and Last columns');
  }

  const headerLine = lines[headerIndex];
  const headers = parseCSVLine(headerLine);

  // Find column indices
  const securityIndex = headers.findIndex(h => h.toLowerCase().includes('security'));
  const lastPriceIndex = headers.findIndex(h => h.toLowerCase().includes('last'));

  if (securityIndex === -1 || lastPriceIndex === -1) {
    throw new Error('Invalid Watchlist CSV format: Missing Security or Last columns');
  }

  const priceMap: Record<string, number> = {};

  // Process data rows (starting after header)
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || line.trim().length === 0) continue;

    const values = parseCSVLine(line);
    
    if (values.length < Math.max(securityIndex, lastPriceIndex) + 1) {
      continue; // Skip incomplete rows
    }

    const security = values[securityIndex]?.trim();
    const lastPrice = parseNumber(values[lastPriceIndex] || '0');

    if (security && lastPrice > 0) {
      priceMap[security] = lastPrice;
    }
  }

  return priceMap;
}

/**
 * Parses a Portfolio CSV file from ATrad
 * Extracts Sales Commission, Sales Proceeds, and Unrealized Gain/Loss per security
 */
export function parsePortfolioCSV(csvText: string): Record<string, {
  salesCommission: number;
  salesProceeds: number;
  unrealizedGainLoss: number;
}> {
  const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines.length < 3) {
    throw new Error('Invalid Portfolio CSV format: Expected at least header and data rows');
  }

  // Find the header row
  let headerIndex = -1;
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    if (lines[i].includes('Security') && lines[i].includes('Sales Commission') && lines[i].includes('Sales Proceeds')) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    throw new Error('Invalid Portfolio CSV format: Could not find header row');
  }

  const headerLine = lines[headerIndex];
  const headers = parseCSVLine(headerLine);

  // Find column indices
  const securityIndex = headers.findIndex(h => h.toLowerCase().includes('security'));
  const salesCommissionIndex = headers.findIndex(h => h.toLowerCase().includes('sales commission'));
  const salesProceedsIndex = headers.findIndex(h => h.toLowerCase().includes('sales proceeds'));
  const unrealizedGainLossIndex = headers.findIndex(h => 
    h.toLowerCase().includes('unrealized gain') || h.toLowerCase().includes('unrealized gain / (loss)')
  );

  if (securityIndex === -1 || salesCommissionIndex === -1 || salesProceedsIndex === -1) {
    throw new Error('Invalid Portfolio CSV format: Missing required columns');
  }

  const portfolioData: Record<string, {
    salesCommission: number;
    salesProceeds: number;
    unrealizedGainLoss: number;
  }> = {};

  // Process data rows (skip "Total" row)
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || line.trim().length === 0) continue;
    if (line.toUpperCase().startsWith('TOTAL')) continue; // Skip total row

    const values = parseCSVLine(line);
    
    if (values.length < Math.max(securityIndex, salesCommissionIndex, salesProceedsIndex) + 1) {
      continue;
    }

    const security = values[securityIndex]?.trim();
    const salesCommission = parseNumber(values[salesCommissionIndex] || '0');
    const salesProceeds = parseNumber(values[salesProceedsIndex] || '0');
    const unrealizedGainLoss = parseNumber(values[unrealizedGainLossIndex] || '0');

    if (security && (salesCommission > 0 || salesProceeds > 0)) {
      portfolioData[security] = {
        salesCommission,
        salesProceeds,
        unrealizedGainLoss,
      };
    }
  }

  return portfolioData;
}

/**
 * Parses Action Price Ranges CSV file
 * Format: Company Code,Quantity,Avg Price,B.E.S Price,Last,Change,% Change,Accumulate Slowly,Strong Add Zone,Re-evaluate if Market Weak,Pause Buys,Trim Small Portion,Investment_Percentage,Time,Trailing Stop (SELL if below)
 */
export function parseActionPriceRangesCSV(csvText: string): Record<string, ActionPriceRange> {
  const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines.length < 2) {
    throw new Error('Invalid CSV format: Expected at least header and one data row');
  }

  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);

  // Find column indices
  const companyCodeIndex = headers.findIndex(h => h.toLowerCase().includes('company code') || h.toLowerCase().includes('security'));
  const quantityIndex = headers.findIndex(h => h.toLowerCase().includes('quantity'));
  const avgPriceIndex = headers.findIndex(h => h.toLowerCase().includes('avg price') || h.toLowerCase().includes('average price'));
  const breakEvenSellPriceIndex = headers.findIndex(h => h.toLowerCase().includes('b.e.s') || h.toLowerCase().includes('break even'));
  const lastIndex = headers.findIndex(h => h.toLowerCase().includes('last'));
  const changeIndex = headers.findIndex(h => h.toLowerCase().includes('change') && !h.toLowerCase().includes('%'));
  const changePercentIndex = headers.findIndex(h => h.toLowerCase().includes('% change') || (h.toLowerCase().includes('change') && h.toLowerCase().includes('%')));
  const accumulateSlowlyIndex = headers.findIndex(h => h.toLowerCase().includes('accumulate slowly'));
  const strongAddZoneIndex = headers.findIndex(h => h.toLowerCase().includes('strong add zone'));
  const reEvaluateIndex = headers.findIndex(h => h.toLowerCase().includes('re-evaluate') || h.toLowerCase().includes('reevaluate'));
  const pauseBuysIndex = headers.findIndex(h => h.toLowerCase().includes('pause buys'));
  const trimSmallPortionIndex = headers.findIndex(h => h.toLowerCase().includes('trim small portion'));
  const investmentPercentageIndex = headers.findIndex(h => h.toLowerCase().includes('investment_percentage') || h.toLowerCase().includes('investment percentage'));
  const trailingStopIndex = headers.findIndex(h => h.toLowerCase().includes('trailing stop'));

  if (companyCodeIndex === -1 || quantityIndex === -1 || avgPriceIndex === -1) {
    throw new Error('Invalid CSV format: Missing required columns (Company Code, Quantity, Avg Price)');
  }

  const actionRanges: Record<string, ActionPriceRange> = {};

  // Process data rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length < 3) continue; // Skip empty or invalid rows

    const security = values[companyCodeIndex]?.trim();
    if (!security) continue;

    const quantity = parseNumber(values[quantityIndex] || '0');
    const avgPrice = parseNumber(values[avgPriceIndex] || '0');
    const breakEvenSellPrice = parseNumber(values[breakEvenSellPriceIndex] || avgPrice.toString());
    const lastPrice = values[lastIndex] ? parseNumber(values[lastIndex]) : undefined;
    const change = values[changeIndex] ? parseNumber(values[changeIndex]) : undefined;
    const changePercent = values[changePercentIndex] ? parseNumber(values[changePercentIndex]) : undefined;
    const accumulateSlowly = values[accumulateSlowlyIndex]?.trim() || undefined;
    const strongAddZone = values[strongAddZoneIndex]?.trim() || undefined;
    const reEvaluateIfWeak = values[reEvaluateIndex]?.trim() || undefined;
    const pauseBuys = values[pauseBuysIndex]?.trim() || undefined;
    const trimSmallPortion = values[trimSmallPortionIndex]?.trim() || undefined;
    const investmentPercentage = values[investmentPercentageIndex] 
      ? parseFloat(values[investmentPercentageIndex].replace('%', '').trim()) 
      : undefined;
    const trailingStop = values[trailingStopIndex] ? parseNumber(values[trailingStopIndex]) : undefined;

    actionRanges[security] = {
      security,
      quantity,
      avgPrice,
      breakEvenSellPrice,
      lastPrice,
      change,
      changePercent,
      accumulateSlowly,
      strongAddZone,
      reEvaluateIfWeak,
      pauseBuys,
      trimSmallPortion,
      investmentPercentage,
      trailingStop,
    };
  }

  return actionRanges;
}