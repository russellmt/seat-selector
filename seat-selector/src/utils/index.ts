/**
 * Grid coordinate conversion utilities
 */
export { pixelToGrid, gridToPixel, type GridDimensions } from './gridCoordinates';

/**
 * Collision detection and path calculation utilities
 */
export {
  hasCollision,
  calculateDragPath,
  findSeatsInPath,
  getGridSquaresOccupied,
  positionOverlapsSeat,
} from './collision';

/**
 * String utility functions for validation and text processing
 */
export {
  getInitials,
  validateGuestName,
  validateTitle,
  normalizeString,
  isBlankString,
  truncateString,
  type ValidationResult,
} from './stringUtils';

/**
 * Rotation utility functions for handling cardinal direction cycles
 */
export { rotate, rotateBack, rotateN } from './rotation';
