import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { useApp } from "../context/AppContext";
import { GuestListPanel } from "../components/GuestListPanel";
import { colorService } from "../services";
import { createGuest } from "../types/Guest";
import { validateGuestName } from "../utils";
import "./SeatCanvas.css";
import "./GuestArrangement.css";

export default function GuestArrangement() {
  const navigate = useNavigate();
  const { guests, addGuest } = useApp();

  const handleBackToCanvas = () => {
    navigate("/canvas");
  };

  const handleAddGuest = (name: string) => {
    if (!validateGuestName(name).valid) {
      return;
    }
    const color = colorService.generateColor(name);
    addGuest(createGuest(name, color));
  };

  return (
    <div className="seat-canvas-page guest-arrangement-page">
      <header className="canvas-header arrangement-header">
        <div className="header-content">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleBackToCanvas}
            aria-label="Back to canvas"
            className="flex-shrink-0"
          >
            ← Back
          </Button>

          <h1 className="m-0">Guest Arrangement</h1>

          {/* Empty slot mirrors the Seat Canvas rotation controls so the title stays centered */}
          <div className="header-spacer" aria-hidden="true" />
        </div>
      </header>

      <main className="canvas-main arrangement-main">
        <div className="canvas-content">
          <aside className="icon-bank-sidebar guest-list-panel">
            <GuestListPanel guests={guests} onAddGuest={handleAddGuest} />
          </aside>

          <section className="grid-canvas">
            <p>Grid Canvas (Display Mode) - Coming soon</p>
          </section>
        </div>
      </main>

      <footer className="canvas-footer arrangement-footer">
        <div className="footer-left">
          <span className="seat-count-text">0 / 0 filled</span>
        </div>

        <div className="footer-center">
          <Button variant="outline-secondary" size="sm" className="me-2">
            Clear All
          </Button>
          <Button variant="outline-secondary" size="sm">
            Save
          </Button>
        </div>

        <div className="footer-right" />
      </footer>
    </div>
  );
}
