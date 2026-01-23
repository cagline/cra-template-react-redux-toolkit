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
 */
export function calculateRealizedGainLoss(lots: Lot[]): {
  totalRealizedGainLoss: number;
  bySecurity: Record<string, number>;
} {
  const bySecurity: Record<string, number> = {};
  let total = 0;

  for (const lot of lots) {
    for (const sellMatch of lot.sellOrders) {
      const gainLoss = sellMatch.gainLoss;
      total += gainLoss;
      
      if (!bySecurity[lot.security]) {
        bySecurity[lot.security] = 0;
      }
      bySecurity[lot.security] += gainLoss;
    }
  }

  return { totalRealizedGainLoss: total, bySecurity };
}
