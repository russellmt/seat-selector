import { useNavigate } from "react-router-dom";
import TempButton from "../components/TempButton";
import { TempDialogProvider, useDialog } from "../components/TempDialog";

function HomeContent() {
  const navigate = useNavigate();
  const { open: openDialog } = useDialog();

  const handleNewConfig = () => {
    navigate("/canvas");
  };

  return (
    <div className="home-page">
      <h1>Seat Selector</h1>
      <p>Create custom seating arrangements for your events</p>

      <button className="new-config-button" onClick={handleNewConfig}>
        New Seat Config
      </button>

      <section className="load-config-section">
        <h2>Load Existing Config</h2>
        <p>Coming in Phase 2</p>
      </section>
      <TempButton name="Hello" onClick={openDialog} />
    </div>
  );
}

export default function Home() {
  return (
    <TempDialogProvider>
      <HomeContent />
    </TempDialogProvider>
  );
}
