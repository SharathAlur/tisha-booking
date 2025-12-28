import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { EventNote } from '@mui/icons-material';

const SplashScreen: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
        color: 'white',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 3,
          animation: 'fadeIn 0.5s ease-in',
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(-20px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        <EventNote sx={{ fontSize: 64 }} />
        <Box>
          <Typography variant="h3" fontWeight={700}>
            Hall Manager
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
            Booking Management System
          </Typography>
        </Box>
      </Box>

      <CircularProgress
        sx={{
          color: 'rgba(255, 255, 255, 0.7)',
        }}
      />
    </Box>
  );
};

export default SplashScreen;
