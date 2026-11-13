import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { RotationControls } from '../components/RotationControls';
import { IconBank } from '../components/IconBank';
import { GridCanvas } from '../components/canvas';
import { iconConfigService } from '../services/IconConfigService';
import { GRID_SQUARE_SIZE_PX } from '../constants/gridConstants';
import { hasCollision, findSeatsInPath } from '../utils/collision';
import { createSeat } from '../types/Seat';
import type { GridPosition } from '../types/Seat';
import type { Rotation } from '../types/Icon';
import './SeatCanvas.css';

/**
 * SeatCanvas Page Component
 *
 * Main page for creating and editing seat configurations.
 * Implements a three-section vertical layout:
 * - Header: Title input and rotation controls
 * - Main Area: Icon bank sidebar + grid canvas
 * - Footer: Seat count, clear button, save button, and add guests button
 *
 * **Validates: Requirements 1.1, 3.1, 5.1, 5.2, 5.3, 5.4, 14.1, 15.1, 16.1**
 */
export default function SeatCanvas() {
  console.log('[SeatCanvas] Component loaded and rendering');
  const navigate = useNavigate();
  const { 
    setCurrentPage, 
    selectedIconId, 
    setSelectedIcon, 
    selectedRotation, 
    setRotation,
    seats,
    addSeat,
    removeSeat,
    updateSeatNumbers,
  } = useApp();
  const icons = iconConfigService.getAllConfigs();
  
  // Create a map of icon configs for the canvas
  const iconConfigs = new Map(
    icons.map(icon => [icon.id, icon])
  );

  const handleIconSelect = (iconId: string) => {
    setSelectedIcon(iconId);
  };

  const handleAddGuests = () => {
    setCurrentPage('guests');
    navigate('/arrangement');
  };

  const handleBackHome = () => {
    setCurrentPage('home');
    navigate('/');
  };

  // Seat placement handler - creates seat at grid-quantized position
  // Checks for collisions with existing seats (accounting for rotation)
  // Recalculates seat numbers after each placement
  const handleSeatAdd = (position: GridPosition, iconId: string, rotation: Rotation) => {
    console.log('[SeatCanvas] handleSeatAdd called:', { position, iconId, rotation, selectedIconId });
    // Get the icon configuration to check size and validate placement
    const iconConfig = iconConfigs.get(iconId);
    console.log('[SeatCanvas] icon config found:', !!iconConfig);
    if (!iconConfig) {
      console.log('[SeatCanvas] No icon config found for', iconId);
      return;
    }
    
    // Check for collisions with existing seats (rotation-aware)
    console.log('[SeatCanvas] Checking collision at', position, 'with size', iconConfig.size, 'rotation', rotation, 'and', seats.length, 'existing seats');
    if (hasCollision(position, iconConfig.size, seats, gridDimensions, rotation, iconConfigs)) {
      // Prevent placement if collision detected
      console.log('[SeatCanvas] Collision detected, aborting placement');
      return;
    }
    console.log('[SeatCanvas] No collision, proceeding with seat creation');
    
    // Create new seat with generated ID
    const newSeat = createSeat(iconId, position, rotation);
    console.log('[SeatCanvas] Created seat:', newSeat);
    
    // Add to AppContext state
    addSeat(newSeat);
    console.log('[SeatCanvas] Seat added to AppContext');
    
    // Recalculate seat numbering after placement
    // Note: This is called for each seat in a drag operation
    // An optimization would be to batch updates, but this ensures correctness
    updateSeatNumbers();
  };

  const handleSeatRemove = (positions: GridPosition[]) => {
    console.log('[SeatCanvas.handleSeatRemove] START with positions:', JSON.stringify(positions));
    // Find all seats that occupy any of the grid positions in the path
    // This handles both single-click deletion and drag-to-delete
    console.log('[SeatCanvas] handleSeatRemove called with positions:', positions);
    
    // Use the findSeatsInPath utility to find all seats in the deletion path
    const seatsToRemove = findSeatsInPath(positions, seats, iconConfigs);
    console.log('[SeatCanvas] Found seats to remove:', seatsToRemove.length, seatsToRemove);
    
    if (seatsToRemove.length === 0) {
      console.log('[SeatCanvas] No seats found to remove');
      return;
    }
    
    // Remove all found seats
    seatsToRemove.forEach((seat) => {
      console.log('[SeatCanvas] Removing seat:', seat.id);
      removeSeat(seat.id);
    });
    
    // Recalculate seat numbers after deletion
    // This ensures remaining seats are renumbered in order
    console.log('[SeatCanvas] Recalculating seat numbers');
    updateSeatNumbers();
  };

  const handleCanvasContextMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    console.log('[SeatCanvas] Context menu on canvas container');
    
    // Get the SVG element
    const svg = document.querySelector('svg.grid-canvas') as SVGSVGElement;
    if (!svg) {
      console.log('[SeatCanvas] SVG element not found');
      return;
    }

    // Get SVG position
    const rect = svg.getBoundingClientRect();
    const pixelX = event.clientX - rect.left;
    const pixelY = event.clientY - rect.top;

    // Convert to grid coordinates
    const col = Math.floor(pixelX / gridDimensions.squareSize);
    const row = Math.floor(pixelY / gridDimensions.squareSize);

    console.log('[SeatCanvas] Right-click context menu at pixel:', { pixelX, pixelY }, 'grid:', { col, row });

    if (col >= 0 && col < gridDimensions.cols && row >= 0 && row < gridDimensions.rows) {
      handleSeatRemove([{ col, row }]);
    }
  };

  // Grid dimensions for the canvas
  const gridDimensions = {
    cols: 30,
    rows: 20,
    squareSize: GRID_SQUARE_SIZE_PX,
    offsetX: 0,
    offsetY: 0,
  };

  return (
    <div className="seat-canvas-page">
      {/* ====== HEADER SECTION ====== */}
      <header className="canvas-header">
        <div className="header-content">
          <button 
            className="back-button"
            onClick={handleBackHome}
            aria-label="Back to home page"
          >
            ← Back
          </button>
          
          <h1>Seat Canvas</h1>
          
          {/* Rotation controls */}
          <RotationControls 
            currentRotation={selectedRotation}
            onRotate={setRotation}
          />
        </div>
      </header>

      {/* ====== MAIN AREA ====== */}
      <main className="canvas-main">
        {/* Icon Bank Sidebar - Task 10.2: Icon selection and highlighting */}
        <aside className="icon-bank">
          <IconBank
            icons={icons}
            selectedIconId={selectedIconId}
            onSelectIcon={handleIconSelect}
          />
        </aside>

        {/* Grid Canvas Area - Integrated with child renderers */}
        <section className="grid-canvas" onContextMenu={handleCanvasContextMenu}>
          <GridCanvas
            seats={seats}
            selectedIconId={selectedIconId}
            selectedRotation={selectedRotation}
            onSeatAdd={handleSeatAdd}
            onSeatRemove={handleSeatRemove}
            iconConfigs={iconConfigs}
            gridDimensions={gridDimensions}
          />
        </section>
      </main>

      {/* ====== FOOTER SECTION ====== */}
      <footer className="canvas-footer">
        <div className="footer-left">
          <div className="seat-count">Seats: 0</div>
        </div>

        <div className="footer-center">
          <button 
            className="clear-all-button"
            aria-label="Clear all seats from canvas"
          >
            Clear All
          </button>
          <button 
            className="save-button"
            disabled
            title="Save functionality coming in Phase 2"
            aria-label="Save configuration (Phase 2)"
          >
            Save
          </button>
        </div>

        <div className="footer-right">
          <button 
            className="add-guests-button"
            onClick={handleAddGuests}
            aria-label="Navigate to guest arrangement page"
          >
            Add Guests
          </button>
        </div>
      </footer>
    </div>
  );
}
