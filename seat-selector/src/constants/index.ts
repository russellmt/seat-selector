/**
 * Centralized export of all constants and configuration values.
 * Import from this file to access grid, icon, and sort order constants.
 */

// Grid constants
export {
  GRID_SQUARE_SIZE_PX,
  GRID_LINE_COLOR,
  GRID_LINE_OPACITY,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  GRID_LINE_WIDTH,
  GRID_LINE_DASH_ARRAY,
} from './gridConstants';

// Icon capacity constants
export {
  TABLE_CAPACITY_CONFIG,
  CHAIR_CAPACITY_CONFIG,
  LOVESEAT_CAPACITY_CONFIG,
  COUCH_CAPACITY_CONFIG,
  CAPACITY_CONFIG_MAP,
  AVAILABLE_CAPACITIES,
} from './iconConstants';

// Sort order constants
export {
  SORT_ORDERS,
  DEFAULT_SORT_ORDER,
  SORT_ORDER_CYCLE,
  SORT_ORDER_LABELS,
  type SortOrder,
} from './sortConstants';
