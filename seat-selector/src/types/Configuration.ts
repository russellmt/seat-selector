/**
 * Seating Configuration Types
 * Defines the structure for complete seating configurations and arrangements
 */

import type { Seat } from './Seat';
import type { Guest } from './Guest';
import type { GuestAssignmentMap } from './Guest';

/**
 * SeatingConfiguration represents a layout of seats on the canvas
 */
export interface SeatingConfiguration {
  title: string;         // configuration title/name
  seats: Seat[];         // array of placed seats
  createdAt: Date;       // creation timestamp
  lastModified: Date;    // last modification timestamp
}

/**
 * Sort order options for guest list
 */
export type SortOrder = 'original' | 'alphabetical-asc' | 'alphabetical-desc';

/**
 * GuestArrangement represents a complete arrangement with guests assigned to seats
 */
export interface GuestArrangement {
  name: string;                       // arrangement name
  configuration: SeatingConfiguration; // the underlying seat configuration
  guests: Guest[];                    // list of guests
  assignments: GuestAssignmentMap;    // mapping of seat numbers to guest IDs
  sortOrder: SortOrder;               // current sort order for guest list display
}

/**
 * Creates a new seating configuration
 * @param title - the configuration title
 * @param seats - array of seats (defaults to empty)
 * @returns a new SeatingConfiguration object
 */
export function createSeatingConfiguration(
  title: string = '',
  seats: Seat[] = [],
): SeatingConfiguration {
  const now = new Date();
  return {
    title,
    seats,
    createdAt: now,
    lastModified: now,
  };
}

/**
 * Creates a new guest arrangement
 * @param name - the arrangement name
 * @param configuration - the seating configuration
 * @param guests - array of guests (defaults to empty)
 * @param sortOrder - the sort order (defaults to 'original')
 * @returns a new GuestArrangement object
 */
export function createGuestArrangement(
  name: string,
  configuration: SeatingConfiguration,
  guests: Guest[] = [],
  sortOrder: SortOrder = 'original',
): GuestArrangement {
  return {
    name,
    configuration,
    guests,
    assignments: new Map(),
    sortOrder,
  };
}

/**
 * Updates the seating configuration's lastModified timestamp
 * @param config - the configuration to update
 * @returns a new configuration with updated lastModified time
 */
export function updateConfigurationLastModified(
  config: SeatingConfiguration,
): SeatingConfiguration {
  return {
    ...config,
    lastModified: new Date(),
  };
}
