import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../store/store';
import type { Order, Lot, SecurityHolding, StockSplit, ActionPriceRange } from './types';
import { processOrdersIntoLots, calculateHoldings } from './utils/lotTracker';

export interface PortfolioState {
  orders: Order[];
  lots: Lot[];
  holdings: Record<string, SecurityHolding>;
  currentPrices: Record<string, number>;
  stockSplits: StockSplit[];
  actionPriceRanges: Record<string, ActionPriceRange>;
  isLoading: boolean;
  error: string | null;
}

const initialState: PortfolioState = {
  orders: [],
  lots: [],
  holdings: {},
  currentPrices: {},
  stockSplits: [],
  actionPriceRanges: {},
  isLoading: false,
  error: null,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
      state.lots = processOrdersIntoLots(action.payload, state.stockSplits);
      state.holdings = calculateHoldings(state.lots, state.currentPrices);
      state.error = null;
    },
    setCurrentPrice: (
      state,
      action: PayloadAction<{ security: string; price: number }>
    ) => {
      state.currentPrices[action.payload.security] = action.payload.price;
      state.holdings = calculateHoldings(state.lots, state.currentPrices);
    },
    setCurrentPrices: (state, action: PayloadAction<Record<string, number>>) => {
      state.currentPrices = { ...state.currentPrices, ...action.payload };
      state.holdings = calculateHoldings(state.lots, state.currentPrices);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addStockSplit: (state, action: PayloadAction<StockSplit>) => {
      state.stockSplits.push(action.payload);
      // Reprocess lots with new split
      state.lots = processOrdersIntoLots(state.orders, state.stockSplits);
      state.holdings = calculateHoldings(state.lots, state.currentPrices);
    },
    removeStockSplit: (state, action: PayloadAction<string>) => {
      state.stockSplits = state.stockSplits.filter(s => s.id !== action.payload);
      // Reprocess lots without removed split
      state.lots = processOrdersIntoLots(state.orders, state.stockSplits);
      state.holdings = calculateHoldings(state.lots, state.currentPrices);
    },
    setStockSplits: (state, action: PayloadAction<StockSplit[]>) => {
      state.stockSplits = action.payload;
      // Reprocess lots with updated splits
      state.lots = processOrdersIntoLots(state.orders, state.stockSplits);
      state.holdings = calculateHoldings(state.lots, state.currentPrices);
    },
    setActionPriceRanges: (state, action: PayloadAction<Record<string, ActionPriceRange>>) => {
      state.actionPriceRanges = action.payload;
    },
    clearPortfolio: (state) => {
      state.orders = [];
      state.lots = [];
      state.holdings = {};
      state.currentPrices = {};
      state.stockSplits = [];
      state.actionPriceRanges = {};
      state.error = null;
    },
  },
});

export const {
  setOrders,
  setCurrentPrice,
  setCurrentPrices,
  setLoading,
  setError,
  addStockSplit,
  removeStockSplit,
  setStockSplits,
  setActionPriceRanges,
  clearPortfolio,
} = portfolioSlice.actions;

// Selectors
export const selectOrders = (state: RootState) => state.portfolio.orders;
export const selectLots = (state: RootState) => state.portfolio.lots;
export const selectHoldings = (state: RootState) => state.portfolio.holdings;
export const selectCurrentPrices = (state: RootState) => state.portfolio.currentPrices;
export const selectPortfolioLoading = (state: RootState) => state.portfolio.isLoading;
export const selectPortfolioError = (state: RootState) => state.portfolio.error;
export const selectStockSplits = (state: RootState) => state.portfolio.stockSplits;
export const selectActionPriceRanges = (state: RootState) => state.portfolio.actionPriceRanges;

export default portfolioSlice.reducer;
