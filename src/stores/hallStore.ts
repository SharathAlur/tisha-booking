import { create } from 'zustand';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Hall } from '../types';

interface HallStore {
  halls: Hall[];
  selectedHall: Hall | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchHalls: () => Promise<void>;
  fetchHallById: (id: string) => Promise<void>;
  setSelectedHall: (hall: Hall | null) => void;
  subscribeToHall: (id: string) => () => void;
  updateHallAvailability: (hallId: string, date: string, isAvailable: boolean) => Promise<void>;
  blockDate: (hallId: string, date: string) => Promise<void>;
  unblockDate: (hallId: string, date: string) => Promise<void>;
  clearError: () => void;
}

export const useHallStore = create<HallStore>((set, get) => ({
  halls: [],
  selectedHall: null,
  isLoading: false,
  error: null,

  fetchHalls: async () => {
    set({ isLoading: true, error: null });
    try {
      const hallsRef = collection(db, 'halls');
      const snapshot = await getDocs(hallsRef);
      
      const halls = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Hall[];
      
      console.log('Fetched halls:', halls.length, halls);
      
      set({ halls, isLoading: false });
      
      // Auto-select first hall
      if (halls.length >= 1 && !get().selectedHall) {
        set({ selectedHall: halls[0] });
      }
    } catch (error: unknown) {
      console.error('Error fetching halls:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch halls';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchHallById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const hallRef = doc(db, 'halls', id);
      const hallSnap = await getDoc(hallRef);
      
      if (hallSnap.exists()) {
        const hall = { id: hallSnap.id, ...hallSnap.data() } as Hall;
        set({ selectedHall: hall, isLoading: false });
      } else {
        set({ error: 'Hall not found', isLoading: false });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch hall';
      set({ error: errorMessage, isLoading: false });
    }
  },

  setSelectedHall: (hall: Hall | null) => set({ selectedHall: hall }),

  subscribeToHall: (id: string) => {
    const hallRef = doc(db, 'halls', id);
    
    const unsubscribe = onSnapshot(
      hallRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const hall = { id: snapshot.id, ...snapshot.data() } as Hall;
          set({ selectedHall: hall });
          
          // Also update in halls array
          const halls = get().halls.map((h) => (h.id === id ? hall : h));
          set({ halls });
        }
      },
      (error) => {
        console.error('Error subscribing to hall:', error);
        set({ error: 'Failed to subscribe to hall updates' });
      }
    );

    return unsubscribe;
  },

  updateHallAvailability: async (hallId: string, date: string, isAvailable: boolean) => {
    try {
      const hallRef = doc(db, 'halls', hallId);
      
      if (isAvailable) {
        await updateDoc(hallRef, {
          availableDates: arrayUnion(date),
          bookedDates: arrayRemove(date),
          updatedAt: Timestamp.now(),
        });
      } else {
        await updateDoc(hallRef, {
          availableDates: arrayRemove(date),
          bookedDates: arrayUnion(date),
          updatedAt: Timestamp.now(),
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update availability';
      set({ error: errorMessage });
      throw error;
    }
  },

  blockDate: async (hallId: string, date: string) => {
    try {
      const hallRef = doc(db, 'halls', hallId);
      await updateDoc(hallRef, {
        blockedDates: arrayUnion(date),
        availableDates: arrayRemove(date),
        updatedAt: Timestamp.now(),
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to block date';
      set({ error: errorMessage });
      throw error;
    }
  },

  unblockDate: async (hallId: string, date: string) => {
    try {
      const hallRef = doc(db, 'halls', hallId);
      await updateDoc(hallRef, {
        blockedDates: arrayRemove(date),
        availableDates: arrayUnion(date),
        updatedAt: Timestamp.now(),
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unblock date';
      set({ error: errorMessage });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

