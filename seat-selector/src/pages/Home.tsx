import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const handleNewConfig = () => {
    navigate('/canvas');
  };

  return (
    <div className="home-page">
      <h1>Seat Selector</h1>
      <p>Create custom seating arrangements for your events</p>
      
      <button 
        className="new-config-button"
        onClick={handleNewConfig}
      >
        New Seat Config
      </button>

      <section className="load-config-section">
        <h2>Load Existing Config</h2>
        <p>Coming in Phase 2</p>
      </section>
    </div>
  );
}
