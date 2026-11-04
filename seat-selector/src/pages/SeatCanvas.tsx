import { useNavigate } from 'react-router-dom';

export default function SeatCanvas() {
  const navigate = useNavigate();

  const handleAddGuests = () => {
    navigate('/arrangement');
  };

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div className="seat-canvas-page">
      <header className="canvas-header">
        <h1>Seat Canvas</h1>
        <button 
          className="back-button"
          onClick={handleBackHome}
        >
          Back to Home
        </button>
      </header>

      <main className="canvas-main">
        <aside className="icon-bank">
          <p>Icon Bank - Coming soon</p>
        </aside>

        <section className="grid-canvas">
          <p>Grid Canvas - Coming soon</p>
        </section>
      </main>

      <footer className="canvas-footer">
        <div className="seat-count">Seats: 0</div>
        <button className="clear-all-button">Clear All</button>
        <button className="save-button">Save</button>
        <button 
          className="add-guests-button"
          onClick={handleAddGuests}
        >
          Add Guests
        </button>
      </footer>
    </div>
  );
}
