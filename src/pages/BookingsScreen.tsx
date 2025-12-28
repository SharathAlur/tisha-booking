import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Divider,
  Fab,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Add,
  Cancel,
  Event,
  Person,
  Phone,
  AttachMoney,
  EventNote,
} from '@mui/icons-material';
import moment from 'moment';
import { useBookingStore } from '../stores/bookingStore';
import { useUIStore } from '../stores/uiStore';
import { Booking } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ py: 2 }}>
    {value === index && children}
  </Box>
);

const formatDate = (dateStr: string): string => {
  return moment(dateStr).format('ddd, D MMM YYYY');
};

const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

interface BookingCardProps {
  booking: Booking;
  onCancel?: (booking: Booking) => void;
  showCancelButton?: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onCancel, showCancelButton }) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Event color="primary" fontSize="small" />
              <Typography variant="h6" fontWeight={600}>
                {formatDate(booking.date)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={booking.details.eventType.replace(/([A-Z])/g, ' $1').trim()}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                label={booking.details.dietaryPreference === 'veg' ? '🥬 Veg' : '🍖 Non-Veg'}
                size="small"
                color={booking.details.dietaryPreference === 'veg' ? 'success' : 'warning'}
                variant="outlined"
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={booking.status}
              size="small"
              color={booking.status === 'confirmed' ? 'success' : 'error'}
            />
            {showCancelButton && booking.status === 'confirmed' && (
              <Tooltip title="Cancel Booking">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onCancel?.(booking)}
                >
                  <Cancel />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 150 }}>
            <Person color="action" fontSize="small" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Customer
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {booking.customerName}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 150 }}>
            <Phone color="action" fontSize="small" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Phone
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {booking.customerPhone}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
            <AttachMoney color="action" fontSize="small" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Amount
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {formatCurrency(booking.totalAmount)}
              </Typography>
            </Box>
          </Box>

          {booking.advanceAmount && booking.advanceAmount > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
              <AttachMoney color="action" fontSize="small" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Advance {booking.advancePaid ? '(Paid)' : '(Pending)'}
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={500}
                  color={booking.advancePaid ? 'success.main' : 'warning.main'}
                >
                  {formatCurrency(booking.advanceAmount)}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {(booking.details.specialRequests || booking.notes) && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <EventNote color="action" fontSize="small" sx={{ mt: 0.25 }} />
              <Typography variant="body2" color="text.secondary">
                {booking.details.specialRequests || booking.notes}
              </Typography>
            </Box>
          </>
        )}

        {booking.status === 'cancelled' && booking.cancellationReason && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Alert severity="error" sx={{ py: 0.5 }}>
              Cancelled: {booking.cancellationReason}
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const BookingsScreen: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const {
    getUpcomingBookings,
    getCompletedBookings,
    getCancelledBookings,
    updateBookingStatus,
    isSubmitting,
  } = useBookingStore();
  const { openBookingModal, showSnackbar } = useUIStore();

  const upcomingBookings = getUpcomingBookings();
  const completedBookings = getCompletedBookings();
  const cancelledBookings = getCancelledBookings();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
    setCancelReason('');
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;

    try {
      await updateBookingStatus(selectedBooking.id, 'cancelled', cancelReason);
      showSnackbar('Booking cancelled successfully', 'success');
      setCancelDialogOpen(false);
      setSelectedBooking(null);
    } catch {
      showSnackbar('Failed to cancel booking', 'error');
    }
  };

  const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <EventNote sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: 'auto', pb: 10 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={600}>
          Bookings
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => openBookingModal()}
        >
          New Booking
        </Button>
      </Box>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Upcoming
              {upcomingBookings.length > 0 && (
                <Chip label={upcomingBookings.length} size="small" color="primary" />
              )}
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Completed
              {completedBookings.length > 0 && (
                <Chip label={completedBookings.length} size="small" />
              )}
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Cancelled
              {cancelledBookings.length > 0 && (
                <Chip label={cancelledBookings.length} size="small" color="error" />
              )}
            </Box>
          }
        />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        {upcomingBookings.length === 0 ? (
          <EmptyState message="No upcoming bookings" />
        ) : (
          upcomingBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancelClick}
              showCancelButton
            />
          ))
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {completedBookings.length === 0 ? (
          <EmptyState message="No completed bookings" />
        ) : (
          completedBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {cancelledBookings.length === 0 ? (
          <EmptyState message="No cancelled bookings" />
        ) : (
          cancelledBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        )}
      </TabPanel>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 24,
          display: { xs: 'flex', md: 'none' },
        }}
        onClick={() => openBookingModal()}
      >
        <Add />
      </Fab>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to cancel this booking for{' '}
            <strong>{selectedBooking?.customerName}</strong> on{' '}
            <strong>{selectedBooking ? formatDate(selectedBooking.date) : ''}</strong>?
          </DialogContentText>
          <TextField
            fullWidth
            label="Cancellation Reason (Optional)"
            multiline
            rows={2}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Keep Booking</Button>
          <Button
            onClick={handleConfirmCancel}
            color="error"
            variant="contained"
            disabled={isSubmitting}
          >
            Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingsScreen;

