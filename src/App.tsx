import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useHallStore } from './stores/hallStore';
import { useBookingStore } from './stores/bookingStore';

// Components
import Layout from './components/Layout';
import SplashScreen from './components/SplashScreen';

// Pages
import HomeScreen from './pages/HomeScreen';
import BookingsScreen from './pages/BookingsScreen';
import DashboardScreen from './pages/DashboardScreen';
import HallSelectionScreen from './pages/HallSelectionScreen';

// Hall Routes wrapper component that handles hall selection and booking subscription
const HallRoutes: React.FC = () => {
  const { hallId } = useParams();
  const navigate = useNavigate();
  const { halls, selectedHall, setSelectedHall, isLoading } = useHallStore();
  const { subscribeToBookings } = useBookingStore();

  // Find and set the selected hall based on URL parameter
  useEffect(() => {
    if (!hallId || halls.length === 0) return;

    const hall = halls.find((h) => h.id === hallId);
    if (hall) {
      setSelectedHall(hall);
    } else {
      // Hall not found, redirect to home
      navigate('/', { replace: true });
    }
  }, [hallId, halls, setSelectedHall, navigate]);

  // Subscribe to bookings for the selected hall
  useEffect(() => {
    if (!selectedHall) return;

    const unsubscribe = subscribeToBookings(selectedHall.id);
    return () => unsubscribe();
  }, [selectedHall, subscribeToBookings]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!selectedHall) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography color="text.secondary">Loading hall...</Typography>
      </Box>
    );
  }

  return (
    <Routes>
      <Route index element={<HomeScreen />} />
      <Route path="bookings" element={<BookingsScreen />} />
      <Route path="dashboard" element={<DashboardScreen />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};

// Component to handle hall selection or auto-redirect
const HallSelectionOrRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { halls, isLoading, setSelectedHall } = useHallStore();

  useEffect(() => {
    if (isLoading) return;

    // Auto-redirect if only one hall exists
    if (halls.length === 1) {
      setSelectedHall(halls[0]);
      navigate(`/hall/${halls[0].id}`, { replace: true });
    }
  }, [halls, isLoading, navigate, setSelectedHall]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (halls.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No halls available
        </Typography>
        <Typography color="text.secondary">
          Please add a hall in Firestore to get started.
        </Typography>
      </Box>
    );
  }

  if (halls.length === 1) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return <HallSelectionScreen />;
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { fetchHalls } = useHallStore();

  // Handle splash screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Fetch halls on app load
  useEffect(() => {
    fetchHalls();
  }, [fetchHalls]);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HallSelectionOrRedirect />} />
        <Route path="hall/:hallId/*" element={<HallRoutes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
