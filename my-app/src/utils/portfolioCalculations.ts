/**
 * Portfolio Calculation Utilities
 * Handles P/L calculations for individual orders and portfolio totals
 */

import type { OrderRecord } from './csvParser';

export interface BuyLot {
  id: string; // Unique identifier for this lot
  security: string;
  buyDate: string;
  buyDateTime: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number | null;
  unrealizedPL: number | null;
  unrealizedPLPercent: number | null;
}

export interface StockSummary {
  security: string;
  totalQuantity: number;
  totalCost: number;
  averageBuyPrice: number;
  currentPrice: number | null;
  totalUnrealizedPL: number | null;
  totalUnrealizedPLPercent: number | null;
  lots: BuyLot[];
}

export interface PortfolioSummary {
  totalCost: number;
  totalMarketValue: number | null;
  totalUnrealizedPL: number | null;
  totalUnrealizedPLPercent: number | null;
  stockSummaries: StockSummary[];
}

/**
 * Process orders into buy lots
 * Each BUY order becomes a separate lot
 * SELL orders are tracked but not yet processed (for future FIFO implementation)
 */
export function processOrdersIntoBuyLots(orders: OrderRecord[]): BuyLot[] {
  const buyLots: BuyLot[] = [];
  let lotCounter = 1;
  
  for (const order of orders) {
    if (order.side === 'BUY') {
      const lotId = `${order.security}-${lotCounter}-${order.orderDate}`;
      buyLots.push({
        id: lotId,
        security: order.security,
        buyDate: order.orderDate,
        buyDateTime: order.orderDateTime,
        quantity: order.orderQty,
        buyPrice: order.orderPrice,
        currentPrice: null,
        unrealizedPL: null,
        unrealizedPLPercent: null,
      });
      lotCounter++;
    }
    // SELL orders are ignored for now (v2: FIFO logic)
  }
  
  return buyLots;
}

/**
 * Apply current prices from watchlist to buy lots
 */
export function applyCurrentPrices(
  buyLots: BuyLot[],
  priceMap: Record<string, number>
): BuyLot[] {
  return buyLots.map(lot => {
    const currentPrice = priceMap[lot.security] || null;
    
    let unrealizedPL: number | null = null;
    let unrealizedPLPercent: number | null = null;
    
    if (currentPrice !== null) {
      unrealizedPL = (currentPrice - lot.buyPrice) * lot.quantity;
      unrealizedPLPercent = ((currentPrice - lot.buyPrice) / lot.buyPrice) * 100;
    }
    
    return {
      ...lot,
      currentPrice,
      unrealizedPL,
      unrealizedPLPercent,
    };
  });
}

/**
 * Calculate stock summaries from buy lots
 */
export function calculateStockSummaries(buyLots: BuyLot[]): StockSummary[] {
  const stockMap = new Map<string, BuyLot[]>();
  
  // Group lots by security
  for (const lot of buyLots) {
    if (!stockMap.has(lot.security)) {
      stockMap.set(lot.security, []);
    }
    stockMap.get(lot.security)!.push(lot);
  }
  
  const summaries: StockSummary[] = [];
  
  for (const [security, lots] of stockMap.entries()) {
    const totalQuantity = lots.reduce((sum, lot) => sum + lot.quantity, 0);
    const totalCost = lots.reduce((sum, lot) => sum + (lot.buyPrice * lot.quantity), 0);
    const averageBuyPrice = totalQuantity > 0 ? totalCost / totalQuantity : 0;
    
    // Get current price from first lot (all lots of same stock have same current price)
    const currentPrice = lots[0]?.currentPrice ?? null;
    
    // Calculate total unrealized P/L
    let totalUnrealizedPL: number | null = null;
    let totalUnrealizedPLPercent: number | null = null;
    
    if (currentPrice !== null) {
      totalUnrealizedPL = lots.reduce((sum, lot) => {
        return sum + (lot.unrealizedPL ?? 0);
      }, 0);
      totalUnrealizedPLPercent = totalCost > 0 ? (totalUnrealizedPL / totalCost) * 100 : 0;
    }
    
    summaries.push({
      security,
      totalQuantity,
      totalCost,
      averageBuyPrice,
      currentPrice,
      totalUnrealizedPL,
      totalUnrealizedPLPercent,
      lots,
    });
  }
  
  // Sort by security name
  summaries.sort((a, b) => a.security.localeCompare(b.security));
  
  return summaries;
}

/**
 * Calculate portfolio summary
 */
export function calculatePortfolioSummary(stockSummaries: StockSummary[]): PortfolioSummary {
  const totalCost = stockSummaries.reduce((sum, stock) => sum + stock.totalCost, 0);
  
  let totalMarketValue: number | null = null;
  let totalUnrealizedPL: number | null = null;
  let totalUnrealizedPLPercent: number | null = null;
  
  // Check if we have current prices for all stocks
  const hasAllPrices = stockSummaries.every(stock => stock.currentPrice !== null);
  
  if (hasAllPrices && stockSummaries.length > 0) {
    totalMarketValue = stockSummaries.reduce((sum, stock) => {
      if (stock.currentPrice !== null) {
        return sum + (stock.currentPrice * stock.totalQuantity);
      }
      return sum;
    }, 0);
    
    totalUnrealizedPL = stockSummaries.reduce((sum, stock) => {
      return sum + (stock.totalUnrealizedPL ?? 0);
    }, 0);
    
    totalUnrealizedPLPercent = totalCost > 0 ? (totalUnrealizedPL / totalCost) * 100 : 0;
  }
  
  return {
    totalCost,
    totalMarketValue,
    totalUnrealizedPL,
    totalUnrealizedPLPercent,
    stockSummaries,
  };
}

/**
 * Update current price for a specific lot
 */
export function updateLotCurrentPrice(
  buyLots: BuyLot[],
  lotId: string,
  newPrice: number | null
): BuyLot[] {
  return buyLots.map(lot => {
    if (lot.id === lotId) {
      let unrealizedPL: number | null = null;
      let unrealizedPLPercent: number | null = null;
      
      if (newPrice !== null) {
        unrealizedPL = (newPrice - lot.buyPrice) * lot.quantity;
        unrealizedPLPercent = ((newPrice - lot.buyPrice) / lot.buyPrice) * 100;
      }
      
      return {
        ...lot,
        currentPrice: newPrice,
        unrealizedPL,
        unrealizedPLPercent,
      };
    }
    return lot;
  });
}

/**
 * Update current price for all lots of a security
 */
export function updateSecurityCurrentPrice(
  buyLots: BuyLot[],
  security: string,
  newPrice: number | null
): BuyLot[] {
  return buyLots.map(lot => {
    if (lot.security === security) {
      let unrealizedPL: number | null = null;
      let unrealizedPLPercent: number | null = null;
      
      if (newPrice !== null) {
        unrealizedPL = (newPrice - lot.buyPrice) * lot.quantity;
        unrealizedPLPercent = ((newPrice - lot.buyPrice) / lot.buyPrice) * 100;
      }
      
      return {
        ...lot,
        currentPrice: newPrice,
        unrealizedPL,
        unrealizedPLPercent,
      };
    }
    return lot;
  });
}
