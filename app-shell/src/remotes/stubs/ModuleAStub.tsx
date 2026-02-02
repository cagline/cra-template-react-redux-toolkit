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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  Alert,
} from '@mui/material';
import {
  CheckCircleOutline,
  Info,
  Settings,
  Add,
  PersonOutline,
} from '@mui/icons-material';
import { Routes, Route, useLocation } from 'react-router-dom';
import type { ShellProps } from '../types';

/**
 * Stub implementation of Module A for development
 * Simulates a team management module
 */
const ModuleAStub: React.FC<ShellProps> = ({ user, navigate }) => {
  return (
    <Routes>
      <Route path="/" element={<ModuleAHome user={user} navigate={navigate} />} />
      <Route path="/details/:id" element={<ModuleADetails />} />
      <Route path="/settings" element={<ModuleASettings />} />
    </Routes>
  );
};

const ModuleAHome: React.FC<{ user: ShellProps['user']; navigate: ShellProps['navigate'] }> = ({
  user,
  navigate,
}) => {
  const [items] = useState([
    { id: 1, name: 'Team Alpha', status: 'active', members: 5 },
    { id: 2, name: 'Team Beta', status: 'active', members: 3 },
    { id: 3, name: 'Team Gamma', status: 'inactive', members: 8 },
  ]);

  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Development Mode:</strong> This is a stub component for Module A (Team Management).
        In production, this would be loaded from a separate micro frontend.
      </Alert>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Module A - Team Management
        </Typography>
        <Chip
          icon={<PersonOutline />}
          label={`Logged in as: ${user?.name || 'Unknown'}`}
          variant="outlined"
        />
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Teams Overview
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {items.map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
              <Card
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/module-a/details/${item.id}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6">{item.name}</Typography>
                    <Chip
                      size="small"
                      label={item.status}
                      color={item.status === 'active' ? 'success' : 'default'}
                    />
                  </Box>
                  <Typography color="text.secondary">
                    {item.members} members
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" startIcon={<Add />}>
          Create Team
        </Button>
        <Button
          variant="outlined"
          startIcon={<Settings />}
          onClick={() => navigate('/module-a/settings')}
        >
          Settings
        </Button>
      </Box>
    </Box>
  );
};

const ModuleADetails: React.FC = () => {
  const location = useLocation();
  const id = location.pathname.split('/').pop();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Team Details - ID: {id}
      </Typography>
      <Paper sx={{ p: 3 }}>
        <List>
          <ListItem>
            <ListItemIcon>
              <CheckCircleOutline color="success" />
            </ListItemIcon>
            <ListItemText primary="Team Status" secondary="Active" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Info color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Description"
              secondary="This is a stub detail view for Module A. Replace with actual team details."
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

const ModuleASettings: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Module A Settings
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" paragraph>
          Configure Module A settings here. This is a stub settings page.
        </Typography>
        <TextField
          label="Team Name Prefix"
          defaultValue="Team"
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button variant="contained">Save Settings</Button>
      </Paper>
    </Box>
  );
};

export default ModuleAStub;
