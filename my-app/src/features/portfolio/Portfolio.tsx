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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Description as MarkdownIcon,
  TableChart as CsvIcon,
  Code as JsonIcon,
  ShoppingCart as BuyIcon,
  AddCircle as AccumulateIcon,
  PauseCircle as HoldIcon,
  RemoveCircle as TrimIcon,
  ExitToApp as ExitIcon,
  StopCircle as StopIcon,
  Psychology as AIIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setOrders,
  setError,
  selectOrders,
  selectLots,
  selectHoldings,
  selectCurrentPrices,
  selectPortfolioError,
  selectStockSplits,
  selectActionPriceRanges,
  setCurrentPrice,
  setCurrentPrices,
  addStockSplit,
  removeStockSplit,
  setStockSplits,
  setActionPriceRanges,
} from './portfolioSlice';
import { parseOrderTrackerCSV, parseWatchlistCSV, parsePortfolioCSV, parseActionPriceRangesCSV } from './utils/csvParser';
import { calculateRealizedGainLoss, verifySellOrders } from './utils/lotTracker';
import { exportToCSV, exportToMarkdown, exportToPDF } from './utils/exportUtils';
import { generateAllRecommendations } from './utils/recommendationEngine';
import { exportAIMetadata, exportAIMarkdown, exportAIMetadataForActionRanges } from './utils/aiMetadataExport';
import type { StockSplit, SecurityHolding } from './types';
import { usePageTitle } from '../../layouts/usePageTitle';

const Portfolio: React.FC = () => {
  const { setTitle } = usePageTitle();
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const lots = useAppSelector(selectLots);
  const holdings = useAppSelector(selectHoldings);
  const currentPrices = useAppSelector(selectCurrentPrices);
  const stockSplits = useAppSelector(selectStockSplits);
  const actionPriceRanges = useAppSelector(selectActionPriceRanges);
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
  const [portfolioData, setPortfolioData] = useState<Record<string, {
    salesCommission: number;
    salesProceeds: number;
    unrealizedGainLoss: number;
  }>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [aiExportMenuAnchor, setAiExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [uploading, setUploading] = useState({
    orders: false,
    watchlist: false,
    portfolio: false,
    actionRanges: false,
  });
  
  // Generate recommendations
  const recommendations = generateAllRecommendations(holdings, actionPriceRanges);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      dispatch(setError(null));
      setUploading(prev => ({ ...prev, orders: true }));

      try {
        const text = await file.text();
        const parsedOrders = parseOrderTrackerCSV(text);
        dispatch(setOrders(parsedOrders));
      } catch (err) {
        dispatch(setError(err instanceof Error ? err.message : 'Failed to parse CSV file'));
      } finally {
        setUploading(prev => ({ ...prev, orders: false }));
        event.target.value = '';
      }
    },
    [dispatch]
  );

  const handleWatchlistUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      dispatch(setError(null));
      setUploading(prev => ({ ...prev, watchlist: true }));

      try {
        const text = await file.text();
        const priceMap = parseWatchlistCSV(text);
        dispatch(setCurrentPrices(priceMap));
      } catch (err) {
        dispatch(setError(err instanceof Error ? err.message : 'Failed to parse Watchlist CSV file'));
      } finally {
        setUploading(prev => ({ ...prev, watchlist: false }));
        event.target.value = '';
      }
    },
    [dispatch]
  );

  const handlePortfolioUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      dispatch(setError(null));
      setUploading(prev => ({ ...prev, portfolio: true }));

      try {
        const text = await file.text();
        const data = parsePortfolioCSV(text);
        setPortfolioData(data);
      } catch (err) {
        dispatch(setError(err instanceof Error ? err.message : 'Failed to parse Portfolio CSV file'));
      } finally {
        setUploading(prev => ({ ...prev, portfolio: false }));
        event.target.value = '';
      }
    },
    [dispatch]
  );

  const handleActionPriceRangesUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      dispatch(setError(null));
      setUploading(prev => ({ ...prev, actionRanges: true }));

      try {
        const text = await file.text();
        const ranges = parseActionPriceRangesCSV(text);
        dispatch(setActionPriceRanges(ranges));
      } catch (err) {
        dispatch(setError(err instanceof Error ? err.message : 'Failed to parse Action Price Ranges CSV file'));
      } finally {
        setUploading(prev => ({ ...prev, actionRanges: false }));
        event.target.value = '';
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

  useEffect(() => {
    setTitle('Stock Portfolio Analysis');
    return () => setTitle(null);
  }, [setTitle]);

  const realizedGainLoss = calculateRealizedGainLoss(lots, portfolioData);
  const verification = verifySellOrders(lots, orders);
  const holdingsArray = Object.values(holdings).sort((a, b) =>
    a.security.localeCompare(b.security)
  );
  
  // Calculate total unrealized gain/loss from all holdings (using current prices from Watchlist)
  const totalUnrealizedGainLoss = holdingsArray.reduce(
    (sum, holding) => sum + (holding.unrealizedGainLoss || 0),
    0
  );
  const totalPortfolioValue = holdingsArray.reduce((sum, h) => sum + (h.marketValue || 0), 0);

  return (
    <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 }, maxWidth: '1920px', width: '100%' }}>
      {/* CSV Upload Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Upload Files
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            {/* Order Tracker Upload */}
            <Box>
              <Box
                component="input"
                accept=".csv"
                sx={{ display: 'none' }}
                id="csv-upload-input"
                type="file"
                onChange={handleFileUpload}
                disabled={uploading.orders}
              />
              <label htmlFor="csv-upload-input">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploading.orders}
                >
                  {uploading.orders ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={18} />
                      Uploading...
                    </Box>
                  ) : (
                    'Upload Order Tracker CSV'
                  )}
                </Button>
              </label>
            </Box>

            {/* Watchlist Upload */}
            <Box>
              <Box
                component="input"
                accept=".csv"
                sx={{ display: 'none' }}
                id="watchlist-upload-input"
                type="file"
                onChange={handleWatchlistUpload}
                disabled={uploading.watchlist}
              />
              <label htmlFor="watchlist-upload-input">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploading.watchlist}
                  color="secondary"
                >
                  {uploading.watchlist ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={18} />
                      Uploading...
                    </Box>
                  ) : (
                    'Upload Watchlist CSV (Update Prices)'
                  )}
                </Button>
              </label>
            </Box>

            {/* Portfolio CSV Upload */}
            <Box>
              <Box
                component="input"
                accept=".csv"
                sx={{ display: 'none' }}
                id="portfolio-upload-input"
                type="file"
                onChange={handlePortfolioUpload}
                disabled={uploading.portfolio}
              />
              <label htmlFor="portfolio-upload-input">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploading.portfolio}
                  color="info"
                >
                  {uploading.portfolio ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={18} />
                      Uploading...
                    </Box>
                  ) : (
                    'Upload Portfolio CSV'
                  )}
                </Button>
              </label>
            </Box>

            {/* Action Price Ranges Upload (Optional - for AI-generated CSV) */}
            <Box>
              <Box
                component="input"
                accept=".csv"
                sx={{ display: 'none' }}
                id="action-ranges-upload-input"
                type="file"
                onChange={handleActionPriceRangesUpload}
                disabled={uploading.actionRanges}
              />
              <label htmlFor="action-ranges-upload-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploading.actionRanges}
                  color="success"
                  size="small"
                >
                  {uploading.actionRanges ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={18} />
                      Uploading...
                    </Box>
                  ) : (
                    'Upload AI-Generated Action Ranges CSV'
                  )}
                </Button>
              </label>
            </Box>

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

          {/* Show success message when prices are loaded */}
          {Object.keys(currentPrices).length > 0 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Current prices loaded for {Object.keys(currentPrices).length} securities
            </Alert>
          )}

          {/* Show success message when portfolio data is loaded */}
          {Object.keys(portfolioData).length > 0 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Portfolio data loaded for {Object.keys(portfolioData).length} securities (commission & proceeds)
            </Alert>
          )}

          {/* Show success message when action price ranges are loaded */}
          {Object.keys(actionPriceRanges).length > 0 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Action price ranges loaded for {Object.keys(actionPriceRanges).length} securities. {Object.keys(recommendations).length} recommendations generated.
            </Alert>
          )}

          {/* Verification Results */}
          {orders.length > 0 && verification.unmatchedSells.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Warning: {verification.unmatchedSells.length} unmatched SELL orders found
              </Typography>
              <Typography variant="caption" component="div">
                {verification.unmatchedSells.slice(0, 5).map((order, idx) => (
                  <div key={idx}>
                    {order.security}: {order.orderQty} @ {order.orderPrice} on {order.orderDate}
                  </div>
                ))}
                {verification.unmatchedSells.length > 5 && (
                  <div>... and {verification.unmatchedSells.length - 5} more</div>
                )}
              </Typography>
            </Alert>
          )}

          {orders.length === 0 && !error && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2" component="div">
                <div>
                  Upload your Order Tracker CSV from ATrad to analyze gain/loss per individual lot.
                </div>
                <div>
                  Upload your Portfolio Watchlist (latest prices) CSV to analyze unrealized gain/loss.
                </div>
                <div>
                  Upload your Portfolio CSV (commission data) to analyze realized gain/loss.
                </div>
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {orders.length > 0 && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Orders
                  </Typography>
                  <Typography variant="h4">{orders.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Lots
                  </Typography>
                  <Typography variant="h4">{lots.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
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
                  {realizedGainLoss.totalCommission > 0 && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      Commission: {realizedGainLoss.totalCommission.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  )}
                  {verification.unmatchedSells.length > 0 && (
                    <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 0.5 }}>
                      {verification.unmatchedSells.length} unmatched sells
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Unrealized Gain/Loss
                    {Object.keys(currentPrices).length > 0 && (
                      <Chip 
                        label="Live" 
                        size="small" 
                        color="success" 
                        sx={{ ml: 1, height: 18, fontSize: '0.65rem' }}
                      />
                    )}
                  </Typography>
                  <Typography
                    variant="h4"
                    color={totalUnrealizedGainLoss >= 0 ? 'success.main' : 'error.main'}
                  >
                    {totalUnrealizedGainLoss >= 0 ? '+' : ''}
                    {totalUnrealizedGainLoss.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                  {Object.keys(currentPrices).length === 0 && (
                    <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 0.5 }}>
                      Upload Watchlist CSV for current prices
                    </Typography>
                  )}
                  {Object.keys(currentPrices).length > 0 && holdingsArray.length > 0 && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      Based on {Object.keys(currentPrices).length} current prices
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Verification Section */}
          {orders.length > 0 && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Verification & Debug Info
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total SELL Orders: {verification.allSellOrders.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Matched: {verification.matchedSells}
                    </Typography>
                    <Typography variant="body2" color={verification.unmatchedSells.length > 0 ? 'warning.main' : 'text.secondary'}>
                      Unmatched: {verification.unmatchedSells.length}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Sell Proceeds: {verification.totalSellProceeds.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Cost Basis: {verification.totalCostBasis.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                    {realizedGainLoss.totalCommission > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Total Commission: {realizedGainLoss.totalCommission.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
                {verification.unmatchedSells.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="warning.main" gutterBottom>
                      Unmatched SELL Orders (may indicate missing BUY orders or data issues):
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Security</TableCell>
                            <TableCell align="right">Qty</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell>Date</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {verification.unmatchedSells.slice(0, 10).map((order, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{order.security}</TableCell>
                              <TableCell align="right">{order.orderQty}</TableCell>
                              <TableCell align="right">{order.orderPrice.toFixed(2)}</TableCell>
                              <TableCell>{order.orderDate}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {verification.unmatchedSells.length > 10 && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                        ... and {verification.unmatchedSells.length - 10} more unmatched orders
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Holdings Overview */}
          {holdingsArray.length > 0 && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                  <Typography variant="h6">Current Holdings</Typography>
                  {holdingsArray.length > 0 && (
                    <Button
                      variant="outlined"
                      startIcon={<AIIcon />}
                      onClick={(e) => setAiExportMenuAnchor(e.currentTarget)}
                      color="secondary"
                    >
                      Export for AI
                    </Button>
                  )}
                  <Menu
                    anchorEl={aiExportMenuAnchor}
                    open={Boolean(aiExportMenuAnchor)}
                    onClose={() => setAiExportMenuAnchor(null)}
                  >
                    <MenuItem onClick={() => {
                      const metadata = exportAIMetadataForActionRanges(holdings, totalPortfolioValue);
                      const blob = new Blob([metadata], { type: 'application/json' });
                      const link = document.createElement('a');
                      const url = URL.createObjectURL(blob);
                      link.setAttribute('href', url);
                      link.setAttribute('download', `portfolio-action-ranges-request-${new Date().toISOString().split('T')[0]}.json`);
                      link.style.visibility = 'hidden';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      setAiExportMenuAnchor(null);
                    }}>
                      <JsonIcon sx={{ mr: 1 }} fontSize="small" />
                      Request AI: Generate Action Price Ranges CSV
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => {
                      const metadata = exportAIMetadata(holdings, recommendations, actionPriceRanges, totalPortfolioValue);
                      const blob = new Blob([metadata], { type: 'application/json' });
                      const link = document.createElement('a');
                      const url = URL.createObjectURL(blob);
                      link.setAttribute('href', url);
                      link.setAttribute('download', `portfolio-ai-metadata-${new Date().toISOString().split('T')[0]}.json`);
                      link.style.visibility = 'hidden';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      setAiExportMenuAnchor(null);
                    }}>
                      <JsonIcon sx={{ mr: 1 }} fontSize="small" />
                      Export Portfolio Analysis (JSON with Lot Details)
                    </MenuItem>
                    <MenuItem onClick={() => {
                      const markdown = exportAIMarkdown(holdings, recommendations, actionPriceRanges, totalPortfolioValue);
                      const blob = new Blob([markdown], { type: 'text/markdown' });
                      const link = document.createElement('a');
                      const url = URL.createObjectURL(blob);
                      link.setAttribute('href', url);
                      link.setAttribute('download', `portfolio-ai-analysis-${new Date().toISOString().split('T')[0]}.md`);
                      link.style.visibility = 'hidden';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      setAiExportMenuAnchor(null);
                    }}>
                      <MarkdownIcon sx={{ mr: 1 }} fontSize="small" />
                      Export Full Analysis (Markdown)
                    </MenuItem>
                  </Menu>
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
                        <TableCell align="center">Recommendation</TableCell>
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
                            {recommendations[holding.security] ? (
                              <Chip
                                icon={
                                  recommendations[holding.security].recommendation === 'BUY_NEW' ? <BuyIcon /> :
                                  recommendations[holding.security].recommendation === 'ADD_ACCUMULATE' ? <AccumulateIcon /> :
                                  recommendations[holding.security].recommendation === 'HOLD' ? <HoldIcon /> :
                                  recommendations[holding.security].recommendation === 'TRIM' ? <TrimIcon /> :
                                  recommendations[holding.security].recommendation === 'EXIT' ? <ExitIcon /> :
                                  recommendations[holding.security].recommendation === 'STRONG_STOP_TAKE_PROFIT' ? <StopIcon /> :
                                  undefined
                                }
                                label={recommendations[holding.security].recommendation.replace(/_/g, ' ')}
                                size="small"
                                color={
                                  recommendations[holding.security].recommendation === 'EXIT' ? 'error' :
                                  recommendations[holding.security].recommendation === 'STRONG_STOP_TAKE_PROFIT' ? 'warning' :
                                  recommendations[holding.security].recommendation === 'TRIM' ? 'warning' :
                                  recommendations[holding.security].recommendation === 'BUY_NEW' ? 'success' :
                                  recommendations[holding.security].recommendation === 'ADD_ACCUMULATE' ? 'info' :
                                  'default'
                                }
                                title={recommendations[holding.security].reason}
                              />
                            ) : (
                              <Chip label="No Data" size="small" color="default" variant="outlined" />
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
            holdings={holdings} 
            stockSplits={stockSplits}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            exportMenuAnchor={exportMenuAnchor}
            onExportMenuOpen={(event) => setExportMenuAnchor(event.currentTarget)}
            onExportMenuClose={() => setExportMenuAnchor(null)}
            onExportCSV={() => {
              exportToCSV(holdings, stockSplits);
              setExportMenuAnchor(null);
            }}
            onExportMarkdown={() => {
              exportToMarkdown(holdings, stockSplits);
              setExportMenuAnchor(null);
            }}
            onExportPDF={() => {
              exportToPDF(holdings, stockSplits);
              setExportMenuAnchor(null);
            }}
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
  holdings: Record<string, SecurityHolding>;
  stockSplits: StockSplit[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  exportMenuAnchor: HTMLElement | null;
  onExportMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  onExportMenuClose: () => void;
  onExportCSV: () => void;
  onExportMarkdown: () => void;
  onExportPDF: () => void;
  onAddSplit: (security: string) => void;
  onRemoveSplit: (splitId: string) => void;
}> = ({ 
  holdings, 
  stockSplits, 
  searchQuery,
  onSearchChange,
  exportMenuAnchor,
  onExportMenuOpen,
  onExportMenuClose,
  onExportCSV,
  onExportMarkdown,
  onExportPDF,
  onAddSplit, 
  onRemoveSplit 
}) => {
  const holdingsArray = Object.values(holdings)
    .filter(holding => 
      searchQuery === '' || 
      holding.security.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.security.localeCompare(b.security));

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Lot-wise Gain/Loss Analysis
            </Typography>
            <Alert severity="info" sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Each BUY order is tracked as a separate lot. SELL orders are matched using FIFO method.
            </Typography>
            </Alert>
            <Alert severity="info" sx={{ mb: 1 }}>
              <Typography variant="body2">
                <strong>Stock Splits:</strong> You can manually add stock splits below. The system will
                automatically adjust quantities and prices for all orders before the split date.
              </Typography>
            </Alert>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1 }}>
            <TextField
              size="small"
              placeholder="Search securities...!"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
            />
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={onExportMenuOpen}
              color="primary"
            >
              Export
            </Button>
            <Menu
              anchorEl={exportMenuAnchor}
              open={Boolean(exportMenuAnchor)}
              onClose={onExportMenuClose}
            >
              <MenuItem onClick={onExportCSV}>
                <CsvIcon sx={{ mr: 1 }} fontSize="small" />
                Export as CSV
              </MenuItem>
              <MenuItem onClick={onExportMarkdown}>
                <MarkdownIcon sx={{ mr: 1 }} fontSize="small" />
                Export as Markdown
              </MenuItem>
              <Divider />
              <MenuItem onClick={onExportPDF}>
                <PdfIcon sx={{ mr: 1 }} fontSize="small" />
                Export as PDF
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        {searchQuery && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Showing {holdingsArray.length} security{holdingsArray.length !== 1 ? 'ies' : ''} matching "{searchQuery}"
          </Alert>
        )}

        {holdingsArray.length === 0 ? (
          <Alert severity="info">
            {searchQuery ? 'No securities found matching your search.' : 'No holdings data available.'}
          </Alert>
        ) : (
          holdingsArray.map((holding) => {
            // Get stock splits for this security
            const securitySplits = stockSplits
              .filter(split => split.security === holding.security)
              .sort((a, b) => new Date(a.splitDateTime).getTime() - new Date(b.splitDateTime).getTime());

            return (
              <Accordion key={holding.security} defaultExpanded sx={{ mb: 2 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: 'action.hover',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6" sx={{ color: 'primary.main' }}>
                        {holding.security}
                      </Typography>
                      <Chip
                        label={`${holding.totalQuantity.toFixed(0)} shares`}
                        size="small"
                        variant="outlined"
                      />
                      {holding.currentPrice && holding.unrealizedGainLoss !== undefined && (
                        <Chip
                          label={`${holding.unrealizedGainLoss >= 0 ? '+' : ''}${holding.unrealizedGainLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${holding.unrealizedGainLossPercent !== undefined && holding.unrealizedGainLossPercent >= 0 ? '+' : ''}${holding.unrealizedGainLossPercent?.toFixed(2)}%)`}
                          size="small"
                          color={holding.unrealizedGainLoss >= 0 ? 'success' : 'error'}
                        />
                      )}
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddSplit(holding.security);
                      }}
                    >
                      Add Split
                    </Button>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>

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

                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600, overflow: 'auto' }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>Buy Date</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>Buy Price</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>Quantity</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>Remaining</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>Total Cost</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'background.paper', minWidth: 200 }}>Sell Details</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>Realized G/L</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>Unrealized G/L</TableCell>
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
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
                              {lot.sellOrders.map((sell, idx) => (
                                <Box
                                  key={idx}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  <Typography variant="caption" color="text.secondary">
                                    {sell.quantity} @ {sell.sellPrice.toFixed(2)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                    ({sell.sellDate})
                                  </Typography>
                                  <Chip
                                    label={`${sell.gainLoss >= 0 ? '+' : ''}${sell.gainLoss.toFixed(2)} (${sell.gainLossPercent >= 0 ? '+' : ''}${sell.gainLossPercent.toFixed(2)}%)`}
                                    size="small"
                                    color={sell.gainLoss >= 0 ? 'success' : 'error'}
                                    sx={{ height: 18, fontSize: '0.65rem' }}
                                  />
                                </Box>
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
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
                </AccordionDetails>
              </Accordion>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default Portfolio;
