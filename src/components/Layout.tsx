import React from 'react';
import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Home,
  EventNote,
  Dashboard,
  ArrowBack,
} from '@mui/icons-material';
import { useHallStore } from '../stores/hallStore';
import { useUIStore } from '../stores/uiStore';
import BookingModal from './BookingModal';
import { stringToTitleCase } from './utils';

const DRAWER_WIDTH = 240;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hallId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { selectedHall, halls } = useHallStore();
  const { snackbar, hideSnackbar } = useUIStore();

  const hasMultipleHalls = halls.length > 1;
  const basePath = hallId ? `/hall/${hallId}` : '';

  const navItems: NavItem[] = [
    { label: 'Home', path: basePath || '/', icon: <Home /> },
    { label: 'Bookings', path: `${basePath}/bookings`, icon: <EventNote /> },
    { label: 'Dashboard', path: `${basePath}/dashboard`, icon: <Dashboard /> },
  ];

  const getCurrentTabIndex = (): number => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 2;
    if (path.includes('/bookings')) return 1;
    return 0;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleBackToHalls = () => {
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRadius: 0,
            },
          }}
        >
          <Toolbar>
            <Typography variant="h6" fontWeight={700} color="primary">
              {selectedHall?.name ? stringToTitleCase(selectedHall.name) : 'Hall Manager'}
            </Typography>
          </Toolbar>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  selected={
                    item.path === basePath || item.path === '/'
                      ? location.pathname === basePath || location.pathname === '/'
                      : location.pathname.includes(item.path)
                  }
                  onClick={() => handleNavigation(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {hasMultipleHalls && selectedHall && (
            <Box sx={{ mt: 'auto', p: 2 }}>
              <ListItemButton onClick={handleBackToHalls}>
                <ListItemIcon>
                  <ArrowBack />
                </ListItemIcon>
                <ListItemText primary="Back to Halls" />
              </ListItemButton>
            </Box>
          )}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          pb: isMobile ? 7 : 0,
        }}
      >
        {/* Mobile App Bar */}
        {isMobile && (
          <AppBar position="sticky" sx={{ borderRadius: 0}}>
            <Toolbar>
              {hasMultipleHalls && selectedHall && (
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={handleBackToHalls}
                  sx={{ mr: 1 }}
                >
                  <ArrowBack />
                </IconButton>
              )}
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                {selectedHall?.name ? stringToTitleCase(selectedHall.name) : 'Hall Manager'}
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        {/* Page Content */}
        <Box sx={{ flexGrow: 1, bgcolor: 'grey.50' }}>
          <Outlet />
        </Box>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <Paper
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: theme.zIndex.appBar,
            }}
            elevation={3}
          >
            <BottomNavigation
              value={getCurrentTabIndex()}
              onChange={(_, newValue) => handleNavigation(navItems[newValue].path)}
              showLabels
            >
              {navItems.map((item) => (
                <BottomNavigationAction
                  key={item.path}
                  label={item.label}
                  icon={item.icon}
                />
              ))}
            </BottomNavigation>
          </Paper>
        )}
      </Box>

      {/* Global Booking Modal */}
      <BookingModal />

      {/* Global Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={hideSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Layout;
