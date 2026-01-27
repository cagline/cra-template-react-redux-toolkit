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
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  Download,
  DateRange,
  PersonOutline,
} from '@mui/icons-material';
import { Routes, Route } from 'react-router-dom';
import type { ShellProps } from '../types';

/**
 * Stub implementation of Module B for development
 * Simulates a reporting/analytics module
 */
const ModuleBStub: React.FC<ShellProps> = ({ user, navigate }) => {
  return (
    <Routes>
      <Route path="/" element={<ModuleBHome user={user} navigate={navigate} />} />
      <Route path="/report/:id" element={<ModuleBReport />} />
    </Routes>
  );
};

const ModuleBHome: React.FC<{ user: ShellProps['user']; navigate: ShellProps['navigate'] }> = ({
  user,
  navigate,
}) => {
  const [reports] = useState([
    { id: 1, name: 'Q4 Sales Report', status: 'completed', progress: 100, date: '2026-01-15' },
    { id: 2, name: 'User Analytics', status: 'in_progress', progress: 65, date: '2026-01-20' },
    { id: 3, name: 'Performance Metrics', status: 'pending', progress: 0, date: '2026-01-27' },
  ]);

  const metrics = [
    { label: 'Total Users', value: '12,847', change: '+15%', color: 'success' },
    { label: 'Active Sessions', value: '3,291', change: '+8%', color: 'success' },
    { label: 'Avg. Response Time', value: '142ms', change: '-12%', color: 'success' },
    { label: 'Error Rate', value: '0.3%', change: '+0.1%', color: 'warning' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Development Mode:</strong> This is a stub component for Module B (Reporting & Analytics).
        In production, this would be loaded from a separate micro frontend.
      </Alert>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Module B - Reporting & Analytics
        </Typography>
        <Chip
          icon={<PersonOutline />}
          label={`Logged in as: ${user?.name || 'Unknown'}`}
          variant="outlined"
        />
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {metrics.map((metric, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  {metric.label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h5">{metric.value}</Typography>
                  <Chip
                    size="small"
                    label={metric.change}
                    color={metric.color as 'success' | 'warning'}
                    icon={<TrendingUp />}
                  />
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
            Reports
          </Typography>
          <Button variant="outlined" startIcon={<DateRange />}>
            Filter by Date
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Report Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
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
                  <TableCell>{report.name}</TableCell>
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
                  <TableCell sx={{ width: 200 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={report.progress}
                        sx={{ flexGrow: 1 }}
                      />
                      <Typography variant="body2">{report.progress}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{report.date}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<Download />}
                      disabled={report.status !== 'completed'}
                    >
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" startIcon={<Assessment />}>
          Generate New Report
        </Button>
      </Box>
    </Box>
  );
};

const ModuleBReport: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Report Details
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" paragraph>
          This is a stub report detail view for Module B.
          In production, this would show actual report data with charts and visualizations.
        </Typography>
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography color="text.secondary">
            Chart placeholder - integrate with charting library
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ModuleBStub;
