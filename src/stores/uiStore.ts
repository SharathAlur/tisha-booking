import { create } from 'zustand';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

interface UIStore {
  // Booking modal state
  isBookingModalOpen: boolean;
  selectedDate: Date | null;
  editingBookingId: string | null;
  
  // Snackbar state
  snackbar: SnackbarState;
  
  // Actions
  openBookingModal: (date?: Date | null, bookingId?: string | null) => void;
  closeBookingModal: () => void;
  setSelectedDate: (date: Date | null) => void;
  showSnackbar: (message: string, severity?: SnackbarState['severity']) => void;
  hideSnackbar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isBookingModalOpen: false,
  selectedDate: null,
  editingBookingId: null,

  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },

  openBookingModal: (date?: Date | null, bookingId?: string | null) =>
    set({
      isBookingModalOpen: true,
      selectedDate: date || null,
      editingBookingId: bookingId || null,
    }),

  closeBookingModal: () =>
    set({
      isBookingModalOpen: false,
      selectedDate: null,
      editingBookingId: null,
    }),

  setSelectedDate: (date: Date | null) => set({ selectedDate: date }),

  showSnackbar: (message: string, severity: SnackbarState['severity'] = 'info') =>
    set({
      snackbar: {
        open: true,
        message,
        severity,
      },
    }),

  hideSnackbar: () =>
    set((state) => ({
      snackbar: {
        ...state.snackbar,
        open: false,
      },
    })),
}));
