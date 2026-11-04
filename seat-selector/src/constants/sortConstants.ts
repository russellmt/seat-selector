/**
 * Sort order configuration for guest lists.
 * Defines available sort orders and default behavior.
 */

/**
 * Enum-like type for guest list sort orders.
 * - 'original': Display guests in the order they were added
 * - 'alphabetical-asc': Sort guests alphabetically (A-Z)
 * - 'alphabetical-desc': Sort guests reverse alphabetically (Z-A)
 */
export const SORT_ORDERS = {
  ORIGINAL: 'original',
  ALPHABETICAL_ASC: 'alphabetical-asc',
  ALPHABETICAL_DESC: 'alphabetical-desc',
} as const;

/**
 * Type for sort order values.
 * Ensures type-safe usage of sort order constants throughout the application.
 */
export type SortOrder = typeof SORT_ORDERS[keyof typeof SORT_ORDERS];

/**
 * The default sort order when the Guest Arrangement page is first loaded.
 * Guests are displayed in the order they were added.
 */
export const DEFAULT_SORT_ORDER: SortOrder = SORT_ORDERS.ORIGINAL;

/**
 * Array of all available sort orders in cycle order.
 * Used for cycling through sort options when the user clicks the sort button.
 */
export const SORT_ORDER_CYCLE: SortOrder[] = [
  SORT_ORDERS.ORIGINAL,
  SORT_ORDERS.ALPHABETICAL_ASC,
  SORT_ORDERS.ALPHABETICAL_DESC,
] as const;

/**
 * Get the human-readable label for a sort order.
 * Useful for displaying sort options in the UI.
 */
export const SORT_ORDER_LABELS: Record<SortOrder, string> = {
  [SORT_ORDERS.ORIGINAL]: 'Original',
  [SORT_ORDERS.ALPHABETICAL_ASC]: 'Alphabetical (A-Z)',
  [SORT_ORDERS.ALPHABETICAL_DESC]: 'Alphabetical (Z-A)',
} as const;
