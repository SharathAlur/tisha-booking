import { create } from 'zustand';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import moment, { Moment } from 'moment';
import { db } from '../firebase/config';
import { Booking, BookingFormData, BookingStatus, BookingSummary } from '../types';

// Helper to get date string from moment or unknown
const getDateString = (date: unknown): string => {
  if (moment.isMoment(date)) {
    return (date as Moment).format('YYYY-MM-DD');
  }
  return '';
};

interface BookingStore {
  bookings: Booking[];
  selectedBooking: Booking | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  subscribeToBookings: (hallId: string) => () => void;
  createBooking: (hallId: string, hallName: string, formData: BookingFormData) => Promise<string>;
  updateBookingStatus: (bookingId: string, status: BookingStatus, reason?: string) => Promise<void>;
  updateBooking: (bookingId: string, data: Partial<Booking>) => Promise<void>;
  selectBooking: (booking: Booking | null) => void;
  clearError: () => void;
  
  // Computed
  getUpcomingBookings: () => Booking[];
  getCompletedBookings: () => Booking[];
  getCancelledBookings: () => Booking[];
  getSummary: (year?: number, month?: number) => BookingSummary;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  bookings: [],
  selectedBooking: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  subscribeToBookings: (hallId: string) => {
    set({ isLoading: true });
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('hallId', '==', hallId),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bookings = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Booking[];
        console.log('bookings', bookings)
        set({ bookings, isLoading: false });
      },
      (error) => {
        console.error('Error subscribing to bookings:', error);
        set({ error: 'Failed to load bookings', isLoading: false });
      }
    );

    return unsubscribe;
  },

  createBooking: async (hallId: string, hallName: string, formData: BookingFormData): Promise<string> => {
    set({ isSubmitting: true, error: null });
    try {
      const bookingsRef = collection(db, 'bookings');
      
      // Check for existing booking on the same date
      const dateStr = getDateString(formData.date);
      const existingQuery = query(
        bookingsRef,
        where('hallId', '==', hallId),
        where('date', '==', dateStr),
        where('status', '==', 'confirmed')
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        throw new Error('This date is already booked.');
      }

      const newBooking = {
        hallId,
        hallName,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || '',
        date: dateStr,
        status: 'confirmed' as BookingStatus,
        details: {
          eventType: formData.eventType,
          guestCount: formData.guestCount,
          dietaryPreference: formData.dietaryPreference || 'veg',
          specialRequests: formData.specialRequests || '',
        },
        totalAmount: formData.totalAmount,
        advanceAmount: formData.advanceAmount || 0,
        advancePaid: formData.advancePaid,
        notes: formData.notes || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(bookingsRef, newBooking);
      set({ isSubmitting: false });
      
      return docRef.id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
      set({ error: errorMessage, isSubmitting: false });
      throw error;
    }
  },

  updateBookingStatus: async (bookingId: string, status: BookingStatus, reason?: string) => {
    set({ isSubmitting: true, error: null });
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const updateData: Record<string, unknown> = {
        status,
        updatedAt: Timestamp.now(),
      };

      if (status === 'cancelled') {
        updateData.cancelledAt = Timestamp.now();
        if (reason) {
          updateData.cancellationReason = reason;
        }
      }

      await updateDoc(bookingRef, updateData);
      set({ isSubmitting: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update booking';
      set({ error: errorMessage, isSubmitting: false });
      throw error;
    }
  },

  updateBooking: async (bookingId: string, data: Partial<Booking>) => {
    set({ isSubmitting: true, error: null });
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
      set({ isSubmitting: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update booking';
      set({ error: errorMessage, isSubmitting: false });
      throw error;
    }
  },

  selectBooking: (booking: Booking | null) => set({ selectedBooking: booking }),

  clearError: () => set({ error: null }),

  // Get upcoming bookings (confirmed, date >= today)
  getUpcomingBookings: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().bookings.filter(
      (b) => b.status === 'confirmed' && b.date >= today
    ).sort((a, b) => a.date.localeCompare(b.date));
  },

  // Get completed bookings (confirmed, date < today)
  getCompletedBookings: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().bookings.filter(
      (b) => b.status === 'confirmed' && b.date < today
    ).sort((a, b) => b.date.localeCompare(a.date));
  },

  // Get cancelled bookings
  getCancelledBookings: () => {
    return get().bookings.filter((b) => b.status === 'cancelled')
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  // Get summary with optional year/month filter
  getSummary: (year?: number, month?: number): BookingSummary => {
    let filteredBookings = get().bookings;

    if (year) {
      filteredBookings = filteredBookings.filter((b) => {
        const bookingDate = new Date(b.date);
        if (month !== undefined) {
          return bookingDate.getFullYear() === year && bookingDate.getMonth() === month;
        }
        return bookingDate.getFullYear() === year;
      });
    }

    const confirmed = filteredBookings.filter((b) => b.status === 'confirmed');
    const cancelled = filteredBookings.filter((b) => b.status === 'cancelled');

    return {
      totalBookings: filteredBookings.length,
      confirmedBookings: confirmed.length,
      cancelledBookings: cancelled.length,
      totalRevenue: confirmed.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      advanceCollected: confirmed.reduce((sum, b) => sum + (b.advancePaid ? (b.advanceAmount || 0) : 0), 0),
    };
  },
}));
