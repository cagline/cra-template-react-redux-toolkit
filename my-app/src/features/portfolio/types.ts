export type Order = {
  id: string;
  security: string;
  side: 'BUY' | 'SELL';
  orderQty: number;
  orderPrice: number;
  orderValue: number;
  orderDate: string;
  orderTime: string;
  orderDateTime: string;
  exchangeOrderId: string;
  filledQty: number;
  remainingQty: number;
  orderStatus: string;
};

export type Lot = {
  id: string;
  security: string;
  buyOrderId: string;
  buyDate: string;
  buyPrice: number; // Adjusted price (after splits)
  quantity: number; // Adjusted quantity (after splits)
  remainingQuantity: number;
  totalCost: number;
  sellOrders: SellMatch[];
  originalBuyPrice?: number; // Original price before splits
  originalQuantity?: number; // Original quantity before splits
  splitRatio?: number; // Cumulative split ratio applied
};

export type SellMatch = {
  sellOrderId: string;
  sellDate: string;
  sellPrice: number;
  quantity: number;
  proceeds: number;
  gainLoss: number;
  gainLossPercent: number;
};

export type SecurityHolding = {
  security: string;
  totalQuantity: number;
  averageBuyPrice: number;
  totalCost: number;
  currentPrice?: number;
  marketValue?: number;
  unrealizedGainLoss?: number;
  unrealizedGainLossPercent?: number;
  lots: Lot[];
};

export type StockSplit = {
  id: string;
  security: string;
  splitDate: string; // Date when split occurred
  splitDateTime: string; // Full datetime
  ratio: number; // e.g., 3 for 3:1 split, 0.5 for 1:2 reverse split
};

export type PortfolioState = {
  orders: Order[];
  lots: Lot[];
  holdings: Record<string, SecurityHolding>;
  currentPrices: Record<string, number>;
  stockSplits: StockSplit[];
  isLoading: boolean;
  error: string | null;
};
