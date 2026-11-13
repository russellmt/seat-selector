/**
 * GridCanvas Component
 *
 * Core interactive SVG canvas for seat placement and guest arrangement.
 * Handles mouse events (click, drag, right-click), hover previews, and coordinate conversion.
 *
 * **Validates: Requirements 2.1, 2.2, 2.3**
 */

import React, { useRef, useState, useCallback } from 'react';
import type { GridPosition, Seat, Rotation } from '../../types';
import type { IconConfig } from '../../types/Icon';
import type { Guest } from '../../types/Guest';
import { pixelToGrid } from '../../utils/gridCoordinates';
import type { GridDimensions } from '../../utils/gridCoordinates';
import type { DragState } from '../../types/UIState';
import { GridRenderer } from './GridRenderer';
import { SeatRenderer } from './SeatRenderer';
import { PreviewRenderer } from './PreviewRenderer';
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

      // Add/delete at current position while dragging
      if (state.dragState) {
        const { mouseButton, currentPosition } = state.dragState;
        
        // Avoid repeated add/delete at same position
        if (currentPosition.col !== gridPosition.col || currentPosition.row !== gridPosition.row) {
          if (mouseButton === 'left') {
            onSeatAdd(gridPosition, selectedIconId, selectedRotation);
            if (selectedGuestId && onGuestAssign) {
              onGuestAssign(gridPosition, selectedGuestId);
            }
          } else if (mouseButton === 'right') {
            onSeatRemove([gridPosition]);
          }
        }
      }

      // Add/delete at current position while dragging
      if (state.dragState) {
        const { mouseButton, currentPosition } = state.dragState;
        
        // Avoid repeated add/delete at same position
        if (currentPosition.col !== gridPosition.col || currentPosition.row !== gridPosition.row) {
          if (mouseButton === 'left') {
            onSeatAdd(gridPosition, selectedIconId, selectedRotation);
            if (selectedGuestId && onGuestAssign) {
              onGuestAssign(gridPosition, selectedGuestId);
            }
          } else if (mouseButton === 'right') {
            onSeatRemove([gridPosition]);
          }
        }
      }

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

      // Immediately add/delete at clicked position
      if (isLeftClick) {
        onSeatAdd(gridPosition, selectedIconId, selectedRotation);
        if (selectedGuestId && onGuestAssign) {
          onGuestAssign(gridPosition, selectedGuestId);
        }
      } else if (isRightClick) {
        onSeatRemove([gridPosition]);
      }

      // Start drag state for continued add/delete while moving
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
    [readOnly, eventToGridPosition, selectedIconId, selectedRotation, selectedGuestId, onSeatAdd, onSeatRemove, onGuestAssign],
  );

  /**
   * Handles mouse up to complete drag operations or process single clicks
   */
  const handleMouseUp = useCallback(
    (_event: React.MouseEvent<SVGSVGElement>) => {
      if (readOnly) return;

      // All add/delete actions were already done during handleMouseDown and handleMouseMove
      // Just clear the drag state
      setState((prev) => ({
        ...prev,
        dragState: null,
      }));
    },
    [readOnly],
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
      {/* Grid background with lines */}
      <GridRenderer gridDimensions={gridDimensions} />

      {/* Rendered seats with numbers */}
      <SeatRenderer
        seats={seats}
        gridDimensions={gridDimensions}
        iconConfigs={iconConfigs}
      />

      {/* Hover preview (icon or guest) */}
      <PreviewRenderer
        type={state.previewType}
        position={state.hoverPosition}
        opacity={state.previewOpacity}
        selectedIconId={selectedIconId}
        selectedRotation={selectedRotation}
        selectedGuest={undefined}
        gridDimensions={gridDimensions}
        iconConfigs={iconConfigs}
      />
    </svg>
  );
};

export default GridCanvas;
