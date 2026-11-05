import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { RotationControls } from '../components/RotationControls';
import { IconBank } from '../components/IconBank';
import { GridCanvas } from '../components/canvas';
import { iconConfigService } from '../services/IconConfigService';
import { GRID_SQUARE_SIZE_PX } from '../constants/gridConstants';
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
  const navigate = useNavigate();
  const { 
    setCurrentPage, 
    selectedIconId, 
    setSelectedIcon, 
    selectedRotation, 
    setRotation,
    seats,
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

  // No-op callbacks for seat placement/deletion (task 13-14)
  const handleSeatAdd = () => {
    // Placeholder: actual seat placement logic comes in task 13
  };

  const handleSeatRemove = () => {
    // Placeholder: actual seat deletion logic comes in task 14
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
        <section className="grid-canvas">
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
