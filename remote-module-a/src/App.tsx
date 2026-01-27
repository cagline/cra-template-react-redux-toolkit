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
import type { ShellProps } from './types';

/**
 * Remote Module A - Team Management
 * This is the main component exposed to the shell
 */
const App: React.FC<ShellProps> = ({ user, navigate }) => {
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
    { id: 1, name: 'Engineering Team', status: 'active', members: 12 },
    { id: 2, name: 'Design Team', status: 'active', members: 5 },
    { id: 3, name: 'Product Team', status: 'active', members: 4 },
    { id: 4, name: 'QA Team', status: 'inactive', members: 3 },
  ]);

  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="success" sx={{ mb: 3 }}>
        <strong>Remote Module A Loaded!</strong> This is a real federated module running on port 3001.
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
                sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
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
        <Alert severity="info" sx={{ mb: 2 }}>
          This is the detail view for team {id} from Remote Module A.
        </Alert>
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
              secondary="This team is responsible for building amazing software."
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
          Configure Module A settings here.
        </Typography>
        <TextField
          label="Team Name Prefix"
          defaultValue="Team"
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Max Team Size"
          type="number"
          defaultValue={20}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button variant="contained">Save Settings</Button>
      </Paper>
    </Box>
  );
};

export default App;
