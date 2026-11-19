import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router-dom";
import GuestArrangement from "./GuestArrangement";
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
