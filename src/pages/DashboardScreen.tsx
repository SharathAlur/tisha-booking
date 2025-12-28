import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  Event,
  CheckCircle,
  Cancel,
  AttachMoney,
  AccountBalance,
} from '@mui/icons-material';
import { useBookingStore } from '../stores/bookingStore';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ color }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: `${color}15`,
            color,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const formatCurrency = (amount: number): string => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

const DashboardScreen: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [filterType, setFilterType] = useState<'month' | 'year'>('month');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const { getSummary, bookings } = useBookingStore();

  // Generate available years from bookings
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(currentYear);
    bookings.forEach((b) => {
      years.add(new Date(b.date).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [bookings, currentYear]);

  // Get summary based on filter
  const summary = useMemo(() => {
    if (filterType === 'month') {
      return getSummary(selectedYear, selectedMonth);
    }
    return getSummary(selectedYear);
  }, [getSummary, filterType, selectedYear, selectedMonth]);

  // Get month-wise breakdown for the selected year
  const monthlyBreakdown = useMemo(() => {
    if (filterType === 'year') {
      return MONTHS.map((name, index) => {
        const monthSummary = getSummary(selectedYear, index);
        return {
          name: name.substring(0, 3),
          ...monthSummary,
        };
      });
    }
    return [];
  }, [getSummary, filterType, selectedYear]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Dashboard
      </Typography>

      {/* Filter Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <ToggleButtonGroup
              value={filterType}
              exclusive
              onChange={(_, value) => value && setFilterType(value)}
              size="small"
            >
              <ToggleButton value="month">Monthly</ToggleButton>
              <ToggleButton value="year">Yearly</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid item>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                label="Year"
                onChange={(e) => setSelectedYear(e.target.value as number)}
              >
                {availableYears.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {filterType === 'month' && (
            <Grid item>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Month</InputLabel>
                <Select
                  value={selectedMonth}
                  label="Month"
                  onChange={(e) => setSelectedMonth(e.target.value as number)}
                >
                  {MONTHS.map((month, index) => (
                    <MenuItem key={month} value={index}>
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} md={4} lg={2}>
          <StatCard
            title="Total Bookings"
            value={summary.totalBookings}
            icon={<Event />}
            color="#1976d2"
          />
        </Grid>

        <Grid item xs={6} md={4} lg={2}>
          <StatCard
            title="Confirmed"
            value={summary.confirmedBookings}
            icon={<CheckCircle />}
            color="#2e7d32"
          />
        </Grid>

        <Grid item xs={6} md={4} lg={2}>
          <StatCard
            title="Cancelled"
            value={summary.cancelledBookings}
            icon={<Cancel />}
            color="#d32f2f"
          />
        </Grid>

        <Grid item xs={6} md={4} lg={2}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(summary.totalRevenue)}
            icon={<TrendingUp />}
            color="#ed6c02"
            subtitle="From confirmed bookings"
          />
        </Grid>

        <Grid item xs={6} md={4} lg={2}>
          <StatCard
            title="Advance Collected"
            value={formatCurrency(summary.advanceCollected)}
            icon={<AccountBalance />}
            color="#9c27b0"
          />
        </Grid>

        <Grid item xs={6} md={4} lg={2}>
          <StatCard
            title="Balance Due"
            value={formatCurrency(summary.totalRevenue - summary.advanceCollected)}
            icon={<AttachMoney />}
            color="#0288d1"
          />
        </Grid>
      </Grid>

      {/* Monthly Breakdown (Only for Year view) */}
      {filterType === 'year' && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Monthly Breakdown - {selectedYear}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ overflowX: 'auto' }}>
              <Box sx={{ display: 'flex', gap: 1, minWidth: 'max-content' }}>
                {monthlyBreakdown.map((month) => (
                  <Paper
                    key={month.name}
                    sx={{
                      p: 2,
                      minWidth: 80,
                      textAlign: 'center',
                      bgcolor: month.totalBookings > 0 ? 'primary.light' : 'grey.100',
                      color: month.totalBookings > 0 ? 'primary.contrastText' : 'text.secondary',
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {month.name}
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {month.confirmedBookings}
                    </Typography>
                    <Typography variant="caption">
                      {month.totalBookings} total
                    </Typography>
                    {month.totalRevenue > 0 && (
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 0.5, color: 'inherit', opacity: 0.9 }}
                      >
                        {formatCurrency(month.totalRevenue)}
                      </Typography>
                    )}
                  </Paper>
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Summary for Month view */}
      {filterType === 'month' && summary.totalBookings > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {MONTHS[selectedMonth]} {selectedYear} Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Confirmation Rate</Typography>
                  <Typography fontWeight={600}>
                    {summary.totalBookings > 0
                      ? Math.round((summary.confirmedBookings / summary.totalBookings) * 100)
                      : 0}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Avg. Booking Value</Typography>
                  <Typography fontWeight={600}>
                    {summary.confirmedBookings > 0
                      ? formatCurrency(Math.round(summary.totalRevenue / summary.confirmedBookings))
                      : '₹0'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Advance Collection Rate</Typography>
                  <Typography fontWeight={600}>
                    {summary.totalRevenue > 0
                      ? Math.round((summary.advanceCollected / summary.totalRevenue) * 100)
                      : 0}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Pending Collection</Typography>
                  <Typography fontWeight={600} color="warning.main">
                    {formatCurrency(summary.totalRevenue - summary.advanceCollected)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {summary.totalBookings === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Event sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No bookings found for{' '}
              {filterType === 'month'
                ? `${MONTHS[selectedMonth]} ${selectedYear}`
                : selectedYear}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default DashboardScreen;

