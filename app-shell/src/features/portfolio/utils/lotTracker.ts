import type { Order, Lot, SellMatch, SecurityHolding, StockSplit } from '../types';

/**
 * Processes orders into lots using FIFO (First In First Out) matching
 * Each BUY order creates a lot, SELL orders are matched to existing lots
 * Stock splits are applied chronologically to adjust quantities and prices
 */
export function processOrdersIntoLots(orders: Order[], stockSplits: StockSplit[] = []): Lot[] {
  // Create a map of splits by security, sorted by date
  const splitMap = new Map<string, StockSplit[]>();
  for (const split of stockSplits) {
    if (!splitMap.has(split.security)) {
      splitMap.set(split.security, []);
    }
    splitMap.get(split.security)!.push(split);
  }
  
  // Sort splits by date for each security (oldest first)
  for (const splits of splitMap.values()) {
    splits.sort((a, b) => new Date(a.splitDateTime).getTime() - new Date(b.splitDateTime).getTime());
  }
  // Sort orders by date and time (oldest first)
  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = new Date(a.orderDateTime || a.orderDate).getTime();
    const dateB = new Date(b.orderDateTime || b.orderDate).getTime();
    if (dateA !== dateB) return dateA - dateB;
    return a.orderTime.localeCompare(b.orderTime);
  });

  const lots: Lot[] = [];
  const lotMap = new Map<string, Lot[]>(); // security -> lots

  for (const order of sortedOrders) {
    if (order.side === 'BUY') {
      // Calculate cumulative split ratio for this security
      // Apply splits that occurred AFTER this order (adjust historical orders for future splits)
      let cumulativeSplitRatio = 1.0;
      const splits = splitMap.get(order.security) || [];
      for (const split of splits) {
        const orderDateTime = order.orderDateTime || `${order.orderDate} ${order.orderTime || '00:00:00'}`;
        // If split happened AFTER this order, apply the split adjustment
        if (new Date(orderDateTime) < new Date(split.splitDateTime)) {
          cumulativeSplitRatio *= split.ratio;
        }
      }
      
      // Adjust quantity and price based on splits
      // Quantity increases by ratio, price decreases by ratio (cost basis stays same)
      const adjustedQuantity = order.orderQty * cumulativeSplitRatio;
      const adjustedPrice = order.orderPrice / cumulativeSplitRatio;
      
      // Create a new lot for each BUY order
      const lot: Lot = {
        id: `lot-${order.id}`,
        security: order.security,
        buyOrderId: order.id,
        buyDate: order.orderDate,
        buyPrice: adjustedPrice, // Adjusted for splits
        quantity: adjustedQuantity, // Adjusted for splits
        remainingQuantity: adjustedQuantity,
        totalCost: adjustedQuantity * adjustedPrice, // Should equal original cost
        sellOrders: [],
        // Store original values for display
        originalBuyPrice: cumulativeSplitRatio !== 1.0 ? order.orderPrice : undefined,
        originalQuantity: cumulativeSplitRatio !== 1.0 ? order.orderQty : undefined,
        splitRatio: cumulativeSplitRatio !== 1.0 ? cumulativeSplitRatio : undefined,
      };

      lots.push(lot);
      
      // Add to map for quick lookup
      if (!lotMap.has(order.security)) {
        lotMap.set(order.security, []);
      }
      lotMap.get(order.security)!.push(lot);
    } else if (order.side === 'SELL') {
      // Apply splits to SELL orders too
      // Apply splits that occurred AFTER this order
      let cumulativeSplitRatio = 1.0;
      const splits = splitMap.get(order.security) || [];
      for (const split of splits) {
        const orderDateTime = order.orderDateTime || `${order.orderDate} ${order.orderTime || '00:00:00'}`;
        // If split happened AFTER this order, apply the split adjustment
        if (new Date(orderDateTime) < new Date(split.splitDateTime)) {
          cumulativeSplitRatio *= split.ratio;
        }
      }
      
      const adjustedSellQty = order.orderQty * cumulativeSplitRatio;
      const adjustedSellPrice = order.orderPrice / cumulativeSplitRatio;
      
      // Match SELL order to existing lots using FIFO
      const securityLots = lotMap.get(order.security) || [];
      let remainingSellQty = adjustedSellQty;

      for (const lot of securityLots) {
        if (remainingSellQty <= 0) break;
        if (lot.remainingQuantity <= 0) continue;

        const qtyToSell = Math.min(remainingSellQty, lot.remainingQuantity);
        
        const sellMatch: SellMatch = {
          sellOrderId: order.id,
          sellDate: order.orderDate,
          sellPrice: adjustedSellPrice, // Adjusted for splits
          quantity: qtyToSell,
          proceeds: qtyToSell * adjustedSellPrice,
          gainLoss: qtyToSell * (adjustedSellPrice - lot.buyPrice),
          gainLossPercent: ((adjustedSellPrice - lot.buyPrice) / lot.buyPrice) * 100,
        };

        lot.sellOrders.push(sellMatch);
        lot.remainingQuantity -= qtyToSell;
        remainingSellQty -= qtyToSell;
      }

      // If there's still remaining sell quantity, it means we sold more than we bought
      // This could happen with short selling or data issues - we'll log it but continue
      if (remainingSellQty > 0) {
        console.warn(
          `Warning: SELL order ${order.id} for ${order.security} has ${remainingSellQty} unmatched quantity`
        );
      }
    }
  }

  return lots;
}

/**
 * Groups lots by security and calculates holdings
 */
export function calculateHoldings(
  lots: Lot[],
  currentPrices: Record<string, number> = {}
): Record<string, SecurityHolding> {
  const holdings: Record<string, SecurityHolding> = {};

  for (const lot of lots) {
    if (!holdings[lot.security]) {
      holdings[lot.security] = {
        security: lot.security,
        totalQuantity: 0,
        averageBuyPrice: 0,
        totalCost: 0,
        currentPrice: currentPrices[lot.security],
        marketValue: 0,
        unrealizedGainLoss: 0,
        unrealizedGainLossPercent: 0,
        lots: [],
      };
    }

    const holding = holdings[lot.security];
    
    // Only count lots with remaining quantity for current holdings
    if (lot.remainingQuantity > 0) {
      holding.totalQuantity += lot.remainingQuantity;
      holding.totalCost += lot.remainingQuantity * lot.buyPrice;
    }

    holding.lots.push(lot);
  }

  // Calculate averages and market values
  for (const security in holdings) {
    const holding = holdings[security];
    
    if (holding.totalQuantity > 0) {
      holding.averageBuyPrice = holding.totalCost / holding.totalQuantity;
    }

    if (holding.currentPrice) {
      holding.marketValue = holding.totalQuantity * holding.currentPrice;
      holding.unrealizedGainLoss = holding.marketValue - holding.totalCost;
      holding.unrealizedGainLossPercent = 
        holding.totalCost > 0 
          ? (holding.unrealizedGainLoss / holding.totalCost) * 100 
          : 0;
    }
  }

  return holdings;
}

/**
 * Calculates total realized gain/loss from all sold lots
 * If portfolioData is provided, uses actual sales proceeds and deducts commission
 */
export function calculateRealizedGainLoss(
  lots: Lot[],
  portfolioData?: Record<string, { salesCommission: number; salesProceeds: number }>
): {
  totalRealizedGainLoss: number;
  totalProceeds: number;
  totalCostBasis: number;
  totalCommission: number;
  bySecurity: Record<string, number>;
} {
  const bySecurity: Record<string, {
    realizedGainLoss: number;
    proceeds: number;
    costBasis: number;
    commission: number;
  }> = {};
  
  let total = 0;
  let totalProceeds = 0;
  let totalCostBasis = 0;
  let totalCommission = 0;

  // First, calculate from lots (without commission)
  for (const lot of lots) {
    for (const sellMatch of lot.sellOrders) {
      const proceeds = sellMatch.proceeds;
      const costBasis = sellMatch.quantity * lot.buyPrice;
      const gainLoss = sellMatch.gainLoss;
      
      if (!bySecurity[lot.security]) {
        bySecurity[lot.security] = {
          realizedGainLoss: 0,
          proceeds: 0,
          costBasis: 0,
          commission: 0,
        };
      }
      
      bySecurity[lot.security].realizedGainLoss += gainLoss;
      bySecurity[lot.security].proceeds += proceeds;
      bySecurity[lot.security].costBasis += costBasis;
    }
  }

  // If portfolio data is provided, adjust for commission and use actual proceeds
  if (portfolioData) {
    for (const security in portfolioData) {
      const data = portfolioData[security];
      if (bySecurity[security]) {
        // Use actual sales proceeds from Portfolio CSV
        const actualProceeds = data.salesProceeds;
        const commission = data.salesCommission;
        
        // Recalculate realized gain/loss: Proceeds - Cost Basis - Commission
        bySecurity[security].proceeds = actualProceeds;
        bySecurity[security].commission = commission;
        bySecurity[security].realizedGainLoss = 
          actualProceeds - bySecurity[security].costBasis - commission;
      }
    }
  }

  // Sum up totals
  for (const security in bySecurity) {
    const data = bySecurity[security];
    total += data.realizedGainLoss;
    totalProceeds += data.proceeds;
    totalCostBasis += data.costBasis;
    totalCommission += data.commission;
  }

  return { 
    totalRealizedGainLoss: total, 
    totalProceeds,
    totalCostBasis,
    totalCommission,
    bySecurity: Object.fromEntries(
      Object.entries(bySecurity).map(([sec, data]) => [sec, data.realizedGainLoss])
    ),
  };
}

/**
 * Verifies SELL orders are properly matched and identifies any gaps
 */
export function verifySellOrders(lots: Lot[], orders: Order[]): {
  allSellOrders: Order[];
  matchedSells: number;
  unmatchedSells: Order[];
  totalSellProceeds: number;
  totalCostBasis: number;
  expectedRealizedGainLoss: number;
  bySecurity: Record<string, {
    sellOrders: Order[];
    matched: number;
    unmatched: number;
  }>;
} {
  const allSellOrders = orders.filter(o => o.side === 'SELL');
  const matchedOrderIds = new Set<string>();
  const bySecurity: Record<string, {
    sellOrders: Order[];
    matched: number;
    unmatched: number;
  }> = {};

  // Find all matched sell orders
  for (const lot of lots) {
    for (const sellMatch of lot.sellOrders) {
      matchedOrderIds.add(sellMatch.sellOrderId);
    }
  }

  // Categorize sell orders
  for (const sellOrder of allSellOrders) {
    if (!bySecurity[sellOrder.security]) {
      bySecurity[sellOrder.security] = {
        sellOrders: [],
        matched: 0,
        unmatched: 0,
      };
    }
    bySecurity[sellOrder.security].sellOrders.push(sellOrder);
    
    if (matchedOrderIds.has(sellOrder.id)) {
      bySecurity[sellOrder.security].matched++;
    } else {
      bySecurity[sellOrder.security].unmatched++;
    }
  }

  const matchedSells = matchedOrderIds.size;
  const unmatchedSells = allSellOrders.filter(o => !matchedOrderIds.has(o.id));

  // Log unmatched SELL orders for debugging
  if (unmatchedSells.length > 0) {
    console.warn(`Found ${unmatchedSells.length} unmatched SELL orders:`, unmatchedSells.map(o => ({
      security: o.security,
      qty: o.orderQty,
      price: o.orderPrice,
      date: o.orderDate,
      id: o.id,
    })));
  }

  // Calculate totals from matched orders
  let totalSellProceeds = 0;
  let totalCostBasis = 0;

  for (const lot of lots) {
    for (const sellMatch of lot.sellOrders) {
      totalSellProceeds += sellMatch.proceeds;
      totalCostBasis += sellMatch.quantity * lot.buyPrice;
    }
  }

  return {
    allSellOrders,
    matchedSells,
    unmatchedSells,
    totalSellProceeds,
    totalCostBasis,
    expectedRealizedGainLoss: totalSellProceeds - totalCostBasis,
    bySecurity,
  };
}
