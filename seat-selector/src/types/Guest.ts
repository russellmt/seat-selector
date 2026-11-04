/**
 * Guest and Guest Assignment Types
 * Defines the structure for guests and their assignments to seats
 */

import type { Color } from './Color';

/**
 * Guest represents a person to be assigned to seats in the arrangement
 */
export interface Guest {
  id: string;         // unique identifier
  name: string;       // guest's name
  initials: string;   // derived from guest name (e.g., "John Smith" -> "JS")
  colorSeed: string;  // the value used to seed the color generation (typically the name)
  color: Color;       // the assigned color for this guest
}

/**
 * Creates a new guest with the given parameters
 * @param name - the guest's name
 * @param color - the guest's color
 * @returns a new Guest object
 */
export function createGuest(name: string, color: Color): Guest {
  const initials = extractInitials(name);
  return {
    id: `guest-${Math.random().toString(36).substr(2, 9)}`,
    name,
    initials,
    colorSeed: name,
    color,
  };
}

/**
 * Extracts initials from a name
 * @param name - the guest's name
 * @returns the initials (e.g., "John Smith" -> "JS")
 */
export function extractInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => word[0].toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Type alias for a map of seat numbers to guest IDs
 * Represents which guest is assigned to which seat
 */
export type GuestAssignmentMap = Map<number, string>;

/**
 * Creates an empty guest assignment map
 * @returns a new empty GuestAssignmentMap
 */
export function createGuestAssignmentMap(): GuestAssignmentMap {
  return new Map();
}

/**
 * Checks if a seat is assigned
 * @param assignments - the assignment map
 * @param seatNumber - the seat number to check
 * @returns true if the seat has an assigned guest
 */
export function isAssigned(assignments: GuestAssignmentMap, seatNumber: number): boolean {
  return assignments.has(seatNumber);
}

/**
 * Gets the guest ID assigned to a seat
 * @param assignments - the assignment map
 * @param seatNumber - the seat number
 * @returns the guest ID, or undefined if not assigned
 */
export function getAssignedGuest(
  assignments: GuestAssignmentMap,
  seatNumber: number,
): string | undefined {
  return assignments.get(seatNumber);
}

/**
 * Assigns a guest to a seat
 * @param assignments - the assignment map
 * @param seatNumber - the seat number
 * @param guestId - the guest ID
 * @returns a new assignment map with the assignment made
 */
export function assignGuestToSeat(
  assignments: GuestAssignmentMap,
  seatNumber: number,
  guestId: string,
): GuestAssignmentMap {
  const newAssignments = new Map(assignments);
  newAssignments.set(seatNumber, guestId);
  return newAssignments;
}

/**
 * Unassigns a guest from a seat
 * @param assignments - the assignment map
 * @param seatNumber - the seat number
 * @returns a new assignment map with the assignment removed
 */
export function unassignGuestFromSeat(
  assignments: GuestAssignmentMap,
  seatNumber: number,
): GuestAssignmentMap {
  const newAssignments = new Map(assignments);
  newAssignments.delete(seatNumber);
  return newAssignments;
}

/**
 * Unassigns all guests from all seats
 * @param assignments - the assignment map
 * @returns a new empty GuestAssignmentMap
 */
export function clearAllAssignments(): GuestAssignmentMap {
  return new Map();
}

/**
 * Gets all seats assigned to a specific guest
 * @param assignments - the assignment map
 * @param guestId - the guest ID to search for
 * @returns an array of seat numbers assigned to this guest
 */
export function getSeatsForGuest(
  assignments: GuestAssignmentMap,
  guestId: string,
): number[] {
  const seats: number[] = [];
  for (const [seatNumber, assignedGuestId] of assignments.entries()) {
    if (assignedGuestId === guestId) {
      seats.push(seatNumber);
    }
  }
  return seats.sort((a, b) => a - b);
}

/**
 * Unassigns a guest from all seats
 * @param assignments - the assignment map
 * @param guestId - the guest ID
 * @returns a new assignment map with the guest unassigned from all seats
 */
export function unassignGuestFromAllSeats(
  assignments: GuestAssignmentMap,
  guestId: string,
): GuestAssignmentMap {
  const newAssignments = new Map(assignments);
  const seatsToRemove = getSeatsForGuest(assignments, guestId);
  for (const seatNumber of seatsToRemove) {
    newAssignments.delete(seatNumber);
  }
  return newAssignments;
}

/**
 * Counts the number of assigned guests
 * @param assignments - the assignment map
 * @returns the number of seats with assigned guests
 */
export function countAssignments(assignments: GuestAssignmentMap): number {
  return assignments.size;
}
