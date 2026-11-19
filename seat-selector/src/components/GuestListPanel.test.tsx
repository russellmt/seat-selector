import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { GuestListPanel } from "./GuestListPanel";
import { GuestInitialCircle } from "./GuestInitialCircle";
import { colorService } from "../services";
import { createGuest } from "../types/Guest";
import type { Guest } from "../types/Guest";

const makeGuest = (name: string): Guest =>
  createGuest(name, colorService.generateColor(name));

describe("GuestListPanel", () => {
  it("renders one entry per guest in the given order", () => {
    const guests = [
      makeGuest("Charlie Brown"),
      makeGuest("Alice"),
      makeGuest("Bob Jones"),
    ];
    render(<GuestListPanel guests={guests} />);

    const list = screen.getByRole("region", { name: /guest list/i });
    const items = within(list).getAllByRole("listitem");

    expect(items).toHaveLength(3);
    expect(items[0].textContent).toContain("Charlie Brown");
    expect(items[1].textContent).toContain("Alice");
    expect(items[2].textContent).toContain("Bob Jones");
  });

  it("renders no entries for an empty guest list", () => {
    render(<GuestListPanel guests={[]} />);

    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("uses a scrollable 2-column grid container", () => {
    const { container } = render(
      <GuestListPanel guests={[makeGuest("Alice")]} />,
    );

    expect(container.querySelector("ul.guest-list-grid")).not.toBeNull();
  });

  it("shows the guest initials inside each color circle", () => {
    const guests = [makeGuest("John Smith"), makeGuest("Alice")];
    const { container } = render(<GuestListPanel guests={guests} />);

    const circles = container.querySelectorAll(".guest-initial-circle");
    expect(circles).toHaveLength(2);
    expect(circles[0].textContent).toBe("JS");
    expect(circles[1].textContent).toBe("A");
  });

  it("colors each circle with the guest color and its contrast text color", () => {
    const guest = makeGuest("Maria Garcia");
    const { container } = render(<GuestListPanel guests={[guest]} />);

    const circle = container.querySelector(
      ".guest-initial-circle",
    ) as HTMLElement;
    const { r, g, b } = guest.color.rgb;
    expect(circle.style.backgroundColor).toBe(`rgb(${r}, ${g}, ${b})`);
    expect(circle.style.color).toBe(guest.color.text);
  });

  it("marks the initial circle as decorative because the name is shown beside it", () => {
    const { container } = render(
      <GuestListPanel guests={[makeGuest("Alice")]} />,
    );

    const circle = container.querySelector(".guest-initial-circle");
    expect(circle?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("GuestInitialCircle", () => {
  it("uses white or black text color for contrast", () => {
    const guest = makeGuest("Tom Hanks");
    expect(["white", "black"]).toContain(guest.color.text);

    const { container } = render(<GuestInitialCircle guest={guest} />);
    const circle = container.querySelector(
      ".guest-initial-circle",
    ) as HTMLElement;
    expect(["white", "black"]).toContain(circle.style.color);
  });

  it("applies the diameter for each size variant", () => {
    const guest = makeGuest("Alice");

    const { container: small } = render(
      <GuestInitialCircle guest={guest} size="small" />,
    );
    expect(
      (small.querySelector(".guest-initial-circle") as HTMLElement).style.width,
    ).toBe("24px");

    const { container: large } = render(
      <GuestInitialCircle guest={guest} size="large" />,
    );
    expect(
      (large.querySelector(".guest-initial-circle") as HTMLElement).style.width,
    ).toBe("56px");
  });

  it("defaults to the medium size", () => {
    const { container } = render(
      <GuestInitialCircle guest={makeGuest("Alice")} />,
    );

    expect(
      (container.querySelector(".guest-initial-circle") as HTMLElement).style
        .width,
    ).toBe("40px");
  });
});

describe("GuestListPanel add guest", () => {
  it('does not render the "+" button when no onAddGuest handler is given', () => {
    render(<GuestListPanel guests={[]} />);

    expect(screen.queryByRole("button", { name: /add guest/i })).toBeNull();
  });

  it('shows the add form when "+" is clicked and hides it after a valid submit', () => {
    const onAddGuest = vi.fn();
    render(<GuestListPanel guests={[]} onAddGuest={onAddGuest} />);

    expect(screen.queryByRole("textbox", { name: /guest name/i })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /add guest/i }));
    const input = screen.getByRole("textbox", { name: /guest name/i });

    fireEvent.change(input, { target: { value: "Ada Lovelace" } });
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));

    expect(onAddGuest).toHaveBeenCalledWith("Ada Lovelace");
    expect(screen.queryByRole("textbox", { name: /guest name/i })).toBeNull();
  });

  it("does not call onAddGuest for an empty name and keeps the form open", () => {
    const onAddGuest = vi.fn();
    render(<GuestListPanel guests={[]} onAddGuest={onAddGuest} />);

    fireEvent.click(screen.getByRole("button", { name: /add guest/i }));
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));

    expect(onAddGuest).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toBe(
      "Guest name is required",
    );
    expect(screen.getByRole("textbox", { name: /guest name/i })).toBeDefined();
  });
});

describe("GuestListPanel selection", () => {
  const alice = makeGuest("Alice");
  const bob = makeGuest("Bob Jones");
  const getEntry = (name: string) =>
    screen.getByRole("button", { name: new RegExp(name, "i") });
  // Stateful harness so selection changes flow back into the panel, as they do in the app
  const SelectionHarness = ({
    initial,
    onSelect,
  }: {
    initial: Guest[];
    onSelect?: (id: string) => void;
  }) => {
    const [selected, setSelected] = useState<string | null>(null);
    return (
      <GuestListPanel
        guests={initial}
        selectedGuestId={selected}
        onSelectGuest={(id) => {
          onSelect?.(id);
          setSelected(id);
        }}
      />
    );
  };
  it("calls onSelectGuest with the guest ID when an entry is clicked", () => {
    const onSelectGuest = vi.fn();
    render(
      <GuestListPanel guests={[alice, bob]} onSelectGuest={onSelectGuest} />,
    );
    fireEvent.click(getEntry("Bob Jones"));
    expect(onSelectGuest).toHaveBeenCalledWith(bob.id);
  });
  it("marks the selected entry with aria-pressed=true and the selected class", () => {
    render(<GuestListPanel guests={[alice, bob]} selectedGuestId={alice.id} />);
    const aliceEntry = getEntry("Alice");
    const bobEntry = getEntry("Bob Jones");
    expect(aliceEntry.getAttribute("aria-pressed")).toBe("true");
    expect(aliceEntry.classList.contains("selected")).toBe(true);
    expect(bobEntry.getAttribute("aria-pressed")).toBe("false");
    expect(bobEntry.classList.contains("selected")).toBe(false);
  });
  it("highlights an entry after a click", () => {
    render(<SelectionHarness initial={[alice, bob]} />);
    expect(getEntry("Alice").getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(getEntry("Alice"));
    expect(getEntry("Alice").getAttribute("aria-pressed")).toBe("true");
  });
  it("moves the selection when a different entry is clicked", () => {
    render(<SelectionHarness initial={[alice, bob]} />);
    fireEvent.click(getEntry("Alice"));
    fireEvent.click(getEntry("Bob Jones"));
    expect(getEntry("Alice").getAttribute("aria-pressed")).toBe("false");
    expect(getEntry("Bob Jones").getAttribute("aria-pressed")).toBe("true");
  });
  it("keeps the selection when the selected entry is clicked again", () => {
    render(<SelectionHarness initial={[alice, bob]} />);
    fireEvent.click(getEntry("Alice"));
    fireEvent.click(getEntry("Alice"));
    expect(getEntry("Alice").getAttribute("aria-pressed")).toBe("true");
  });
  it("keeps the selection across re-renders with new guests", () => {
    const onSelectGuest = vi.fn();
    const { rerender } = render(
      <GuestListPanel
        guests={[alice]}
        selectedGuestId={alice.id}
        onSelectGuest={onSelectGuest}
      />,
    );
    rerender(
      <GuestListPanel
        guests={[alice, bob]}
        selectedGuestId={alice.id}
        onSelectGuest={onSelectGuest}
      />,
    );
    expect(getEntry("Alice").getAttribute("aria-pressed")).toBe("true");
    expect(getEntry("Bob Jones").getAttribute("aria-pressed")).toBe("false");
    expect(onSelectGuest).not.toHaveBeenCalled();
  });
  it("does not mark any entry selected when selectedGuestId is null", () => {
    render(<GuestListPanel guests={[alice, bob]} selectedGuestId={null} />);
    expect(getEntry("Alice").getAttribute("aria-pressed")).toBe("false");
    expect(getEntry("Bob Jones").getAttribute("aria-pressed")).toBe("false");
  });
});
