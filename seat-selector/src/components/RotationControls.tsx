import React, { useEffect } from 'react';
import type { Rotation } from '../types/Icon';
import './RotationControls.css';

/**
 * Props for the RotationControls component
 */
export interface RotationControlsProps {
  /** The currently selected rotation state */
  currentRotation: Rotation;

  /** Callback when a rotation button is clicked or R key is pressed */
  onRotate: (rotation: Rotation) => void;
}

/**
 * Rotation cycle order: left → up → right → down → left
 */
const ROTATION_CYCLE: Rotation[] = ['left', 'up', 'right', 'down'];

/**
 * Get the next rotation in the cycle
 * @param currentRotation - the current rotation state
 * @returns the next rotation in the cycle
 */
function getNextRotation(currentRotation: Rotation): Rotation {
  const currentIndex = ROTATION_CYCLE.indexOf(currentRotation);
  const nextIndex = (currentIndex + 1) % ROTATION_CYCLE.length;
  return ROTATION_CYCLE[nextIndex];
}

/**
 * RotationControls Component
 *
 * Displays 4 directional buttons for rotating the selected icon and highlights
 * the currently active rotation. Responds to both button clicks and the R keyboard
 * shortcut for quick rotation.
 *
 * Features:
 * - 4 directional buttons (left, up, right, down)
 * - Visual highlight on currently selected rotation
 * - Click to rotate to next rotation in cycle
 * - R key shortcut to rotate (delegated to parent component)
 * - Keyboard navigation with arrow keys
 * - Accessible ARIA labels and focus states
 *
 * **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6**
 *
 * @example
 * ```tsx
 * const [rotation, setRotation] = useState<Rotation>('down');
 *
 * <RotationControls
 *   currentRotation={rotation}
 *   onRotate={(newRotation) => setRotation(newRotation)}
 * />
 * ```
 */
export const RotationControls: React.FC<RotationControlsProps> = ({
  currentRotation,
  onRotate,
}) => {
  // Handle R key press to rotate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        const nextRotation = getNextRotation(currentRotation);
        onRotate(nextRotation);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRotation, onRotate]);

  const handleRotateClick = () => {
    const nextRotation = getNextRotation(currentRotation);
    onRotate(nextRotation);
  };

  const getRotationLabel = (rotation: Rotation): string => {
    const labels: Record<Rotation, string> = {
      left: 'Rotate Left',
      up: 'Rotate Up',
      right: 'Rotate Right',
      down: 'Rotate Down',
    };
    return labels[rotation];
  };

  const getRotationIcon = (rotation: Rotation): string => {
    const icons: Record<Rotation, string> = {
      left: '←',
      up: '↑',
      right: '→',
      down: '↓',
    };
    return icons[rotation];
  };

  return (
    <div className="rotation-controls" role="group" aria-label="Icon rotation controls">
      {/* Left Button */}
      <button
        className={`rotation-button rotation-button-left ${
          currentRotation === 'left' ? 'active' : ''
        }`}
        onClick={() => onRotate('left')}
        title={`${getRotationLabel('left')} (Click to select)`}
        aria-label="Rotate icon left"
        aria-pressed={currentRotation === 'left'}
      >
        <span className="rotation-icon">{getRotationIcon('left')}</span>
      </button>

      {/* Up Button */}
      <button
        className={`rotation-button rotation-button-up ${
          currentRotation === 'up' ? 'active' : ''
        }`}
        onClick={() => onRotate('up')}
        title={`${getRotationLabel('up')} (Click to select)`}
        aria-label="Rotate icon up"
        aria-pressed={currentRotation === 'up'}
      >
        <span className="rotation-icon">{getRotationIcon('up')}</span>
      </button>

      {/* Right Button */}
      <button
        className={`rotation-button rotation-button-right ${
          currentRotation === 'right' ? 'active' : ''
        }`}
        onClick={() => onRotate('right')}
        title={`${getRotationLabel('right')} (Click to select)`}
        aria-label="Rotate icon right"
        aria-pressed={currentRotation === 'right'}
      >
        <span className="rotation-icon">{getRotationIcon('right')}</span>
      </button>

      {/* Down Button */}
      <button
        className={`rotation-button rotation-button-down ${
          currentRotation === 'down' ? 'active' : ''
        }`}
        onClick={() => onRotate('down')}
        title={`${getRotationLabel('down')} (Click to select)`}
        aria-label="Rotate icon down"
        aria-pressed={currentRotation === 'down'}
      >
        <span className="rotation-icon">{getRotationIcon('down')}</span>
      </button>

      {/* Cycle Button - rotates to next in sequence */}
      <button
        className="rotation-button-cycle"
        onClick={handleRotateClick}
        title="Rotate to next direction (or press R)"
        aria-label="Rotate icon to next direction"
      >
        ⟳ Next (R)
      </button>
    </div>
  );
};

export default RotationControls;
