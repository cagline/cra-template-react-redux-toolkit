import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  Tab,
  Tabs,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  Download,
  DateRange,
  PersonOutline,
  PieChart,
  BarChart,
  ShowChart,
} from '@mui/icons-material';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ShellProps } from './types';

/**
 * Remote Module B - Reporting & Analytics
 * This is the main component exposed to the shell
 */
const App: React.FC<ShellProps> = ({ user, navigate }) => {
  return (
    <Routes>
      <Route path="/" element={<ModuleBHome user={user} navigate={navigate} />} />
      <Route path="/report/:id" element={<ModuleBReport />} />
      <Route path="/dashboard" element={<ModuleBDashboard />} />
    </Routes>
  );
};

const ModuleBHome: React.FC<{ user: ShellProps['user']; navigate: ShellProps['navigate'] }> = ({
  user,
  navigate,
}) => {
  const { t } = useTranslation();
  const [reports] = useState([
    { id: 1, name: 'Q4 Sales Report', status: 'completed', progress: 100, date: '2026-01-15', type: 'sales' },
    { id: 2, name: 'User Analytics', status: 'in_progress', progress: 65, date: '2026-01-20', type: 'analytics' },
    { id: 3, name: 'Performance Metrics', status: 'pending', progress: 0, date: '2026-01-27', type: 'performance' },
    { id: 4, name: 'Revenue Forecast', status: 'completed', progress: 100, date: '2026-01-10', type: 'finance' },
    { id: 5, name: 'Customer Satisfaction', status: 'in_progress', progress: 45, date: '2026-01-25', type: 'customer' },
  ]);

  const metrics = [
    { labelKey: 'moduleB.totalUsers' as const, value: '12,847', change: '+15%', trend: 'up' as const, color: 'success' as const },
    { labelKey: 'moduleB.activeSessions' as const, value: '3,291', change: '+8%', trend: 'up' as const, color: 'success' as const },
    { labelKey: 'moduleB.avgResponseTime' as const, value: '142ms', change: '-12%', trend: 'down' as const, color: 'success' as const },
    { labelKey: 'moduleB.errorRate' as const, value: '0.3%', change: '+0.1%', trend: 'up' as const, color: 'warning' as const },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="success" sx={{ mb: 3 }}>
        <strong>{t('moduleB.loaded')}</strong> {t('moduleB.loadedSub')}
      </Alert>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {t('moduleB.title')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<PieChart />}
            onClick={() => navigate('/module-b/dashboard')}
          >
            {t('moduleB.dashboard')}
          </Button>
          <Chip
            icon={<PersonOutline />}
            label={user?.name || t('moduleB.unknown')}
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {metrics.map((metric, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card sx={{ '&:hover': { boxShadow: 4 } }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  {t(metric.labelKey)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h4" fontWeight="bold">{metric.value}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  {metric.trend === 'up' ? (
                    <TrendingUp color={metric.color} fontSize="small" />
                  ) : (
                    <TrendingDown color="success" fontSize="small" />
                  )}
                  <Typography
                    variant="body2"
                    color={metric.color === 'success' ? 'success.main' : 'warning.main'}
                  >
                    {metric.change} {t('moduleB.fromLastMonth')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Reports Table */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {t('moduleB.recentReports')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" size="small" startIcon={<DateRange />}>
              {t('moduleB.filter')}
            </Button>
            <Button variant="contained" size="small" startIcon={<Assessment />}>
              {t('moduleB.newReport')}
            </Button>
          </Box>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('moduleB.reportName')}</TableCell>
                <TableCell>{t('moduleB.type')}</TableCell>
                <TableCell>{t('moduleB.status')}</TableCell>
                <TableCell>{t('moduleB.progress')}</TableCell>
                <TableCell>{t('moduleB.date')}</TableCell>
                <TableCell align="right">{t('moduleB.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow
                  key={report.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/module-b/report/${report.id}`)}
                >
                  <TableCell>
                    <Typography fontWeight="medium">{report.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={report.type} variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={report.status.replace('_', ' ')}
                      color={
                        report.status === 'completed'
                          ? 'success'
                          : report.status === 'in_progress'
                          ? 'warning'
                          : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell sx={{ width: 180 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={report.progress}
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                        color={report.progress === 100 ? 'success' : 'primary'}
                      />
                      <Typography variant="body2" sx={{ minWidth: 35 }}>
                        {report.progress}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{report.date}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<Download />}
                      disabled={report.status !== 'completed'}
                      onClick={(e) => {
                        e.stopPropagation();
                        alert('Download started!');
                      }}
                    >
                      {t('moduleB.export')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

const ModuleBReport: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const id = location.pathname.split('/').pop();
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('moduleB.reportDetails', { id })}
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        {t('moduleB.detailAlert', { id })}
      </Alert>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab icon={<BarChart />} label={t('moduleB.overview')} />
          <Tab icon={<ShowChart />} label={t('moduleB.trends')} />
          <Tab icon={<PieChart />} label={t('moduleB.distribution')} />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 3 }}>
        {tabValue === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>{t('moduleB.overview')}</Typography>
            <Box 
              sx={{ 
                height: 300, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                bgcolor: 'primary.light', 
                borderRadius: 2,
                color: 'white'
              }}
            >
              <BarChart sx={{ fontSize: 64, opacity: 0.5, mr: 2 }} />
              <Typography>{t('moduleB.barChart')}</Typography>
            </Box>
          </Box>
        )}
        {tabValue === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>{t('moduleB.trends')}</Typography>
            <Box 
              sx={{ 
                height: 300, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                bgcolor: 'secondary.light', 
                borderRadius: 2,
                color: 'white'
              }}
            >
              <ShowChart sx={{ fontSize: 64, opacity: 0.5, mr: 2 }} />
              <Typography>{t('moduleB.lineChart')}</Typography>
            </Box>
          </Box>
        )}
        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>{t('moduleB.distribution')}</Typography>
            <Box 
              sx={{ 
                height: 300, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                bgcolor: 'success.light', 
                borderRadius: 2,
                color: 'white'
              }}
            >
              <PieChart sx={{ fontSize: 64, opacity: 0.5, mr: 2 }} />
              <Typography>{t('moduleB.pieChart')}</Typography>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

const ModuleBDashboard: React.FC = () => {
  const { t } = useTranslation();
  const kpiKeys = ['moduleB.conversionRate', 'moduleB.bounceRate', 'moduleB.avgSessionDuration', 'moduleB.pagesPerSession'] as const;
  const kpiValues = ['3.2%', '42%', '4:32', '5.8'];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('moduleB.analyticsDashboard')}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>{t('moduleB.revenueOverTime')}</Typography>
            <Box 
              sx={{ 
                height: 320, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                bgcolor: 'grey.100', 
                borderRadius: 2 
              }}
            >
              <ShowChart sx={{ fontSize: 64, color: 'grey.400', mr: 2 }} />
              <Typography color="text.secondary">
                {t('moduleB.integrateCharts')}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>{t('moduleB.trafficSources')}</Typography>
            <Box 
              sx={{ 
                height: 320, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                bgcolor: 'grey.100', 
                borderRadius: 2 
              }}
            >
              <PieChart sx={{ fontSize: 64, color: 'grey.400' }} />
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>{t('moduleB.kpis')}</Typography>
            <Grid container spacing={2}>
              {kpiKeys.map((kpiKey, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h4" color="primary.main">
                      {kpiValues[i]}
                    </Typography>
                    <Typography color="text.secondary">{t(kpiKey)}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default App;
