import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { useJobs } from '../contexts/JobContext';
import { 
  Paper, 
  Typography,
  Box, 
  Card, 
  CardContent,
  CircularProgress,
  Alert,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  TooltipProps as RechartsTooltipProps
} from 'recharts';


type GridProps = {
  children: React.ReactNode;
  container?: boolean;
  item?: boolean;
  xs?: number;
  sm?: number;
  md?: number;
  sx?: any;
};

const GridItem = (props: GridProps) => <Grid item {...props} />;

interface CustomTooltipProps extends RechartsTooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    value: any;
    name: string;
    payload: any;
  }>;
  label?: string;
}

interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

interface PieLabelProps {
  cx?: number | string;
  cy?: number | string;
  midAngle?: number;
  innerRadius?: number | string;
  outerRadius?: number | string;
  percent?: number;
  index?: number;
  name?: string;
  value?: number;
  color?: string;
}

interface StatusData extends ChartDataPoint {
  value: number;
  color: string;
  name: string;
}

interface MonthlyData extends ChartDataPoint {
  Applications: number;
}

// Status colors mapping with improved contrast
const STATUS_COLORS: Record<string, string> = {
  'Applied': '#4e73df',    // Blue
  'Interview': '#f6c23e',  // Yellow
  'Offer': '#36b9cc',      // Cyan
  'Accepted': '#1cc88a',   // Green
  'Rejected': '#e74a3b'    // Red
};

// Define the order of statuses for consistent display
const STATUS_ORDER = ['Applied', 'Interview', 'Offer', 'Accepted', 'Rejected'] as const;

// Enhanced color variants for different states
const getStatusColor = (status: string, theme: any) => {
  const colors = {
    'Applied': theme.palette.mode === 'dark' ? '#5d8ffc' : '#4e73df',
    'Interview': theme.palette.mode === 'dark' ? '#ffd54f' : '#f6c23e',
    'Offer': theme.palette.mode === 'dark' ? '#4dd0e1' : '#36b9cc',
    'Accepted': theme.palette.mode === 'dark' ? '#69f0ae' : '#1cc88a',
    'Rejected': theme.palette.mode === 'dark' ? '#ff6b6b' : '#e74a3b'
  };
  return colors[status as keyof typeof colors] || '#9e9e9e';
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        background: '#fff', 
        padding: '10px', 
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
        <p style={{ margin: '5px 0 0 0' }}>
          Count: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

// Create a theme instance
const getTheme = (mode: 'light' | 'dark') => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode colors
          primary: { main: '#1976d2' },
          secondary: { main: '#9c27b0' },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
        }
      : {
          // Dark mode colors
          primary: { main: '#90caf9' },
          secondary: { main: '#ce93d8' },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
        }),
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px 0 rgba(0,0,0,0.1)',
          },
        },
      },
    },
  },
});

const Dashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const theme = useTheme();
  const { jobs, loading, error } = useJobs();
  
  // Create theme based on dark mode state
  const appTheme = createTheme(getTheme(darkMode ? 'dark' : 'light'));
  
  // Toggle dark/light mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Memoize computed values
  const { 
    statusData, 
    monthlyData, 
    totalJobs, 
    successRate, 
    successJobs, 
    applicationToInterviewRate,
    interviewToOfferRate, 
    offerToAcceptanceRate,
    interviewCount,
    offerCount,
    appliedCount
  } = useMemo(() => {
    if (!jobs || jobs.length === 0) {
      return {
        statusData: [] as StatusData[],
        monthlyData: [] as MonthlyData[],
        totalJobs: 0,
        successRate: 0,
        successJobs: 0,
        applicationToInterviewRate: 0,
        interviewToOfferRate: 0,
        offerToAcceptanceRate: 0,
        interviewCount: 0,
        offerCount: 0,
        appliedCount: 0
      };
    }

    // Calculate status distribution with consistent order
    const statusCounts = jobs.reduce<Record<string, number>>((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});

    // Ensure all statuses are included in the data, even if count is 0
    const statusData = STATUS_ORDER.map(status => {
      const color = getStatusColor(status, theme);
      const value = statusCounts[status] || 0;
      console.log(`Status: ${status}, Count: ${value}`); // Debug log
      return {
        name: status,
        value,
        color,
        // Add a lighter version for hover effects
        lightColor: `${color}33`
      };
    });
    
    console.log('Status Data:', statusData); // Debug log

    // Calculate monthly applications
    const monthlyCounts = jobs.reduce<Record<string, number>>((acc, job) => {
      if (job.dateApplied) {
        const month = format(new Date(job.dateApplied), 'MMM yyyy');
        acc[month] = (acc[month] || 0) + 1;
      }
      return acc;
    }, {});

    const monthlyData = Object.entries(monthlyCounts).map(([name, Applications]) => ({
      name,
      Applications
    }));

    // Calculate success metrics
    const successJobs = statusData.find(s => s.name === 'Accepted')?.value || 0;
    const interviewCount = statusData.find(s => s.name === 'Interview')?.value || 0;
    const offerCount = statusData.find(s => s.name === 'Offer')?.value || 0;
    const appliedCount = statusData.find(s => s.name === 'Applied')?.value || 0;
    
    // Calculate rates
    const successRate = jobs.length > 0 ? Math.round((successJobs / jobs.length) * 100) : 0;
    const applicationToInterviewRate = appliedCount > 0 
      ? Math.round((interviewCount / appliedCount) * 100)
      : 0;
    const interviewToOfferRate = interviewCount > 0 
      ? Math.round((offerCount / interviewCount) * 100) 
      : 0;
    const offerToAcceptanceRate = offerCount > 0
      ? Math.round((successJobs / offerCount) * 100)
      : 0;

    return {
      statusData,
      monthlyData,
      totalJobs: jobs.length,
      successRate,
      successJobs,
      applicationToInterviewRate,
      interviewToOfferRate,
      offerToAcceptanceRate,
      interviewCount,
      offerCount,
      appliedCount
    };
  }, [jobs]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <Alert severity="error">Error loading job data: {error.message}</Alert>
      </Box>
    );
  }

  // Empty state
  if (totalJobs === 0) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <Alert severity="info">
          No job applications found. Add your first job to see analytics.
        </Alert>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Job Application Tracker
          </Typography>
          <Box display="flex" alignItems="center">
            <Brightness7Icon sx={{ mr: 1 }} />
            <Switch
              checked={darkMode}
              onChange={toggleDarkMode}
              color="default"
            />
            <Brightness4Icon sx={{ ml: 1 }} />
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Stats Cards */}
          <GridItem xs={12} sm={6} md={3}>
            <Card elevation={3} sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(145deg, #e3f2fd, #bbdefb)'
            }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Typography color="textSecondary" variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    TOTAL APPLICATIONS
                  </Typography>
                </Box>
                <Box flexGrow={1} display="flex" alignItems="center" justifyContent="center">
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: '#0d47a1' }}>
                    {totalJobs}
                  </Typography>
                </Box>
                <Box mt={1}>
                  <Divider />
                  <Typography variant="caption" color="textSecondary">
                    Tracked since {new Date().getFullYear()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </GridItem>
          <GridItem xs={12} sm={6} md={3}>
            <Card elevation={3} sx={{ 
              height: '100%',
              background: 'linear-gradient(145deg, #e8f5e9, #c8e6c9)'
            }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography color="textSecondary" variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  ACCEPTED OFFERS
                </Typography>
                <Box flexGrow={1} display="flex" alignItems="center" justifyContent="center">
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    {successJobs}
                  </Typography>
                </Box>
                <Box mt={1}>
                  <Divider />
                  <Typography variant="caption" color="textSecondary">
                    {successJobs > 0 ? 'Congratulations!' : 'Keep going!'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </GridItem>
          <GridItem xs={12} sm={6} md={3}>
            <Card elevation={3} sx={{ 
              height: '100%',
              background: 'linear-gradient(145deg, #fff3e0, #ffe0b2)'
            }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography color="textSecondary" variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  INTERVIEWS
                </Typography>
                <Box flexGrow={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: '#e65100' }}>
                    {interviewCount}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                    out of {appliedCount} applications
                  </Typography>
                </Box>
                <Box mt={1}>
                  <Divider />
                  <Typography variant="caption" color="textSecondary">
                    {interviewCount > 0 ? 'Great job!' : 'Keep applying!'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </GridItem>
          <GridItem xs={12} sm={6} md={3}>
            <Card elevation={3} sx={{ 
              height: '100%',
              background: 'linear-gradient(145deg, #f3e5f5, #e1bee7)'
            }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography color="textSecondary" variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  OFFERS
                </Typography>
                <Box flexGrow={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: '#6a1b9a' }}>
                    {offerCount}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                    from {interviewCount} interviews
                  </Typography>
                </Box>
                <Box mt={1}>
                  <Divider />
                  <Typography variant="caption" color="textSecondary">
                    {offerCount > 0 ? 'Well done!' : 'Keep trying!'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </GridItem>

          {/* Charts Section - Updated to take full width */}
          <GridItem xs={12} sx={{ mt: 2, mb: 4 }}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  MONTHLY APPLICATIONS
                </Typography>
                <Box>
                  <FormControlLabel
                    control={<Switch size="small" />}
                    label="Show trend"
                    sx={{ m: 0 }}
                  />
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Applications" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </GridItem>

          {/* Status Distribution - Updated to take full width and be larger */}
          <GridItem xs={12} sx={{ mb: 4 }}>
            <Card sx={{ 
              p: { xs: 2, md: 4 },
              display: 'flex',
              flexDirection: 'column',
              minHeight: '650px',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(145deg, #1a1a1a, #2d2d2d)' 
                : 'linear-gradient(145deg, #f8f9fa, #e9ecef)',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              boxShadow: theme.shadows[4],
              '&:hover': {
                boxShadow: theme.shadows[6],
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease-in-out'
              }
            }}>
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 700, 
                  color: theme.palette.text.primary,
                  mb: 1
                }}>
                  STATUS DISTRIBUTION
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Overview of your job application statuses
                </Typography>
              </Box>
              <Box sx={{ 
                width: '100%', 
                height: '100%',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 4,
                p: { xs: 1, md: 3 },
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.03)' 
                  : 'rgba(0, 0, 0, 0.02)',
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`
              }}>
                <Box sx={{ 
                  width: '100%', 
                  height: '500px',
                  display: 'flex',
                  flexDirection: { xs: 'column', lg: 'row' },
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  gap: 4
                }}>
                  {/* Pie Chart */}
                  <Box sx={{ 
                    width: { xs: '100%', lg: '50%' },
                    height: { xs: '300px', md: '400px', lg: '100%' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    '& .recharts-pie': {
                      transform: 'scale(1.1)'
                    },
                    '&:hover': {
                      '& .recharts-pie': {
                        transform: 'scale(1.15)',
                        transition: 'transform 0.3s ease-in-out'
                      }
                    }
                  }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData.filter(entry => entry.value > 0)} // Only show non-zero values
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius="90%"
                          innerRadius="40%"
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                          label={(props: any) => {
                            try {
                              // Safely extract and convert values with defaults
                              const cx = typeof props.cx === 'number' ? props.cx : 0;
                              const cy = typeof props.cy === 'number' ? props.cy : 0;
                              const midAngle = typeof props.midAngle === 'number' ? props.midAngle : 0;
                              const innerRadius = typeof props.innerRadius === 'number' ? props.innerRadius : 60;
                              const outerRadius = typeof props.outerRadius === 'number' ? props.outerRadius : 100;
                              const percent = typeof props.percent === 'number' ? props.percent : 0;
                              const name = typeof props.name === 'string' ? props.name : '';
                              
                              // Ensure all values are numbers for calculations
                              const cxNum = Number(cx) || 0;
                              const cyNum = Number(cy) || 0;
                              const midAngleNum = Number(midAngle) || 0;
                              const innerRadiusNum = Number(innerRadius) || 60;
                              const outerRadiusNum = Number(outerRadius) || 100;
                              
                              const RADIAN = Math.PI / 180;
                              const radius = 25 + innerRadiusNum + (outerRadiusNum - innerRadiusNum);
                              const angle = midAngleNum * RADIAN;
                              const x = cxNum + radius * Math.cos(-angle);
                              const y = cyNum + radius * Math.sin(-angle);
                              
                              return (
                                <text
                                  x={x}
                                  y={y}
                                  fill={theme.palette.text.primary}
                                  textAnchor={x > cxNum ? 'start' : 'end'}
                                  dominantBaseline="central"
                                  style={{
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    filter: theme.palette.mode === 'dark' ? 'brightness(1.5)' : 'none'
                                  }}
                                >
                                  {`${name} (${(percent * 100).toFixed(0)}%)`}
                                </text>
                              );
                            } catch (error) {
                              console.error('Error rendering pie chart label:', error);
                              return null;
                            }
                          }}
                        >
                          {statusData.map((entry: StatusData, index: number) => (
                            <Cell 
                              key={`cell-${index}`}
                              fill={entry.color as string}
                              stroke={theme.palette.background.paper}
                              strokeWidth={2}
                              style={{
                                filter: `drop-shadow(0 0 2px ${entry.color}88)`,
                                cursor: 'pointer',
                                transition: 'opacity 0.3s',
                                opacity: 0.9
                              }}
                              onMouseEnter={() => {
                                const element = document.querySelector(`[data-key="cell-${index}"]`);
                                if (element) {
                                  element.setAttribute('style', `opacity: 1; ${element.getAttribute('style')}`);
                                }
                              }}
                              onMouseLeave={() => {
                                const element = document.querySelector(`[data-key="cell-${index}"]`);
                                if (element) {
                                  element.setAttribute('style', `opacity: 0.9; ${element.getAttribute('style')}`);
                                }
                              }}
                              data-key={`cell-${index}`}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{
                            background: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: '8px',
                            padding: '12px',
                            boxShadow: theme.shadows[3]
                          }}
                          formatter={(value: number, name: string) => [
                            value,
                            `${name}`,
                            `${((value / totalJobs) * 100).toFixed(1)}% of total`
                          ]}
                          itemStyle={{
                            color: theme.palette.text.primary,
                            fontWeight: 500
                          }}
                          labelStyle={{
                            color: theme.palette.text.secondary,
                            fontWeight: 600,
                            marginBottom: '4px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>

                  {/* Legend */}
                  <Box sx={{ 
                    width: { xs: '100%', lg: '40%' },
                    maxWidth: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    p: 3,
                    borderRadius: 2,
                    bgcolor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.03)' 
                      : 'rgba(255, 255, 255, 0.7)',
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[1],
                    backdropFilter: 'blur(8px)',
                    overflowY: 'auto',
                    maxHeight: '500px',
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: theme.palette.divider,
                      borderRadius: '3px',
                    },
                    '&:hover': {
                      boxShadow: theme.shadows[2],
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease-in-out'
                    }
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                      pb: 1,
                      borderBottom: `1px solid ${theme.palette.divider}`
                    }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        Status Breakdown
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {statusData.reduce((sum, item) => sum + item.value, 0)} Total
                      </Typography>
                    </Box>
                    {statusData.map((entry, index) => (
                      <Box 
                        key={`legend-${index}`}
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1,
                          borderRadius: 1,
                          '&:hover': {
                            bgcolor: theme.palette.action.hover
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box 
                            sx={{ 
                              width: 14, 
                              height: 14, 
                              borderRadius: '2px',
                              bgcolor: entry.color,
                              border: `1px solid ${theme.palette.divider}`
                            }} 
                          />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {entry.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                          {entry.value} ({(entry.value / totalJobs * 100).toFixed(1)}%)
                        </Typography>
                      </Box>
                    ))}
                    <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Total: {totalJobs} applications
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Card>
          </GridItem>
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;
