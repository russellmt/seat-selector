/**
 * GridCanvas Component
 *
 * Core interactive SVG canvas for seat placement and guest arrangement.
 * Handles mouse events (click, drag, right-click), hover previews, and coordinate conversion.
 *
 * **Validates: Requirements 2.1, 2.2, 2.3**
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { GridPosition, Seat, Rotation } from '../../types';
import type { IconConfig } from '../../types/Icon';
import type { Guest } from '../../types/Guest';
import type { GuestAssignmentMap } from '../../types/Guest';
import { pixelToGrid } from '../../utils/gridCoordinates';
import type { GridDimensions } from '../../utils/gridCoordinates';
import type { DragState } from '../../types/UIState';
import './GridCanvas.css';

/**
 * Props for the GridCanvas component
 */
export interface GridCanvasProps {
  /** Array of placed seats on the canvas */
  seats: Seat[];

  /** Currently selected icon ID */
  selectedIconId: string;

  /** Current rotation state for the selected icon */
  selectedRotation: Rotation;

  /** Currently selected guest ID (optional, for guest arrangement mode) */
  selectedGuestId?: string | null;

  /** Map of seat number to guest ID (optional, for guest arrangement mode) */
  assignments?: GuestAssignmentMap;

  /** Array of guests (optional, for guest arrangement mode) */
  guests?: Guest[];

  /** Callback when a seat is added via left-click or drag */
  onSeatAdd: (position: GridPosition, iconId: string, rotation: Rotation) => void;

  /** Callback when seat(s) are removed via right-click or drag */
  onSeatRemove: (positions: GridPosition[]) => void;

  /** Callback when a guest is assigned to a seat (optional, for guest arrangement mode) */
  onGuestAssign?: (position: GridPosition, guestId: string) => void;

  /** Map of icon IDs to their configurations */
  iconConfigs: Map<string, IconConfig>;

  /** Grid dimensions and canvas offsets */
  gridDimensions: GridDimensions;

  /** If true, canvas doesn't respond to user interactions (read-only mode) */
  readOnly?: boolean;
}

/**
 * Internal state for the GridCanvas component
 */
interface GridCanvasState {
  /** Current mouse position on the grid (for hover preview) */
  hoverPosition: GridPosition | null;

  /** Current drag state (start position, current position, mouse button) */
  dragState: DragState | null;

  /** Type of preview to show ('icon', 'guest', or null) */
  previewType: 'icon' | 'guest' | null;

  /** Opacity of the preview (0-1) */
  previewOpacity: number;
}

/**
 * GridCanvas Component
 *
 * Renders an interactive SVG canvas with:
 * - Configurable dimensions and grid setup
 * - SVG-based rendering for crisp output at any zoom level
 * - Mouse event binding (click, drag, right-click)
 * - Hover preview system
 * - Grid-based coordinate system
 *
 * Child renderers (GridRenderer, SeatRenderer, PreviewRenderer) are
 * responsible for visual output; this component handles interaction.
 */
export const GridCanvas: React.FC<GridCanvasProps> = ({
  seats,
  selectedIconId,
  selectedRotation,
  selectedGuestId,
  assignments,
  guests,
  onSeatAdd,
  onSeatRemove,
  onGuestAssign,
  iconConfigs,
  gridDimensions,
  readOnly = false,
}) => {
  // Reference to the SVG element
  const svgRef = useRef<SVGSVGElement>(null);

  // Component state for hover and drag tracking
  const [state, setState] = useState<GridCanvasState>({
    hoverPosition: null,
    dragState: null,
    previewType: null,
    previewOpacity: 1,
  });

  /**
   * Converts mouse event coordinates to grid coordinates
   */
  const eventToGridPosition = useCallback(
    (clientX: number, clientY: number): GridPosition | null => {
      if (!svgRef.current) return null;
      const rect = svgRef.current.getBoundingClientRect();
      const pixelX = clientX - rect.left;
      const pixelY = clientY - rect.top;
      return pixelToGrid(pixelX, pixelY, gridDimensions);
    },
    [gridDimensions],
  );

  /**
   * Handles mouse move events for hover preview updates
   */
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (readOnly) return;

      const gridPosition = eventToGridPosition(event.clientX, event.clientY);
      if (!gridPosition) return;

      // Update hover position for preview rendering
      setState((prev) => {
        let previewType: 'icon' | 'guest' | null = null;
        let previewOpacity = 1;

        // Determine what type of preview to show
        if (selectedGuestId && guests && guests.length > 0) {
          previewType = 'guest';
          // Check if seat is occupied at this position
          const seatAtPosition = seats.find(
            (s) => s.position.col === gridPosition.col && s.position.row === gridPosition.row,
          );
          previewOpacity = seatAtPosition ? 0.6 : 0.25;
        } else if (selectedIconId && iconConfigs.has(selectedIconId)) {
          previewType = 'icon';
          previewOpacity = 0.5;
        }

        return {
          ...prev,
          hoverPosition: gridPosition,
          previewType,
          previewOpacity,
        };
      });

      // Update drag state if currently dragging
      if (state.dragState) {
        setState((prev) => ({
          ...prev,
          dragState: prev.dragState
            ? { ...prev.dragState, currentPosition: gridPosition }
            : null,
        }));
      }
    },
    [readOnly, eventToGridPosition, selectedGuestId, guests, selectedIconId, iconConfigs, seats, state.dragState],
  );

  /**
   * Handles mouse down to start drag operations
   */
  const handleMouseDown = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (readOnly) return;

      const gridPosition = eventToGridPosition(event.clientX, event.clientY);
      if (!gridPosition) return;

      // Determine mouse button (left=0, middle=1, right=2)
      const isLeftClick = event.button === 0;
      const isRightClick = event.button === 2;

      if (!isLeftClick && !isRightClick) return;

      // Start drag state
      const dragState: DragState = {
        startPosition: gridPosition,
        currentPosition: gridPosition,
        mouseButton: isLeftClick ? 'left' : 'right',
      };

      setState((prev) => ({
        ...prev,
        dragState,
      }));
    },
    [readOnly, eventToGridPosition],
  );

  /**
   * Handles mouse up to complete drag operations or process single clicks
   */
  const handleMouseUp = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (readOnly) return;

      const gridPosition = eventToGridPosition(event.clientX, event.clientY);
      if (!gridPosition || !state.dragState) return;

      const { startPosition, mouseButton } = state.dragState;
      const endPosition = gridPosition;

      // Determine if this was a drag or a single click
      const isDrag =
        startPosition.col !== endPosition.col || startPosition.row !== endPosition.row;

      try {
        if (mouseButton === 'left') {
          // Left click/drag: add seat(s)
          if (isDrag) {
            // Drag operation: calculate path and add seats at each position
            const path = calculateDragPath(startPosition, endPosition);
            path.forEach((pos) => {
              onSeatAdd(pos, selectedIconId, selectedRotation);
            });
          } else {
            // Single click: add seat at clicked position
            onSeatAdd(startPosition, selectedIconId, selectedRotation);
          }

          // Handle guest assignment if in guest mode
          if (selectedGuestId && onGuestAssign) {
            if (isDrag) {
              const path = calculateDragPath(startPosition, endPosition);
              path.forEach((pos) => {
                onGuestAssign(pos, selectedGuestId);
              });
            } else {
              onGuestAssign(startPosition, selectedGuestId);
            }
          }
        } else if (mouseButton === 'right') {
          // Right click/drag: remove seat(s)
          if (isDrag) {
            const path = calculateDragPath(startPosition, endPosition);
            onSeatRemove(path);
          } else {
            onSeatRemove([startPosition]);
          }
        }
      } finally {
        // Clear drag state
        setState((prev) => ({
          ...prev,
          dragState: null,
        }));
      }
    },
    [readOnly, eventToGridPosition, state.dragState, selectedIconId, selectedRotation, selectedGuestId, onSeatAdd, onSeatRemove, onGuestAssign],
  );

  /**
   * Handles mouse leave to clear preview
   */
  const handleMouseLeave = useCallback(() => {
    setState((prev) => ({
      ...prev,
      hoverPosition: null,
      previewType: null,
      dragState: null,
    }));
  }, []);

  /**
   * Prevents context menu on right-click
   */
  const handleContextMenu = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    event.preventDefault();
  }, []);

  /**
   * Calculates all grid positions along a drag path using Bresenham's line algorithm
   */
  const calculateDragPath = (start: GridPosition, end: GridPosition): GridPosition[] => {
    const path: GridPosition[] = [];
    let { col: x, row: y } = start;
    const { col: x2, row: y2 } = end;

    const dx = Math.abs(x2 - x);
    const dy = Math.abs(y2 - y);
    const stepX = x < x2 ? 1 : -1;
    const stepY = y < y2 ? 1 : -1;
    let error = dx - dy;

    path.push({ col: x, row: y });

    while (x !== x2 || y !== y2) {
      const e2 = 2 * error;
      if (e2 > -dy) {
        error -= dy;
        x += stepX;
      }
      if (e2 < dx) {
        error += dx;
        y += stepY;
      }
      path.push({ col: x, row: y });
    }

    return path;
  };

  // Calculate canvas dimensions
  const canvasWidth = gridDimensions.cols * gridDimensions.squareSize;
  const canvasHeight = gridDimensions.rows * gridDimensions.squareSize;

  return (
    <svg
      ref={svgRef}
      className="grid-canvas"
      width={canvasWidth}
      height={canvasHeight}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onContextMenu={handleContextMenu}
    >
      {/* SVG content will be rendered by child components */}
    </svg>
  );
};

export default GridCanvas;
