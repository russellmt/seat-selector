import { describe, it, expect } from "vitest";
import {
  render,
  screen,
  fireEvent,
  within,
  cleanup,
} from "@testing-library/react";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router-dom";
import GuestArrangement from "./GuestArrangement";
import SeatCanvas from "./SeatCanvas";
import { AppProvider } from "../context/AppContext";
import { colorService } from "../services";

const renderPage = () =>
  render(
    <AppProvider>
      <BrowserRouter>
        <GuestArrangement />
      </BrowserRouter>
    </AppProvider>,
  );

describe("GuestArrangement Page", () => {
  it("should render the GuestArrangement page", () => {
    renderPage();

    expect(screen.getByText("Guest Arrangement")).toBeDefined();
  });

  it("should display the header with Back to Canvas button", () => {
    renderPage();

    const backButton = screen.getByRole("button", { name: /back to canvas/i });
    expect(backButton).toBeDefined();
  });

  it("should display the guest list panel sidebar", () => {
    renderPage();

    expect(screen.getByRole("region", { name: /guest list/i })).toBeDefined();
  });

  it("should display the Grid Canvas area (display mode)", () => {
    renderPage();

    expect(screen.getByText(/grid canvas.*display mode/i)).toBeDefined();
  });

  it("should display footer controls", () => {
    renderPage();

    expect(screen.getByText(/0 \/ 0 filled/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /clear all/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /save/i })).toBeDefined();
  });

  it("should have a three-section layout (header, main, footer)", () => {
    const { container } = renderPage();

    const header = container.querySelector(".arrangement-header");
    const main = container.querySelector(".arrangement-main");
    const footer = container.querySelector(".arrangement-footer");

    expect(header).toBeDefined();
    expect(main).toBeDefined();
    expect(footer).toBeDefined();
  });

  it("should have a guest list panel sidebar within main", () => {
    const { container } = renderPage();

    const guestListPanel = container.querySelector(
      ".arrangement-main .guest-list-panel",
    );
    expect(guestListPanel).not.toBeNull();
  });

  it("should have a grid canvas within main", () => {
    const { container } = renderPage();

    const gridCanvas = container.querySelector(".grid-canvas");
    expect(gridCanvas).toBeDefined();
  });
});

describe("GuestArrangement Back to Canvas button", () => {
  it("renders as a react-bootstrap outline-secondary small button", () => {
    renderPage();

    const backButton = screen.getByRole("button", { name: /back to canvas/i });
    expect(backButton.classList.contains("btn")).toBe(true);
    expect(backButton.classList.contains("btn-outline-secondary")).toBe(true);
    expect(backButton.classList.contains("btn-sm")).toBe(true);
  });

  it("navigates to the Seat Canvas route when clicked", () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={["/arrangement"]}>
          <Routes>
            <Route path="/arrangement" element={<GuestArrangement />} />
            <Route path="/canvas" element={<p>Seat Canvas route</p>} />
          </Routes>
        </MemoryRouter>
      </AppProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /back to canvas/i }));

    expect(screen.getByText("Seat Canvas route")).toBeDefined();
    expect(screen.queryByText("Guest Arrangement")).toBeNull();
  });
});

describe("GuestArrangement add guest flow", () => {
  const addGuestThroughUi = (name: string) => {
    fireEvent.click(screen.getByRole("button", { name: /add guest/i }));
    fireEvent.change(screen.getByRole("textbox", { name: /guest name/i }), {
      target: { value: name },
    });
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));
  };

  it("adds a guest to the list with initials and the generated color", () => {
    renderPage();

    addGuestThroughUi("  John Smith  ");

    const list = screen.getByRole("region", { name: /guest list/i });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toContain("John Smith");

    const circle = items[0].querySelector(
      ".guest-initial-circle",
    ) as HTMLElement;
    expect(circle.textContent).toBe("JS");

    const expected = colorService.generateColor("John Smith");
    expect(circle.style.backgroundColor).toBe(
      `rgb(${expected.rgb.r}, ${expected.rgb.g}, ${expected.rgb.b})`,
    );
  });

  it("does not add a guest when the name is blank", () => {
    renderPage();

    addGuestThroughUi("   ");

    const list = screen.getByRole("region", { name: /guest list/i });
    expect(within(list).queryAllByRole("listitem")).toHaveLength(0);
    expect(screen.getByRole("alert").textContent).toBe(
      "Guest name cannot be only whitespace",
    );
  });

  it("appends each added guest in the order it was added", () => {
    renderPage();

    addGuestThroughUi("Alice");
    addGuestThroughUi("Bob Jones");

    const list = screen.getByRole("region", { name: /guest list/i });
    const items = within(list).getAllByRole("listitem");
    expect(
      items.map((item) => item.querySelector(".guest-name")?.textContent),
    ).toEqual(["Alice", "Bob Jones"]);
  });
});

describe("GuestArrangement guest selection", () => {
  const addGuestThroughUi = (name: string) => {
    fireEvent.click(screen.getByRole("button", { name: /add guest/i }));
    fireEvent.change(screen.getByRole("textbox", { name: /guest name/i }), {
      target: { value: name },
    });
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));
  };
  const getEntry = (name: string) =>
    screen.getByRole("button", { name: new RegExp(name, "i") });
  it("highlights a guest entry on single click", () => {
    renderPage();
    addGuestThroughUi("Alice");
    addGuestThroughUi("Bob Jones");
    fireEvent.click(getEntry("Alice"));
    expect(getEntry("Alice").getAttribute("aria-pressed")).toBe("true");
    expect(getEntry("Alice").classList.contains("selected")).toBe(true);
    expect(getEntry("Bob Jones").getAttribute("aria-pressed")).toBe("false");
  });
  it("moves the highlight when a different guest is clicked", () => {
    renderPage();
    addGuestThroughUi("Alice");
    addGuestThroughUi("Bob Jones");
    fireEvent.click(getEntry("Alice"));
    fireEvent.click(getEntry("Bob Jones"));
    expect(getEntry("Alice").getAttribute("aria-pressed")).toBe("false");
    expect(getEntry("Bob Jones").getAttribute("aria-pressed")).toBe("true");
  });
  it("keeps the selected guest highlighted after another guest is added", () => {
    renderPage();
    addGuestThroughUi("Alice");
    fireEvent.click(getEntry("Alice"));
    addGuestThroughUi("Bob Jones");
    expect(getEntry("Alice").getAttribute("aria-pressed")).toBe("true");
    expect(getEntry("Bob Jones").getAttribute("aria-pressed")).toBe("false");
  });
});

describe("GuestArrangement layout matches SeatCanvas", () => {
  // Shared layout selectors. Each must exist on both pages with the same class tokens.
  const SHARED_LAYOUT_SELECTORS = [
    ".seat-canvas-page",
    ".canvas-header",
    ".header-content",
    ".canvas-main",
    ".canvas-content",
    ".icon-bank-sidebar",
    ".grid-canvas",
    ".canvas-footer",
    ".footer-left",
    ".footer-center",
    ".footer-right",
  ];
  it("keeps every shared layout class on the Guest Arrangement page", () => {
    const { container: canvas } = render(
      <AppProvider>
        <BrowserRouter>
          <SeatCanvas />
        </BrowserRouter>
      </AppProvider>,
    );
    const canvasClasses = SHARED_LAYOUT_SELECTORS.map((selector) => {
      const el = canvas.querySelector(selector);
      expect(el, `SeatCanvas missing ${selector}`).not.toBeNull();
      return [selector, Array.from(el!.classList)] as const;
    });
    cleanup();
    const { container: arrangement } = renderPage();
    for (const [selector, canvasTokens] of canvasClasses) {
      const el = arrangement.querySelector(selector);
      expect(el, `GuestArrangement missing ${selector}`).not.toBeNull();
      for (const token of canvasTokens) {
        expect(
          el!.classList.contains(token),
          `${selector} lost class ${token}`,
        ).toBe(true);
      }
    }
  });
});

describe("GuestArrangement Delete key", () => {
  const addGuestThroughUi = (name: string) => {
    fireEvent.click(screen.getByRole("button", { name: /add guest/i }));
    fireEvent.change(screen.getByRole("textbox", { name: /guest name/i }), {
      target: { value: name },
    });
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));
  };
  const getEntry = (name: string) =>
    screen.getByRole("button", { name: new RegExp(name, "i") });
  const guestListNames = () => {
    const list = screen.getByRole("region", { name: /guest list/i });
    return within(list)
      .queryAllByRole("listitem")
      .map((item) => item.querySelector(".guest-name")?.textContent);
  };
  const queryDialogHeading = () =>
    screen.queryByRole("heading", { name: "Delete Guest" });

  it("opens the confirmation dialog when Delete is pressed with a guest selected", () => {
    renderPage();
    addGuestThroughUi("Alice");
    fireEvent.click(getEntry("Alice"));

    fireEvent.keyDown(window, { key: "Delete" });

    expect(queryDialogHeading()).not.toBeNull();
    expect(guestListNames()).toEqual(["Alice"]);
  });

  it("does nothing when Delete is pressed with no selection", () => {
    renderPage();
    addGuestThroughUi("Alice");

    fireEvent.keyDown(window, { key: "Delete" });

    expect(queryDialogHeading()).toBeNull();
    expect(guestListNames()).toEqual(["Alice"]);
  });

  it("ignores Delete while the add guest text field has focus", () => {
    renderPage();
    addGuestThroughUi("Alice");
    fireEvent.click(getEntry("Alice"));
    fireEvent.click(screen.getByRole("button", { name: /add guest/i }));

    fireEvent.keyDown(screen.getByRole("textbox", { name: /guest name/i }), {
      key: "Delete",
    });

    expect(queryDialogHeading()).toBeNull();
    expect(guestListNames()).toEqual(["Alice"]);
  });

  it("removes the guest when the deletion is confirmed", () => {
    renderPage();
    addGuestThroughUi("Alice");
    addGuestThroughUi("Bob Jones");
    fireEvent.click(getEntry("Alice"));
    fireEvent.keyDown(window, { key: "Delete" });

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(queryDialogHeading()).toBeNull();
    expect(guestListNames()).toEqual(["Bob Jones"]);
  });

  it("keeps the guest and its selection when the deletion is cancelled", () => {
    renderPage();
    addGuestThroughUi("Alice");
    fireEvent.click(getEntry("Alice"));
    fireEvent.keyDown(window, { key: "Delete" });

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(queryDialogHeading()).toBeNull();
    expect(guestListNames()).toEqual(["Alice"]);
    expect(getEntry("Alice").getAttribute("aria-pressed")).toBe("true");
  });

  it("clears the selection when the selected guest is deleted", () => {
    renderPage();
    addGuestThroughUi("Alice");
    fireEvent.click(getEntry("Alice"));
    fireEvent.keyDown(window, { key: "Delete" });
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.queryAllByRole("button", { pressed: true })).toHaveLength(0);

    // With the selection cleared, a further Delete press opens no dialog.
    fireEvent.keyDown(window, { key: "Delete" });
    expect(queryDialogHeading()).toBeNull();
  });

  it("ignores a second Delete press while the confirmation dialog is open", () => {
    renderPage();
    addGuestThroughUi("Alice");
    addGuestThroughUi("Bob Jones");
    fireEvent.click(getEntry("Alice"));
    fireEvent.keyDown(window, { key: "Delete" });

    fireEvent.keyDown(window, { key: "Delete" });

    expect(queryDialogHeading()).not.toBeNull();
    expect(guestListNames()).toEqual(["Alice", "Bob Jones"]);
  });

  it("opens the confirmation dialog when Backspace is pressed with a guest selected", () => {
    renderPage();
    addGuestThroughUi("Alice");
    fireEvent.click(getEntry("Alice"));

    const notCancelled = fireEvent.keyDown(window, { key: "Backspace" });

    expect(queryDialogHeading()).not.toBeNull();
    expect(guestListNames()).toEqual(["Alice"]);
    expect(notCancelled).toBe(false);
  });

  it("does not prevent Backspace when no guest is selected", () => {
    renderPage();
    addGuestThroughUi("Alice");

    const notCancelled = fireEvent.keyDown(window, { key: "Backspace" });

    expect(queryDialogHeading()).toBeNull();
    expect(notCancelled).toBe(true);
  });

  it("ignores Backspace while the add guest text field has focus", () => {
    renderPage();
    addGuestThroughUi("Alice");
    fireEvent.click(getEntry("Alice"));
    fireEvent.click(screen.getByRole("button", { name: /add guest/i }));

    const notCancelled = fireEvent.keyDown(
      screen.getByRole("textbox", { name: /guest name/i }),
      { key: "Backspace" },
    );

    expect(queryDialogHeading()).toBeNull();
    expect(guestListNames()).toEqual(["Alice"]);
    expect(notCancelled).toBe(true);
  });

  it("ignores Delete and Backspace inside a contenteditable element", () => {
    renderPage();
    addGuestThroughUi("Alice");
    fireEvent.click(getEntry("Alice"));
    const editable = document.createElement("div");
    editable.setAttribute("contenteditable", "true");
    document.body.appendChild(editable);

    fireEvent.keyDown(editable, { key: "Delete" });
    const notCancelled = fireEvent.keyDown(editable, { key: "Backspace" });

    expect(queryDialogHeading()).toBeNull();
    expect(notCancelled).toBe(true);
    editable.remove();
  });
});
