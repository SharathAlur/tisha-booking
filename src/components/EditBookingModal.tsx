import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  IconButton,
  Typography,
  Alert,
  InputAdornment,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Close, Event, Person, Phone, AttachMoney } from '@mui/icons-material';
import moment from 'moment';
import { useBookingStore } from '../stores/bookingStore';
import { useUIStore } from '../stores/uiStore';
import { Booking, DietaryPreference } from '../types';

const DIETARY_OPTIONS: { value: DietaryPreference; label: string }[] = [
  { value: 'veg', label: 'Vegetarian' },
  { value: 'non-veg', label: 'Non-Vegetarian' },
];

interface EditBookingModalProps {
  open: boolean;
  booking: Booking | null;
  onClose: () => void;
}

const formatDate = (dateStr: string): string => {
  return moment(dateStr).format('ddd, D MMM YYYY');
};

const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

const EditBookingModal: React.FC<EditBookingModalProps> = ({ open, booking, onClose }) => {
  const { updateBooking, isSubmitting, error, clearError } = useBookingStore();
  const { showSnackbar } = useUIStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>(DIETARY_OPTIONS[0].value);
  const [formError, setFormError] = useState<string | null>(null);

  // Set initial values when modal opens with a booking
  useEffect(() => {
    if (open && booking) {
      setCustomerName(booking.customerName);
      setCustomerPhone(booking.customerPhone);
      setTotalAmount(booking.totalAmount);
      setAdvanceAmount(booking.advanceAmount || 0);
      setDietaryPreference(booking.details.dietaryPreference || DIETARY_OPTIONS[0].value)

      setFormError(null);
      clearError();
    }
  }, [open, booking, clearError]);

  const validateForm = (): boolean => {
    if (!customerName.trim()) {
      setFormError('Please enter customer name');
      return false;
    }

    if (!customerPhone.trim()) {
      setFormError('Please enter phone number');
      return false;
    }

    if (totalAmount <= 0) {
      setFormError('Total amount must be greater than 0');
      return false;
    }

    if (advanceAmount > totalAmount) {
      setFormError('Advance amount cannot exceed total amount');
      return false;
    }

    if (advanceAmount <= 0) {
      setFormError('Advance amount is required.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !booking) return;

    try {
      await updateBooking(booking.id, {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        totalAmount,
        advanceAmount,
        details: {
          ...booking.details,
          dietaryPreference
        }
      });
      showSnackbar('Booking updated successfully!', 'success');
      onClose();
    } catch {
      showSnackbar(error || 'Failed to update booking', 'error');
    }
  };

  const handleClose = () => {
    setFormError(null);
    onClose();
  };

  if (!booking) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { m: 1 } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          Edit Booking
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>

        {/* Booking Info Header */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Event color="primary" fontSize="small" />
            <Typography variant="subtitle1" fontWeight={600}>
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
              label={`${booking.details.guestCount} guests`}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>

        <Grid container spacing={2.5}>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Dietary Preference</InputLabel>
              <Select
                value={dietaryPreference}
                label="Dietary Preference"
                onChange={(e) => setDietaryPreference(e.target.value as DietaryPreference)}
              >
                {DIETARY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* Customer Details Section */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Person fontSize="small" />
              Customer Details
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Customer Name"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setFormError(null);
              }}
              fullWidth
              size="small"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Phone Number"
              value={customerPhone}
              onChange={(e) => {
                setCustomerPhone(e.target.value);
                setFormError(null);
              }}
              fullWidth
              size="small"
              required
              type='number'
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Payment Details Section */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AttachMoney fontSize="small" />
              Payment Details
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Total Amount"
              type="number"
              value={totalAmount}
              onChange={(e) => {
                setTotalAmount(parseInt(e.target.value) || 0);
                setFormError(null);
              }}
              fullWidth
              size="small"
              required
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Advance Amount"
              type="number"
              value={advanceAmount}
              onChange={(e) => {
                setAdvanceAmount(parseInt(e.target.value) || 0);
                setFormError(null);
              }}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              helperText={totalAmount > 0 ? `Balance: ${formatCurrency(totalAmount - advanceAmount)}` : ''}
            />
          </Grid>
        </Grid>
      </DialogContent>
      {(formError || error) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formError || error}
        </Alert>
      )}
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditBookingModal;

