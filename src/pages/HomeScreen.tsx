import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import moment from 'moment';
import { useHallStore } from '../stores/hallStore';
import { useBookingStore } from '../stores/bookingStore';
import { useUIStore } from '../stores/uiStore';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HomeScreen: React.FC = () => {
  const { selectedHall } = useHallStore();
  const { bookings } = useBookingStore();
  const { openBookingModal } = useUIStore();
  const [currentMonth, setCurrentMonth] = React.useState(moment());

  const bookedDates = useMemo(() => {
    return new Set(
      bookings
        .filter((b) => b.status === 'confirmed')
        .map((b) => b.date)
    );
  }, [bookings]);

  const calendarDays = useMemo(() => {
    const startOfMonth = currentMonth.clone().startOf('month');
    const endOfMonth = currentMonth.clone().endOf('month');
    const today = moment().format('YYYY-MM-DD');

    const days: Array<{
      date: moment.Moment | null;
      dateStr: string;
      dayOfMonth: number;
      isBooked: boolean;
      isToday: boolean;
      isPast: boolean;
    }> = [];

    // Add empty days for the start of the week
    for (let i = 0; i < startOfMonth.day(); i++) {
      days.push({ date: null, dateStr: '', dayOfMonth: 0, isBooked: false, isToday: false, isPast: false });
    }

    // Add all days of the month
    for (let day = 1; day <= endOfMonth.date(); day++) {
      const date = currentMonth.clone().date(day);
      const dateStr = date.format('YYYY-MM-DD');
      days.push({
        date,
        dateStr,
        dayOfMonth: day,
        isBooked: bookedDates.has(dateStr),
        isToday: dateStr === today,
        isPast: dateStr < today,
      });
    }

    return days;
  }, [currentMonth, bookedDates]);

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.clone().subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.clone().add(1, 'month'));
  };

  const handleDateClick = (dateStr: string, isBooked: boolean, isPast: boolean) => {
    if (isPast) return;
    if (!isBooked) {
      openBookingModal(moment(dateStr).toDate());
    }
  };

  if (!selectedHall) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No hall selected</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Grid container spacing={3}>

        {/* Calendar Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>

              {/* Month Navigation */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={handlePrevMonth}>
                  <ChevronLeft />
                </IconButton>
                <Typography variant="h6">
                  {currentMonth.format('MMMM YYYY')}
                </Typography>
                <IconButton onClick={handleNextMonth}>
                  <ChevronRight />
                </IconButton>
              </Box>

              {/* Day Headers */}
              <Grid container spacing={0.5} sx={{ mb: 1 }}>
                {DAYS.map((day) => (
                  <Grid item xs={12 / 7} key={day}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      textAlign="center"
                      color="text.secondary"
                    >
                      {day}
                    </Typography>
                  </Grid>
                ))}
              </Grid>

              {/* Calendar Days */}
              <Grid container spacing={0.5}>
                {calendarDays.map((day, index) => (
                  <Grid item xs={12 / 7} key={index}>
                    {day.date ? (
                      <Tooltip
                        title={day.isBooked
                            ? 'Booked'
                            : day.isPast
                            ? 'Past date' 
                            : 'Click to book'
                        }
                      >
                        <Paper
                          sx={{
                            p: 1,
                            textAlign: 'center',
                            cursor: day.isPast ? 'not-allowed' : 'pointer',
                            bgcolor: day.isBooked
                              ? 'error.main'
                              : day.isToday
                              ? 'primary.main'
                              : day.isPast
                              ? 'grey.100'
                              : 'success.light',
                            color: day.isBooked || day.isToday
                              ? 'white'
                              : day.isPast
                              ? 'grey.500'
                              : 'success.contrastText',
                            '&:hover': {
                              bgcolor: day.isBooked
                                ? 'error.main'
                                : day.isPast
                                ? 'grey.100'
                                : 'success.main',
                            },
                            transition: 'background-color 0.2s',
                          }}
                          onClick={() => handleDateClick(day.dateStr, day.isBooked, day.isPast)}
                        >
                          <Typography variant="body2" fontWeight={day.isToday ? 700 : 400}>
                            {day.dayOfMonth}
                          </Typography>
                        </Paper>
                      </Tooltip>
                    ) : (
                      <Box sx={{ p: 1 }} />
                    )}
                  </Grid>
                ))}
              </Grid>

              {/* Legend */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: 'success.light', borderRadius: 0.5 }} />
                  <Typography variant="caption">Available</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: 'error.main', borderRadius: 0.5 }} />
                  <Typography variant="caption">Booked</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: 'primary.main', borderRadius: 0.5 }} />
                  <Typography variant="caption">Today</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomeScreen;
