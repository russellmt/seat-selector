import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { useApp } from '../context/AppContext';

/**
 * AddGuestsButton Component (Seat Canvas)
 *
 * Renders the "Add Guests" button in the bottom right of the footer.
 * Clicking it marks the app as on the guests page and navigates to
 * /arrangement. The seat configuration is not copied: it already lives in
 * AppContext, so the Guest Arrangement page reads it from there.
 *
 * **Validates: Requirements 16.1, 16.2, 16.3**
 */
export const AddGuestsButton: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentPage } = useApp();

  const handleClick = () => {
    setCurrentPage('guests');
    navigate('/arrangement');
  };

  return (
    <Button
      variant="primary"
      size="sm"
      onClick={handleClick}
      aria-label="Navigate to guest arrangement page"
    >
      Add Guests
    </Button>
  );
};

export default AddGuestsButton;
