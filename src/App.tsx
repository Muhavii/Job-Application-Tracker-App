import React, { Suspense } from 'react';
import { 
  CssBaseline, 
  Container, 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  ThemeProvider, 
  createTheme,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { JobProvider } from './contexts/JobContext';

// Lazy load components for better performance
const JobForm = React.lazy(() => import('./components/JobForm'));
const JobList = React.lazy(() => import('./components/JobList'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));

// Error Boundary Component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <Alert severity="error">
            Something went wrong. Please refresh the page or try again later.
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
    <CircularProgress />
  </Box>
);

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  const [error, setError] = React.useState<string | null>(null);

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <JobProvider>
          <CssBaseline />
          <AppBar position="static" elevation={1}>
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
                Job Application Tracker
              </Typography>
            </Toolbar>
          </AppBar>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Suspense fallback={<LoadingFallback />}>
              <Box sx={{ mb: 4 }}>
                <JobForm />
              </Box>
              <Box sx={{ mb: 4 }}>
                <Dashboard />
              </Box>
              <Box>
                <JobList />
              </Box>
            </Suspense>
          </Container>
          
          {/* Global Error Snackbar */}
          <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={handleCloseError}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>
        </JobProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
