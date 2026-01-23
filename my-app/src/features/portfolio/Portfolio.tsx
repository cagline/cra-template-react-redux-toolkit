import React, { useCallback, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setOrders,
  setLoading,
  setError,
  selectOrders,
  selectLots,
  selectHoldings,
  selectCurrentPrices,
  selectPortfolioLoading,
  selectPortfolioError,
  selectStockSplits,
  setCurrentPrice,
  addStockSplit,
  removeStockSplit,
  setStockSplits,
} from './portfolioSlice';
import { parseOrderTrackerCSV } from './utils/csvParser';
import { calculateRealizedGainLoss } from './utils/lotTracker';
import type { Order, Lot, StockSplit } from './types';

const Portfolio: React.FC = () => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const lots = useAppSelector(selectLots);
  const holdings = useAppSelector(selectHoldings);
  const currentPrices = useAppSelector(selectCurrentPrices);
  const stockSplits = useAppSelector(selectStockSplits);
  const isLoading = useAppSelector(selectPortfolioLoading);
  const error = useAppSelector(selectPortfolioError);

  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [selectedSecurity, setSelectedSecurity] = useState<string>('');
  const [priceInput, setPriceInput] = useState<string>('');
  const [splitDialogOpen, setSplitDialogOpen] = useState(false);
  const [newSplit, setNewSplit] = useState({
    security: '',
    splitDate: '',
    splitDateTime: '',
    ratio: 1,
  });

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        const text = await file.text();
        const parsedOrders = parseOrderTrackerCSV(text);
        dispatch(setOrders(parsedOrders));
      } catch (err) {
        dispatch(setError(err instanceof Error ? err.message : 'Failed to parse CSV file'));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const handlePriceUpdate = () => {
    const price = parseFloat(priceInput);
    if (!isNaN(price) && price > 0) {
      dispatch(setCurrentPrice({ security: selectedSecurity, price }));
      setPriceDialogOpen(false);
      setPriceInput('');
      setSelectedSecurity('');
    }
  };

  const handleAddStockSplit = () => {
    if (newSplit.security && newSplit.splitDate && newSplit.ratio > 0) {
      const split: StockSplit = {
        id: `split-${Date.now()}`,
        security: newSplit.security,
        splitDate: newSplit.splitDate,
        splitDateTime: newSplit.splitDateTime || `${newSplit.splitDate} 00:00:00`,
        ratio: newSplit.ratio,
      };
      
      dispatch(addStockSplit(split));
      setSplitDialogOpen(false);
      setNewSplit({ security: '', splitDate: '', splitDateTime: '', ratio: 1 });
    }
  };

  // Load stock splits from localStorage on mount
  useEffect(() => {
    const savedSplits = localStorage.getItem('portfolio_stockSplits');
    if (savedSplits) {
      try {
        const parsed = JSON.parse(savedSplits);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch(setStockSplits(parsed));
        }
      } catch (e) {
        console.error('Failed to load saved stock splits', e);
      }
    }
  }, [dispatch]);

  // Save stock splits to localStorage whenever they change
  useEffect(() => {
    if (stockSplits.length > 0) {
      localStorage.setItem('portfolio_stockSplits', JSON.stringify(stockSplits));
    } else {
      localStorage.removeItem('portfolio_stockSplits');
    }
  }, [stockSplits]);

  const realizedGainLoss = calculateRealizedGainLoss(lots);
  const holdingsArray = Object.values(holdings).sort((a, b) =>
    a.security.localeCompare(b.security)
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Stock Portfolio Analysis
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Upload your Order Tracker CSV from ATrad to analyze gain/loss per individual lot
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Stock Splits:</strong> You can manually add stock splits below. The system will
          automatically adjust quantities and prices for all orders before the split date.
        </Typography>
      </Alert>

      {/* CSV Upload Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box
              component="input"
              accept=".csv"
              sx={{ display: 'none' }}
              id="csv-upload-input"
              type="file"
              onChange={handleFileUpload}
              disabled={isLoading}
            />
            <label htmlFor="csv-upload-input">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={20} /> : 'Upload Order Tracker CSV'}
              </Button>
            </label>
            {orders.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                {orders.length} orders loaded
              </Typography>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {orders.length === 0 && !error && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Please upload your Order Tracker CSV file to begin analysis. The file should be
              exported from ATrad broker platform.
            </Alert>
          )}
        </CardContent>
      </Card>

      {orders.length > 0 && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Orders
                  </Typography>
                  <Typography variant="h4">{orders.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Lots
                  </Typography>
                  <Typography variant="h4">{lots.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Realized Gain/Loss
                  </Typography>
                  <Typography
                    variant="h4"
                    color={realizedGainLoss.totalRealizedGainLoss >= 0 ? 'success.main' : 'error.main'}
                  >
                    {realizedGainLoss.totalRealizedGainLoss >= 0 ? '+' : ''}
                    {realizedGainLoss.totalRealizedGainLoss.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Holdings Overview */}
          {holdingsArray.length > 0 && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Current Holdings</Typography>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Security</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Avg Buy Price</TableCell>
                        <TableCell align="right">Total Cost</TableCell>
                        <TableCell align="right">Current Price</TableCell>
                        <TableCell align="right">Market Value</TableCell>
                        <TableCell align="right">Unrealized G/L</TableCell>
                        <TableCell align="right">Unrealized G/L %</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {holdingsArray.map((holding) => (
                        <TableRow key={holding.security}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {holding.security}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{holding.totalQuantity}</TableCell>
                          <TableCell align="right">
                            {holding.averageBuyPrice.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            {holding.totalCost.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell align="right">
                            {holding.currentPrice ? (
                              holding.currentPrice.toFixed(2)
                            ) : (
                              <Chip label="Not Set" size="small" color="warning" />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {holding.marketValue
                              ? holding.marketValue.toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                              : '-'}
                          </TableCell>
                          <TableCell align="right">
                            {holding.unrealizedGainLoss !== undefined ? (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'flex-end',
                                  gap: 0.5,
                                  color:
                                    holding.unrealizedGainLoss >= 0
                                      ? 'success.main'
                                      : 'error.main',
                                }}
                              >
                                {holding.unrealizedGainLoss >= 0 ? (
                                  <TrendingUpIcon fontSize="small" />
                                ) : (
                                  <TrendingDownIcon fontSize="small" />
                                )}
                                {holding.unrealizedGainLoss >= 0 ? '+' : ''}
                                {holding.unrealizedGainLoss.toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </Box>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {holding.unrealizedGainLossPercent !== undefined ? (
                              <Chip
                                label={`${holding.unrealizedGainLossPercent >= 0 ? '+' : ''}${holding.unrealizedGainLossPercent.toFixed(2)}%`}
                                size="small"
                                color={
                                  holding.unrealizedGainLossPercent >= 0 ? 'success' : 'error'
                                }
                              />
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setSelectedSecurity(holding.security);
                                setPriceInput(holding.currentPrice?.toString() || '');
                                setPriceDialogOpen(true);
                              }}
                            >
                              Set Price
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* Lot-wise Analysis */}
          <LotWiseAnalysis 
            lots={lots} 
            holdings={holdings} 
            stockSplits={stockSplits}
            onAddSplit={(security) => {
              setNewSplit({ 
                security, 
                splitDate: '', 
                splitDateTime: '', 
                ratio: 1 
              });
              setSplitDialogOpen(true);
            }}
            onRemoveSplit={(splitId) => {
              dispatch(removeStockSplit(splitId));
            }}
          />
        </>
      )}

      {/* Price Update Dialog */}
      <Dialog open={priceDialogOpen} onClose={() => setPriceDialogOpen(false)}>
        <DialogTitle>Update Current Price</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={`Current Price for ${selectedSecurity}`}
            type="number"
            fullWidth
            variant="outlined"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            inputProps={{ step: '0.01', min: '0' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPriceDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePriceUpdate} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock Split Dialog */}
      <Dialog open={splitDialogOpen} onClose={() => setSplitDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Stock Split</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              autoFocus
              label="Security"
              value={newSplit.security}
              onChange={(e) => setNewSplit({ ...newSplit, security: e.target.value.toUpperCase() })}
              fullWidth
              placeholder="e.g., ACL.N0000"
              helperText="Enter the stock symbol"
            />
            <TextField
              label="Split Date"
              type="date"
              value={newSplit.splitDate}
              onChange={(e) => {
                const date = e.target.value;
                setNewSplit({
                  ...newSplit,
                  splitDate: date,
                  splitDateTime: date ? `${date} 00:00:00` : '',
                });
              }}
              fullWidth
              InputLabelProps={{ shrink: true }}
              helperText="Date when the stock split occurred"
            />
            <TextField
              label="Split Ratio"
              type="number"
              value={newSplit.ratio}
              onChange={(e) =>
                setNewSplit({ ...newSplit, ratio: parseFloat(e.target.value) || 1 })
              }
              fullWidth
              inputProps={{ step: 0.1, min: 0.1 }}
              helperText="e.g., 3 for 3:1 split (3 shares for every 1), 0.5 for 1:2 reverse split"
            />
            <Alert severity="info">
              <Typography variant="body2">
                <strong>How it works:</strong> For a 3:1 split, quantities are multiplied by 3 and
                prices are divided by 3. All orders before the split date will be adjusted
                automatically.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSplitDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddStockSplit}
            variant="contained"
            disabled={!newSplit.security || !newSplit.splitDate || newSplit.ratio <= 0}
          >
            Add Split
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// Lot-wise Analysis Component
const LotWiseAnalysis: React.FC<{
  lots: Lot[];
  holdings: Record<string, SecurityHolding>;
  stockSplits: StockSplit[];
  onAddSplit: (security: string) => void;
  onRemoveSplit: (splitId: string) => void;
}> = ({ lots, holdings, stockSplits, onAddSplit, onRemoveSplit }) => {
  const holdingsArray = Object.values(holdings).sort((a, b) =>
    a.security.localeCompare(b.security)
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Lot-wise Gain/Loss Analysis
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Each BUY order is tracked as a separate lot. SELL orders are matched using FIFO method.
        </Typography>

        {holdingsArray.map((holding) => {
          // Get stock splits for this security
          const securitySplits = stockSplits
            .filter(split => split.security === holding.security)
            .sort((a, b) => new Date(a.splitDateTime).getTime() - new Date(b.splitDateTime).getTime());

          return (
            <Box key={holding.security} sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'primary.main' }}>
                  {holding.security}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => onAddSplit(holding.security)}
                >
                  Add Split
                </Button>
              </Box>

              {/* Stock Splits for this security */}
              {securitySplits.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                    Stock Splits Applied:
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Split Date</TableCell>
                          <TableCell align="right">Ratio</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {securitySplits.map((split) => (
                          <TableRow key={split.id}>
                            <TableCell>{split.splitDate}</TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={`${split.ratio}:1`} 
                                size="small" 
                                color="primary" 
                                variant="outlined" 
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Button
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => onRemoveSplit(split.id)}
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Buy Date</TableCell>
                    <TableCell align="right">Buy Price</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Remaining</TableCell>
                    <TableCell align="right">Total Cost</TableCell>
                    <TableCell align="right">Sell Details</TableCell>
                    <TableCell align="right">Realized G/L</TableCell>
                    <TableCell align="right">Unrealized G/L</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {holding.lots.map((lot) => {
                    const totalRealizedGainLoss = lot.sellOrders.reduce(
                      (sum, sell) => sum + sell.gainLoss,
                      0
                    );
                    const currentPrice = holdings[lot.security]?.currentPrice;
                    const unrealizedGainLoss =
                      currentPrice && lot.remainingQuantity > 0
                        ? lot.remainingQuantity * (currentPrice - lot.buyPrice)
                        : undefined;

                    return (
                      <TableRow key={lot.id}>
                        <TableCell>
                          {lot.buyDate}
                          {lot.splitRatio && lot.splitRatio !== 1 && (
                            <Chip
                              label={`${lot.splitRatio.toFixed(2)}x split`}
                              size="small"
                              color="info"
                              sx={{ ml: 1 }}
                              title={`Adjusted for stock split(s). Original: ${lot.originalQuantity} @ ${lot.originalBuyPrice?.toFixed(2)}`}
                            />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Box>
                            {lot.buyPrice.toFixed(2)}
                            {lot.originalBuyPrice && lot.originalBuyPrice !== lot.buyPrice && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                                sx={{ fontSize: '0.7rem' }}
                              >
                                (was {lot.originalBuyPrice.toFixed(2)})
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Box>
                            {lot.quantity.toFixed(0)}
                            {lot.originalQuantity && lot.originalQuantity !== lot.quantity && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                                sx={{ fontSize: '0.7rem' }}
                              >
                                (was {lot.originalQuantity})
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {lot.remainingQuantity > 0 ? (
                            <Chip
                              label={lot.remainingQuantity}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ) : (
                            <Chip label="Sold" size="small" color="default" />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {lot.totalCost.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell align="right">
                          {lot.sellOrders.length > 0 ? (
                            <Box>
                              {lot.sellOrders.map((sell, idx) => (
                                <Box
                                  key={idx}
                                  sx={{
                                    mb: 0.5,
                                    fontSize: '0.75rem',
                                    color: 'text.secondary',
                                  }}
                                >
                                  {sell.quantity} @ {sell.sellPrice.toFixed(2)} on {sell.sellDate}
                                  <Chip
                                    label={`${sell.gainLoss >= 0 ? '+' : ''}${sell.gainLoss.toFixed(2)} (${sell.gainLossPercent >= 0 ? '+' : ''}${sell.gainLossPercent.toFixed(2)}%)`}
                                    size="small"
                                    color={sell.gainLoss >= 0 ? 'success' : 'error'}
                                    sx={{ ml: 1 }}
                                  />
                                </Box>
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Not sold
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {totalRealizedGainLoss !== 0 ? (
                            <Chip
                              label={`${totalRealizedGainLoss >= 0 ? '+' : ''}${totalRealizedGainLoss.toFixed(2)}`}
                              size="small"
                              color={totalRealizedGainLoss >= 0 ? 'success' : 'error'}
                            />
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {unrealizedGainLoss !== undefined ? (
                            <Chip
                              label={`${unrealizedGainLoss >= 0 ? '+' : ''}${unrealizedGainLoss.toFixed(2)}`}
                              size="small"
                              color={unrealizedGainLoss >= 0 ? 'success' : 'error'}
                              variant="outlined"
                            />
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default Portfolio;
