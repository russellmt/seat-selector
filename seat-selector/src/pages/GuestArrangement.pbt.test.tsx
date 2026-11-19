/**
 * Property-Based Tests for guest addition on the Guest Arrangement page
 *
 * Property 9: Non-Empty Guest Name Can Be Added
 * **Validates: Requirements 21.1, 21.2, 21.3, 21.4, 21.5**
 *
 * These tests drive the add-guest flow through the UI (the "+" button, the
 * inline name form, and the Add submit) and verify that:
 * - A non-empty, non-whitespace name is added with the trimmed name,
 *   the correct initials, and a deterministic color.
 * - An empty or whitespace-only name is rejected and the guest list is unchanged.
 */
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
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

/** Returns the guest <li> entries currently rendered in the guest list. */
const guestItems = (): HTMLElement[] => {
  const list = screen.getByRole("region", { name: /guest list/i });
  return within(list).queryAllByRole("listitem");
};

/**
 * Opens the add form if it is closed, types the raw value, and submits.
 * The "+" button toggles the form, so it is only clicked when the input is absent.
 */
const submitName = (raw: string) => {
  if (!screen.queryByRole("textbox", { name: /guest name/i })) {
    fireEvent.click(screen.getByRole("button", { name: /add guest/i }));
  }
  fireEvent.change(screen.getByRole("textbox", { name: /guest name/i }), {
    target: { value: raw },
  });
  fireEvent.click(screen.getByRole("button", { name: /^add$/i }));
};

/** Independent oracle: first letter of each of the first two words, uppercased. */
const expectedInitialsOf = (trimmedName: string): string =>
  (trimmedName.match(/\S+/g) ?? [])
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

const circleOf = (item: HTMLElement): HTMLElement =>
  item.querySelector(".guest-initial-circle") as HTMLElement;

const whitespaceChar = fc.constantFrom(
  " ",
  "\t",
  "\n",
  "\r",
  "\f",
  "\v",
  "\u00a0",
  "\u2003",
  "\u3000",
);

const nameChar = fc.oneof(
  fc.integer({ min: 65, max: 90 }).map((c) => String.fromCharCode(c)), // A-Z
  fc.integer({ min: 97, max: 122 }).map((c) => String.fromCharCode(c)), // a-z
  fc.integer({ min: 48, max: 57 }).map((c) => String.fromCharCode(c)), // 0-9
  fc.constantFrom(" ", "-", "'"),
);

/** A name core that contains at least one non-whitespace character. */
const nameCoreArb = fc
  .stringOf(nameChar, { minLength: 1, maxLength: 30 })
  .filter((s) => s.trim().length > 0);

/** A raw input: a valid name surrounded by optional whitespace padding. */
const paddedNameArb = fc
  .tuple(
    fc.stringOf(whitespaceChar, { maxLength: 5 }),
    nameCoreArb,
    fc.stringOf(whitespaceChar, { maxLength: 5 }),
  )
  .map(([lead, core, trail]) => lead + core + trail);

/** Empty or whitespace-only input. */
const blankArb = fc.stringOf(whitespaceChar, { maxLength: 10 });

describe("Property-Based Tests: guest addition", () => {
  it("Property 9: Non-Empty Guest Name Can Be Added", () => {
    fc.assert(
      fc.property(paddedNameArb, (raw) => {
        const expectedName = raw.trim();
        const expectedInitials = expectedInitialsOf(expectedName);
        const expectedColor = colorService.generateColor(expectedName);

        const view = renderPage();
        try {
          submitName(raw);

          const items = guestItems();
          expect(items).toHaveLength(1);

          // Requirement 21.4: the trimmed name is added to the list
          expect(items[0].querySelector(".guest-name")?.textContent).toBe(
            expectedName,
          );

          // Requirement 21.4: the initial circle shows the correct initials
          const circle = circleOf(items[0]);
          expect(circle.textContent).toBe(expectedInitials);

          // Requirement 21.4: the circle uses the deterministic color for the name
          const { r, g, b } = expectedColor.rgb;
          expect(circle.style.backgroundColor).toBe(`rgb(${r}, ${g}, ${b})`);

          // Same name, same color: a second add of the same name yields an identical color
          submitName(raw);
          const twice = guestItems();
          expect(twice).toHaveLength(2);
          expect(circleOf(twice[1]).style.backgroundColor).toBe(
            circle.style.backgroundColor,
          );
          expect(colorService.generateColor(expectedName).hex).toBe(
            expectedColor.hex,
          );
        } finally {
          view.unmount();
        }
      }),
      { numRuns: 100 },
    );
  }, 60000);

  it("Property 9 (rejection): Empty or whitespace-only name is not added and the list is unchanged", () => {
    fc.assert(
      fc.property(paddedNameArb, blankArb, (baseline, blank) => {
        const view = renderPage();
        try {
          // Seed the list with one valid guest so "unchanged" is a meaningful check
          submitName(baseline);
          const before = guestItems().map((item) => item.textContent);
          expect(before).toHaveLength(1);

          submitName(blank);

          // Requirement 21.5: the guest is not added
          const after = guestItems().map((item) => item.textContent);
          expect(after).toEqual(before);

          // Requirement 21.5: a validation message is shown
          expect(screen.getByRole("alert")).toBeDefined();
        } finally {
          view.unmount();
        }
      }),
      { numRuns: 100 },
    );
  }, 60000);
});
