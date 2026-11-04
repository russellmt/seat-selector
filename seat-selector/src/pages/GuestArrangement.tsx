import { useNavigate } from 'react-router-dom';

export default function GuestArrangement() {
  const navigate = useNavigate();

  const handleBackToCanvas = () => {
    navigate('/canvas');
  };

  return (
    <div className="guest-arrangement-page">
      <header className="arrangement-header">
        <h1>Guest Arrangement</h1>
        <button 
          className="back-button"
          onClick={handleBackToCanvas}
        >
          Back to Canvas
        </button>
      </header>

      <main className="arrangement-main">
        <aside className="guest-list-panel">
          <p>Guest List Panel - Coming soon</p>
        </aside>

        <section className="grid-canvas">
          <p>Grid Canvas (Display Mode) - Coming soon</p>
        </section>
      </main>

      <footer className="arrangement-footer">
        <div className="assigned-count">0 / 0 filled</div>
        <button className="clear-all-button">Clear All</button>
        <button className="save-button">Save</button>
      </footer>
    </div>
  );
}
