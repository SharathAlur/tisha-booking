import { createTheme, alpha } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a237e',
      light: '#3949ab',
      dark: '#0d1642',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7c4dff',
      light: '#b47cff',
      dark: '#3f1dcb',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a237e',
      secondary: '#5c6bc0',
    },
  },
  typography: {
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 600,
      fontSize: '2rem',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.1rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.6,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#5c6bc0',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0 2px 8px rgba(26, 35, 126, 0.08)',
    '0 4px 12px rgba(26, 35, 126, 0.1)',
    '0 6px 16px rgba(26, 35, 126, 0.12)',
    '0 8px 24px rgba(26, 35, 126, 0.14)',
    '0 10px 32px rgba(26, 35, 126, 0.16)',
    '0 12px 40px rgba(26, 35, 126, 0.18)',
    '0 14px 48px rgba(26, 35, 126, 0.2)',
    '0 16px 56px rgba(26, 35, 126, 0.22)',
    '0 18px 64px rgba(26, 35, 126, 0.24)',
    '0 20px 72px rgba(26, 35, 126, 0.26)',
    '0 22px 80px rgba(26, 35, 126, 0.28)',
    '0 24px 88px rgba(26, 35, 126, 0.3)',
    '0 26px 96px rgba(26, 35, 126, 0.32)',
    '0 28px 104px rgba(26, 35, 126, 0.34)',
    '0 30px 112px rgba(26, 35, 126, 0.36)',
    '0 32px 120px rgba(26, 35, 126, 0.38)',
    '0 34px 128px rgba(26, 35, 126, 0.4)',
    '0 36px 136px rgba(26, 35, 126, 0.42)',
    '0 38px 144px rgba(26, 35, 126, 0.44)',
    '0 40px 152px rgba(26, 35, 126, 0.46)',
    '0 42px 160px rgba(26, 35, 126, 0.48)',
    '0 44px 168px rgba(26, 35, 126, 0.5)',
    '0 46px 176px rgba(26, 35, 126, 0.52)',
    '0 48px 184px rgba(26, 35, 126, 0.54)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '0.95rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(26, 35, 126, 0.2)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #3949ab 0%, #5c6bc0 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #7c4dff 0%, #b47cff 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #9c6fff 0%, #c9a7ff 100%)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 8px 32px rgba(26, 35, 126, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: '0 4px 16px rgba(26, 35, 126, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            background: alpha('#ffffff', 0.8),
            '&:hover': {
              background: alpha('#ffffff', 1),
            },
            '&.Mui-focused': {
              background: alpha('#ffffff', 1),
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        filled: {
          background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
          color: '#ffffff',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          boxShadow: '0 24px 80px rgba(26, 35, 126, 0.3)',
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(26, 35, 126, 0.1)',
          height: 70,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#1a237e',
          },
          minWidth: 60,
          padding: '8px 12px',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #1a237e 0%, #0d1642 100%)',
          color: '#ffffff',
          borderRight: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 8px',
          '&.Mui-selected': {
            background: 'rgba(255, 255, 255, 0.15)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.2)',
            },
          },
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.95rem',
          minHeight: 48,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 3,
          background: 'linear-gradient(90deg, #1a237e, #7c4dff)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        standardSuccess: {
          background: alpha('#4caf50', 0.1),
          color: '#2e7d32',
        },
        standardError: {
          background: alpha('#f44336', 0.1),
          color: '#c62828',
        },
        standardWarning: {
          background: alpha('#ff9800', 0.1),
          color: '#e65100',
        },
        standardInfo: {
          background: alpha('#2196f3', 0.1),
          color: '#0277bd',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 8px 24px rgba(26, 35, 126, 0.3)',
        },
        primary: {
          background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #3949ab 0%, #5c6bc0 100%)',
          },
        },
      },
    },
  },
});

