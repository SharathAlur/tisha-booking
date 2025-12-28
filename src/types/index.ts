import { Timestamp } from 'firebase/firestore';

// Hall types
export interface HallAmenity {
  id: string;
  name: string;
  icon: string;
  included: boolean;
}

export interface HallImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface Hall {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  capacity?: number;
  squareFeet?: number;
  amenities?: HallAmenity[];
  images?: HallImage[];
  price?: number;
  phone?: string;
  rules?: string[];
  availableDates?: string[];
  bookedDates?: string[];
  blockedDates?: string[];
  isActive?: boolean;
  ownerId?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Booking types - Simplified for owner use
export type BookingStatus = 'confirmed' | 'cancelled';

export type EventType = 
  | 'wedding'
  | 'reception'
  | 'birthday'
  | 'corporate'
  | 'engagement'
  | 'anniversary'
  | 'babyShower'
  | 'other';

export type DietaryPreference = 'veg' | 'non-veg';

export interface BookingDetails {
  eventType: EventType;
  guestCount: number;
  dietaryPreference: DietaryPreference;
  specialRequests?: string;
}

export interface Booking {
  id: string;
  hallId: string;
  hallName: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string; // ISO date string (full day booking)
  status: BookingStatus;
  details: BookingDetails;
  totalAmount: number;
  advanceAmount?: number;
  advancePaid: boolean;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  cancelledAt?: Timestamp;
  cancellationReason?: string;
}

// Form types
export interface BookingFormData {
  date: unknown; // Moment object from date picker
  eventType: EventType;
  guestCount: number;
  dietaryPreference: DietaryPreference;
  specialRequests: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  hallPrice: number;
  discount: number;
  totalAmount: number;
  advanceAmount: number;
  advancePaid: boolean;
  notes: string;
}

// Dashboard types
export interface BookingSummary {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  advanceCollected: number;
}

// Calendar types
export interface CalendarDate {
  date: Date;
  isBooked: boolean;
  isToday: boolean;
  isPast: boolean;
}

// Store types
export interface HallState {
  halls: Hall[];
  selectedHall: Hall | null;
  isLoading: boolean;
  error: string | null;
}

export interface BookingState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

export interface UIState {
  isBookingModalOpen: boolean;
  selectedDate: Date | null;
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  };
}
