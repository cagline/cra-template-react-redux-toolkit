# Portfolio Analysis Feature

## Overview
This feature provides lot-wise gain/loss analysis for stock portfolios imported from ATrad broker platform (CAL Sri Lanka).

## Features

### 1. CSV Import
- Upload Order Tracker CSV files exported from ATrad
- Automatically parses and validates order data
- Filters only FILLED orders (Remaining Qty = 0)
- Handles multiple orders with same Exchange Order Id

### 2. Lot Tracking
- Each BUY order creates a separate lot
- SELL orders are matched to BUY lots using FIFO (First In First Out) method
- Tracks remaining quantity per lot
- Calculates realized gain/loss for each sell transaction

### 3. Portfolio Analysis
- **Holdings Overview**: Shows current holdings with average buy price, total cost, and unrealized gain/loss
- **Lot-wise Analysis**: Detailed view of each lot with:
  - Buy date and price
  - Quantity and remaining quantity
  - Sell transaction details
  - Realized gain/loss per sell
  - Unrealized gain/loss for remaining holdings

### 4. Current Price Management
- Manually set current prices for securities
- Automatically calculates unrealized gain/loss when prices are set
- Market value calculation based on current prices

## Data Processing Logic

### Order Processing
1. CSV is parsed and validated
2. Only FILLED orders with Remaining Qty = 0 are processed
3. For orders with same Exchange Order Id, only the complete fill is processed
4. Orders are sorted chronologically

### Lot Matching (FIFO)
- BUY orders create new lots
- SELL orders are matched to oldest available lots first
- Partial sells are supported (lot quantity is reduced)
- Multiple sells can be matched to the same lot

### Gain/Loss Calculation
- **Realized G/L**: Calculated when SELL orders are matched to BUY lots
  - Formula: `(Sell Price - Buy Price) × Quantity`
- **Unrealized G/L**: Calculated for remaining holdings
  - Formula: `(Current Price - Buy Price) × Remaining Quantity`

## Stock Splits

**Note**: Stock splits are not automatically handled in the current version. If a security has undergone a stock split:

1. The quantity and prices in the CSV may reflect post-split values
2. Historical orders before the split may need manual adjustment
3. Consider adding a stock split adjustment feature in future versions

**Workaround**: 
- If your CSV data already reflects post-split values, the analysis will work correctly
- For historical accuracy, you may need to manually adjust pre-split orders

## Usage

1. Navigate to `/portfolio` route
2. Click "Upload Order Tracker CSV"
3. Select your exported CSV file from ATrad
4. View holdings overview and lot-wise analysis
5. Optionally set current prices to see unrealized gain/loss

## CSV Format Requirements

The CSV should have the following columns (from ATrad Order Tracker export):
- Security
- Side (BUY/SELL)
- Order Qty
- Order Price
- Order Value
- Order Status
- Remaining Qty
- Filled Qty
- Order Date and Time
- Exchange Order Id

## Technical Details

### State Management
- Uses Redux Toolkit for state management
- Portfolio slice manages orders, lots, holdings, and current prices

### Components
- `Portfolio.tsx`: Main component with CSV upload and analysis views
- `LotWiseAnalysis`: Sub-component for detailed lot breakdown

### Utilities
- `csvParser.ts`: Parses ATrad CSV format
- `lotTracker.ts`: Processes orders into lots and calculates holdings
