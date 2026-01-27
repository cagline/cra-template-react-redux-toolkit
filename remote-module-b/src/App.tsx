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
  const [reports] = useState([
    { id: 1, name: 'Q4 Sales Report', status: 'completed', progress: 100, date: '2026-01-15', type: 'sales' },
    { id: 2, name: 'User Analytics', status: 'in_progress', progress: 65, date: '2026-01-20', type: 'analytics' },
    { id: 3, name: 'Performance Metrics', status: 'pending', progress: 0, date: '2026-01-27', type: 'performance' },
    { id: 4, name: 'Revenue Forecast', status: 'completed', progress: 100, date: '2026-01-10', type: 'finance' },
    { id: 5, name: 'Customer Satisfaction', status: 'in_progress', progress: 45, date: '2026-01-25', type: 'customer' },
  ]);

  const metrics = [
    { label: 'Total Users', value: '12,847', change: '+15%', trend: 'up', color: 'success' },
    { label: 'Active Sessions', value: '3,291', change: '+8%', trend: 'up', color: 'success' },
    { label: 'Avg. Response Time', value: '142ms', change: '-12%', trend: 'down', color: 'success' },
    { label: 'Error Rate', value: '0.3%', change: '+0.1%', trend: 'up', color: 'warning' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="success" sx={{ mb: 3 }}>
        <strong>Remote Module B Loaded!</strong> This is a real federated module running on port 3002.
      </Alert>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Module B - Reporting & Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<PieChart />}
            onClick={() => navigate('/module-b/dashboard')}
          >
            Dashboard
          </Button>
          <Chip
            icon={<PersonOutline />}
            label={`${user?.name || 'Unknown'}`}
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
                  {metric.label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h4" fontWeight="bold">{metric.value}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  {metric.trend === 'up' ? (
                    <TrendingUp color={metric.color as 'success' | 'warning'} fontSize="small" />
                  ) : (
                    <TrendingDown color="success" fontSize="small" />
                  )}
                  <Typography
                    variant="body2"
                    color={metric.color === 'success' ? 'success.main' : 'warning.main'}
                  >
                    {metric.change} from last month
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
            Recent Reports
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" size="small" startIcon={<DateRange />}>
              Filter
            </Button>
            <Button variant="contained" size="small" startIcon={<Assessment />}>
              New Report
            </Button>
          </Box>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Report Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
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
                      Export
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
  const location = useLocation();
  const id = location.pathname.split('/').pop();
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Report Details - #{id}
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This is the detail view for report {id} from Remote Module B.
      </Alert>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab icon={<BarChart />} label="Overview" />
          <Tab icon={<ShowChart />} label="Trends" />
          <Tab icon={<PieChart />} label="Distribution" />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 3 }}>
        {tabValue === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>Overview</Typography>
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
              <Typography>Bar Chart Visualization</Typography>
            </Box>
          </Box>
        )}
        {tabValue === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>Trends</Typography>
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
              <Typography>Line Chart Visualization</Typography>
            </Box>
          </Box>
        )}
        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>Distribution</Typography>
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
              <Typography>Pie Chart Visualization</Typography>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

const ModuleBDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>Revenue Over Time</Typography>
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
                Integrate with Chart.js or Recharts
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>Traffic Sources</Typography>
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
            <Typography variant="h6" gutterBottom>Key Performance Indicators</Typography>
            <Grid container spacing={2}>
              {['Conversion Rate', 'Bounce Rate', 'Avg. Session Duration', 'Pages per Session'].map((kpi, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h4" color="primary.main">
                      {['3.2%', '42%', '4:32', '5.8'][i]}
                    </Typography>
                    <Typography color="text.secondary">{kpi}</Typography>
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
