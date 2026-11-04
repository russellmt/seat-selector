import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import type { Rotation } from '../types';
import type { Seat, GridPosition } from '../types/Seat';
import type { Guest } from '../types/Guest';
import type { Color } from '../types/Color';
import type { SortOrder } from '../types/Configuration';

/**
 * GridPosition represents a position on the grid using column and row coordinates
 */
export type { GridPosition };

/**
 * Seat represents a placed instance of an icon on the canvas
 */
export type { Seat };

/**
 * Color represents a guest's assigned color with contrast information
 */
export type { Color };

/**
 * Guest represents a person to be assigned to a seat
 */
export type { Guest };

/**
 * SortOrder represents the ordering of guests in the list
 */
export type { SortOrder };

/**
 * GuestAssignmentMap maps seat numbers to guest IDs
 */
export type GuestAssignmentMap = Map<number, string>;

/**
 * ApplicationState contains all global application state
 */
export interface ApplicationState {
  // Configuration
  title: string;
  seats: Seat[];
  selectedIconId: string;
  selectedRotation: Rotation;
  iconRotationStates: Map<string, Rotation>;

  // Guests
  guests: Guest[];
  selectedGuestId: string | null;
  sortOrder: SortOrder;
  assignments: GuestAssignmentMap;

  // UI
  arrangementName: string;
  currentPage: 'home' | 'canvas' | 'guests';
}

/**
 * ApplicationActions contains all state update functions
 */
export interface ApplicationActions {
  // Seat actions
  addSeat: (seat: Seat) => void;
  addSeats: (seats: Seat[]) => void;
  removeSeat: (seatId: string) => void;
  removeSeats: (seatIds: string[]) => void;
  clearAllSeats: () => void;
  updateSeatNumbers: () => void;

  // Icon selection
  setSelectedIcon: (iconId: string) => void;
  setRotation: (rotation: Rotation) => void;
  setIconRotation: (iconId: string, rotation: Rotation) => void;

  // Title
  setTitle: (title: string) => void;

  // Guest actions
  addGuest: (guest: Guest) => void;
  removeGuest: (guestId: string) => void;
  updateGuest: (guestId: string, updates: Partial<Guest>) => void;
  selectGuest: (guestId: string | null) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
  reorderGuests: (fromIndex: number, toIndex: number) => void;
  clearAllGuests: () => void;

  // Assignment actions
  assignGuest: (seatNumber: number, guestId: string) => void;
  unassignGuest: (seatNumber: number) => void;
  clearAllAssignments: () => void;

  // Arrangement
  setArrangementName: (name: string) => void;

  // Navigation
  setCurrentPage: (page: 'home' | 'canvas' | 'guests') => void;
}

/**
 * ApplicationContextType combines state and actions
 */
export interface ApplicationContextType extends ApplicationState, ApplicationActions {}

/**
 * Create the application context
 */
const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

/**
 * AppProvider component that wraps the entire application
 * Manages all global state for seats, guests, and UI
 */
export function AppProvider({ children }: { children: ReactNode }) {
  // Configuration state
  const [title, setTitle] = useState<string>('');
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedIconId, setSelectedIconId] = useState<string>('table-round-4');
  const [selectedRotation, setSelectedRotation] = useState<Rotation>('down');
  const [iconRotationStates, setIconRotationStates] = useState<Map<string, Rotation>>(
    new Map([['table-round-4', 'down']])
  );

  // Guest state
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('original');
  const [assignments, setAssignments] = useState<GuestAssignmentMap>(new Map());

  // UI state
  const [arrangementName, setArrangementName] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<'home' | 'canvas' | 'guests'>('home');

  // ============ Seat Actions ============

  const addSeat = useCallback((seat: Seat) => {
    setSeats((prevSeats) => {
      // Check if seat already exists at position
      const exists = prevSeats.some(
        (s) => s.position.col === seat.position.col && s.position.row === seat.position.row
      );
      if (exists) return prevSeats;
      return [...prevSeats, seat];
    });
  }, []);

  const addSeats = useCallback((newSeats: Seat[]) => {
    setSeats((prevSeats) => {
      const existingPositions = new Set(
        prevSeats.map((s) => `${s.position.col},${s.position.row}`)
      );
      const toAdd = newSeats.filter(
        (s) => !existingPositions.has(`${s.position.col},${s.position.row}`)
      );
      return [...prevSeats, ...toAdd];
    });
  }, []);

  const removeSeat = useCallback((seatId: string) => {
    setSeats((prevSeats) => prevSeats.filter((s) => s.id !== seatId));
  }, []);

  const removeSeats = useCallback((seatIds: string[]) => {
    const idsToRemove = new Set(seatIds);
    setSeats((prevSeats) => prevSeats.filter((s) => !idsToRemove.has(s.id)));
  }, []);

  const clearAllSeats = useCallback(() => {
    setSeats([]);
    setAssignments(new Map());
  }, []);

  const updateSeatNumbers = useCallback(() => {
    setSeats((prevSeats) => {
      // Sort seats by row, then by column
      const sorted = [...prevSeats].sort((a, b) => {
        if (a.position.row !== b.position.row) {
          return a.position.row - b.position.row;
        }
        return a.position.col - b.position.col;
      });

      // Assign numbers
      return sorted.map((seat, index) => ({
        ...seat,
        number: index + 1,
      }));
    });
  }, []);

  // ============ Icon Selection Actions ============

  const setSelectedIcon = useCallback((iconId: string) => {
    setSelectedIconId(iconId);
    // Get the rotation for this icon, or default to 'down'
    const rotation = iconRotationStates.get(iconId) ?? 'down';
    setSelectedRotation(rotation);
  }, [iconRotationStates]);

  const setRotation = useCallback((rotation: Rotation) => {
    setSelectedRotation(rotation);
    setIconRotationStates((prev) => new Map(prev).set(selectedIconId, rotation));
  }, [selectedIconId]);

  const setIconRotation = useCallback((iconId: string, rotation: Rotation) => {
    setIconRotationStates((prev) => new Map(prev).set(iconId, rotation));
  }, []);

  // ============ Title Actions ============

  const setTitleState = useCallback((newTitle: string) => {
    // Limit to 32 characters
    if (newTitle.length <= 32) {
      setTitle(newTitle);
    }
  }, []);

  // ============ Guest Actions ============

  const addGuest = useCallback((guest: Guest) => {
    setGuests((prevGuests) => [...prevGuests, guest]);
  }, []);

  const removeGuest = useCallback((guestId: string) => {
    setGuests((prevGuests) => prevGuests.filter((g) => g.id !== guestId));
    
    // Unassign from all seats
    setAssignments((prevAssignments) => {
      const newAssignments = new Map(prevAssignments);
      for (const [seatNum, assignedGuestId] of newAssignments.entries()) {
        if (assignedGuestId === guestId) {
          newAssignments.delete(seatNum);
        }
      }
      return newAssignments;
    });

    // Clear selection if this guest was selected
    if (selectedGuestId === guestId) {
      setSelectedGuestId(null);
    }
  }, [selectedGuestId]);

  const updateGuest = useCallback((guestId: string, updates: Partial<Guest>) => {
    setGuests((prevGuests) =>
      prevGuests.map((g) => (g.id === guestId ? { ...g, ...updates } : g))
    );
  }, []);

  const selectGuest = useCallback((guestId: string | null) => {
    setSelectedGuestId(guestId);
  }, []);

  const setSortOrderState = useCallback((newSortOrder: SortOrder) => {
    setSortOrder(newSortOrder);
  }, []);

  const reorderGuests = useCallback((fromIndex: number, toIndex: number) => {
    setGuests((prevGuests) => {
      const newGuests = [...prevGuests];
      const [moved] = newGuests.splice(fromIndex, 1);
      newGuests.splice(toIndex, 0, moved);
      return newGuests;
    });
  }, []);

  const clearAllGuests = useCallback(() => {
    setGuests([]);
    setSelectedGuestId(null);
    setAssignments(new Map());
  }, []);

  // ============ Assignment Actions ============

  const assignGuest = useCallback((seatNumber: number, guestId: string) => {
    setAssignments((prev) => new Map(prev).set(seatNumber, guestId));
  }, []);

  const unassignGuest = useCallback((seatNumber: number) => {
    setAssignments((prev) => {
      const newAssignments = new Map(prev);
      newAssignments.delete(seatNumber);
      return newAssignments;
    });
  }, []);

  const clearAllAssignmentsState = useCallback(() => {
    setAssignments(new Map());
  }, []);

  // ============ Arrangement Actions ============

  const setArrangementNameState = useCallback((name: string) => {
    setArrangementName(name);
  }, []);

  // ============ Navigation Actions ============

  const setCurrentPageState = useCallback((page: 'home' | 'canvas' | 'guests') => {
    setCurrentPage(page);
  }, []);

  // ============ Context Value ============

  const value: ApplicationContextType = {
    // State
    title,
    seats,
    selectedIconId,
    selectedRotation,
    iconRotationStates,
    guests,
    selectedGuestId,
    sortOrder,
    assignments,
    arrangementName,
    currentPage,

    // Seat actions
    addSeat,
    addSeats,
    removeSeat,
    removeSeats,
    clearAllSeats,
    updateSeatNumbers,

    // Icon selection
    setSelectedIcon,
    setRotation,
    setIconRotation,

    // Title
    setTitle: setTitleState,

    // Guest actions
    addGuest,
    removeGuest,
    updateGuest,
    selectGuest,
    setSortOrder: setSortOrderState,
    reorderGuests,
    clearAllGuests,

    // Assignment actions
    assignGuest,
    unassignGuest,
    clearAllAssignments: clearAllAssignmentsState,

    // Arrangement
    setArrangementName: setArrangementNameState,

    // Navigation
    setCurrentPage: setCurrentPageState,
  };

  return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>;
}

/**
 * useApp hook - provides access to the application context
 * Must be used within an AppProvider
 */
export function useApp(): ApplicationContextType {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppProvider;
