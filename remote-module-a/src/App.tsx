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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [items] = useState([
    { id: 1, name: 'Engineering Team', status: 'active', members: 12 },
    { id: 2, name: 'Design Team', status: 'active', members: 5 },
    { id: 3, name: 'Product Team', status: 'active', members: 4 },
    { id: 4, name: 'QA Team', status: 'inactive', members: 3 },
  ]);

  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="success" sx={{ mb: 3 }}>
        <strong>{t('moduleA.loaded')}</strong> {t('moduleA.loadedSub')}
      </Alert>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {t('moduleA.title')}
        </Typography>
        <Chip
          icon={<PersonOutline />}
          label={t('moduleA.loggedInAs', { name: user?.name || t('moduleA.unknown') })}
          variant="outlined"
        />
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('moduleA.teamsOverview')}
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
                    {t('moduleA.members', { count: item.members })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" startIcon={<Add />}>
          {t('moduleA.createTeam')}
        </Button>
        <Button
          variant="outlined"
          startIcon={<Settings />}
          onClick={() => navigate('/module-a/settings')}
        >
          {t('moduleA.settings')}
        </Button>
      </Box>
    </Box>
  );
};

const ModuleADetails: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const id = location.pathname.split('/').pop();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('moduleA.teamDetails', { id })}
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          {t('moduleA.detailAlert', { id })}
        </Alert>
        <List>
          <ListItem>
            <ListItemIcon>
              <CheckCircleOutline color="success" />
            </ListItemIcon>
            <ListItemText primary={t('moduleA.teamStatus')} secondary={t('moduleA.active')} />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Info color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={t('moduleA.description')}
              secondary={t('moduleA.teamDescription')}
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

const ModuleASettings: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('moduleA.moduleSettings')}
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" paragraph>
          {t('moduleA.configureSettings')}
        </Typography>
        <TextField
          label={t('moduleA.teamNamePrefix')}
          defaultValue={t('moduleA.teamNamePrefixDefault')}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label={t('moduleA.maxTeamSize')}
          type="number"
          defaultValue={20}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button variant="contained">{t('moduleA.saveSettings')}</Button>
      </Paper>
    </Box>
  );
};

export default App;
