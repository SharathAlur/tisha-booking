import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  InputAdornment,
  IconButton,
  Typography,
  Alert,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment, { Moment } from 'moment';
import { useUIStore } from '../stores/uiStore';
import { useBookingStore } from '../stores/bookingStore';
import { useHallStore } from '../stores/hallStore';
import { EventType, DietaryPreference, BookingFormData } from '../types';

const DIETARY_OPTIONS: { value: DietaryPreference; label: string }[] = [
  { value: 'veg', label: 'Vegetarian' },
  { value: 'non-veg', label: 'Non-Vegetarian' },
];

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'reception', label: 'Reception' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'birthday', label: 'Birthday Party' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'babyShower', label: 'Baby Shower' },
  { value: 'corporate', label: 'Corporate Event' },
  { value: 'other', label: 'Other' },
];

const initialFormData: BookingFormData = {
  date: null,
  eventType: 'wedding',
  guestCount: 100,
  dietaryPreference: 'veg',
  specialRequests: '',
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  hallPrice: 0,
  discount: 0,
  totalAmount: 0,
  advanceAmount: 0,
  advancePaid: false,
  notes: '',
};

const BookingModal: React.FC = () => {
  const { isBookingModalOpen, selectedDate, closeBookingModal, showSnackbar } = useUIStore();
  const { createBooking, isSubmitting, error, clearError, bookings } = useBookingStore();
  const { selectedHall } = useHallStore();

  const [formData, setFormData] = useState<BookingFormData>(initialFormData);
  const [formError, setFormError] = useState<string | null>(null);

  // Set initial values when modal opens
  useEffect(() => {
    if (isBookingModalOpen) {
      const hallPrice = selectedHall?.price || 0;
      setFormData({
        ...initialFormData,
        date: selectedDate ? moment(selectedDate) : null,
        hallPrice: hallPrice,
        discount: 0,
        totalAmount: hallPrice,
        advanceAmount: 0, // 25% advance by default
        advancePaid: true,
      });
      setFormError(null);
      clearError();
    }
  }, [isBookingModalOpen, selectedDate, selectedHall, clearError]);

  const handleChange = (field: keyof BookingFormData, value: unknown) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate total when discount changes
      if (field === 'discount') {
        const discount = Math.max(0, Math.min(value as number, prev.hallPrice));
        updated.discount = discount;
        updated.totalAmount = prev.hallPrice - discount;
      }
      
      // Auto-check advancePaid when advanceAmount > 0
      if (field === 'advanceAmount') {
        updated.advancePaid = (value as number) > 0;
      }
      
      return updated;
    });
    setFormError(null);
  };

  // Helper to get date string from moment
  const getDateString = (date: unknown): string => {
    if (moment.isMoment(date)) {
      return (date as Moment).format('YYYY-MM-DD');
    }
    return '';
  };

  const validateForm = (): boolean => {
    if (!formData.date) {
      setFormError('Please select a date');
      return false;
    }

    // Check if date is already booked
    const dateStr = getDateString(formData.date);
    const isBooked = bookings.some(
      (b) => b.date === dateStr && b.status === 'confirmed'
    );
    if (isBooked) {
      setFormError('This date is already booked');
      return false;
    }

    // Check if date is in the past
    const today = moment().format('YYYY-MM-DD');
    if (dateStr < today) {
      setFormError('Cannot book a past date');
      return false;
    }

    if (!formData.customerName.trim()) {
      setFormError('Please enter customer name');
      return false;
    }

    if (!formData.customerPhone.trim()) {
      setFormError('Please enter customer phone');
      return false;
    }

    if (formData.totalAmount <= 0) {
      setFormError('Please enter a valid amount');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!selectedHall) return;

    try {
      await createBooking(selectedHall.id, selectedHall.name, formData);
      showSnackbar('Booking created successfully!', 'success');
      closeBookingModal();
    } catch {
      showSnackbar(error || 'Failed to create booking', 'error');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Dialog
        open={isBookingModalOpen}
        onClose={closeBookingModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { m: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>
            New Booking
          </Typography>
          <IconButton onClick={closeBookingModal} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {(formError || error) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError || error}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Date & Time */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Event Details
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Event Date *"
                value={formData.date as Moment}
                onChange={(date) => handleChange('date', date)}
                slotProps={{
                  textField: { fullWidth: true, size: 'small' },
                }}
                disablePast
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={formData.eventType}
                  label="Event Type"
                  onChange={(e) => handleChange('eventType', e.target.value)}
                >
                  {EVENT_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Expected Guests"
                type="number"
                value={formData.guestCount}
                onChange={(e) => handleChange('guestCount', parseInt(e.target.value) || 0)}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Dietary Preference</InputLabel>
                <Select
                  value={formData.dietaryPreference}
                  label="Dietary Preference"
                  onChange={(e) => handleChange('dietaryPreference', e.target.value)}
                >
                  {DIETARY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Customer Details */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                Customer Details
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Customer Name *"
                value={formData.customerName}
                onChange={(e) => handleChange('customerName', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number *"
                value={formData.customerPhone}
                onChange={(e) => handleChange('customerPhone', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Email (Optional)"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleChange('customerEmail', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>

            {/* Payment Details */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                Payment Details
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Hall Price"
                type="number"
                value={formData.hallPrice}
                fullWidth
                size="small"
                disabled
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Discount"
                type="number"
                value={formData.discount}
                onChange={(e) => handleChange('discount', parseInt(e.target.value) || 0)}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                helperText={formData.discount > 0 ? `${Math.round((formData.discount / formData.hallPrice) * 100)}% off` : ''}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Final Amount"
                type="number"
                value={formData.totalAmount}
                fullWidth
                size="small"
                disabled
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                sx={{
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: 'primary.main',
                    fontWeight: 600,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Advance Amount"
                type="number"
                value={formData.advanceAmount}
                onChange={(e) => handleChange('advanceAmount', parseInt(e.target.value) || 0)}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                helperText={`Balance: ₹${(formData.totalAmount - formData.advanceAmount).toLocaleString()}`}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.advancePaid}
                    onChange={(e) => handleChange('advancePaid', e.target.checked)}
                  />
                }
                label="Advance Paid"
              />
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                label="Special Requests / Notes"
                value={formData.specialRequests}
                onChange={(e) => handleChange('specialRequests', e.target.value)}
                fullWidth
                multiline
                rows={2}
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeBookingModal}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default BookingModal;
