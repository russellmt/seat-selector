import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { useApp } from "../context/AppContext";
import { GuestListPanel } from "../components/GuestListPanel";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { colorService } from "../services";
import { createGuest } from "../types/Guest";
import { validateGuestName } from "../utils";
import "./SeatCanvas.css";
import "./GuestArrangement.css";

/** True when keystrokes belong to a text field (add form, future edit input). */
function isTextEntryTarget(target: EventTarget | null): boolean {
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement
  ) {
    return true;
  }
  // isContentEditable is not implemented by every DOM (e.g. jsdom), so also check the attribute.
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.closest('[contenteditable]:not([contenteditable="false"])') !==
        null)
  );
}

export default function GuestArrangement() {
  const navigate = useNavigate();
  const { guests, addGuest, removeGuest, selectedGuestId, selectGuest } =
    useApp();

  // Guest awaiting deletion confirmation. Null means the dialog is closed.
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const pendingGuest = guests.find((g) => g.id === pendingDeleteId);

  // Delete or Backspace opens the confirmation dialog for the selected guest. It is ignored
  // when nothing is selected, when a text field has focus, or when the dialog is open.
  // preventDefault runs only once the deletion path is reached.
  useEffect(() => {
    const handleDeleteKey = (event: KeyboardEvent) => {
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      if (pendingDeleteId !== null || !selectedGuestId) return;
      if (isTextEntryTarget(event.target)) return;

      event.preventDefault();
      setPendingDeleteId(selectedGuestId);
    };

    window.addEventListener("keydown", handleDeleteKey);
    return () => window.removeEventListener("keydown", handleDeleteKey);
  }, [pendingDeleteId, selectedGuestId]);

  const handleConfirmDelete = () => {
    if (pendingDeleteId !== null) {
      // removeGuest also unassigns the guest from seats and clears the selection.
      removeGuest(pendingDeleteId);
    }
    setPendingDeleteId(null);
  };

  const handleCancelDelete = () => {
    setPendingDeleteId(null);
  };

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
            <GuestListPanel
              guests={guests}
              onAddGuest={handleAddGuest}
              selectedGuestId={selectedGuestId}
              onSelectGuest={selectGuest}
            />
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

      <ConfirmationDialog
        isOpen={pendingGuest !== undefined}
        title="Delete Guest"
        message={`Remove "${pendingGuest?.name ?? ""}" from the arrangement? Any seat it is assigned to will become empty.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
