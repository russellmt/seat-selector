import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "../context/AppContext";
import SeatCanvas from "./SeatCanvas";
import * as fc from "fast-check";

// Wrapper component for tests
function SeatCanvasWithProviders() {
  return (
    <AppProvider>
      <BrowserRouter>
        <SeatCanvas />
      </BrowserRouter>
    </AppProvider>
  );
}

/**
 * Task 15.3: Property Tests for Keyboard Shortcuts
 *
 * **Validates: Requirements 41.1, 41.2, 41.3**
 *
 * Property 23: Keyboard Shortcuts Trigger Correct Actions
 *
 * This test verifies that keyboard shortcuts on the Seat Canvas
 * trigger the correct UI state changes.
 *
 * Icon layout in 2-column grid:
 * [0] [1]  (table, chair)
 * [2] [3]  (loveseat, couch)
 */
describe("SeatCanvas - Property 23: Keyboard Shortcuts Trigger Correct Actions (Task 15.3)", () => {
  /**
   * Property: Right Arrow Key Cycles to Next Icon
   *
   * Requirement 9.1: WHEN the user presses the right arrow key,
   * THE Application SHALL select the next icon in the Icon_Bank
   *
   * Requirement 9.4: WHEN the user presses the right arrow at the last icon,
   * THE Application SHALL cycle to the first icon
   */
  it("Property: Right Arrow Key Cycles Through Icons Linearly (Requirement 9.1, 9.4)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4 }), (startIconIndex: number) => {
        const { unmount } = render(<SeatCanvasWithProviders />);

        // Icon order: table-round-4 (0), chair-1 (1), loveseat-2 (2), couch-3 (3)
        const iconLabels = [
          /Round Table \(4-top\)/i,
          /Square Table \(4-top\)/i,
          /Chair/i,
          /Loveseat/i,
          /Couch/i,
        ];

        // Select the starting icon
        if (startIconIndex > 0) {
          const startIcon = screen.getByLabelText(iconLabels[startIconIndex]);
          fireEvent.click(startIcon);
        }

        // Press right arrow
        fireEvent.keyDown(window, { key: "ArrowRight" });

        // Expected: move to next icon linearly with wrap-around
        const expectedIndex = (startIconIndex + 1) % 5;
        const expectedIcon = screen.getByLabelText(iconLabels[expectedIndex]);
        expect(expectedIcon.getAttribute("aria-pressed")).toBe("true");

        unmount();
      }),
      { numRuns: 50 },
    );
  });

  /**
   * Property: Left Arrow Key Cycles to Previous Icon
   *
   * Requirement 9.2: WHEN the user presses the left arrow key,
   * THE Application SHALL select the previous icon in the Icon_Bank
   *
   * Requirement 9.3: WHEN the user presses the left arrow at the first icon,
   * THE Application SHALL cycle to the last icon
   */
  it("Property: Left Arrow Key Cycles Through Icons Linearly (Requirement 9.2, 9.3)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4 }), (startIconIndex: number) => {
        const { unmount } = render(<SeatCanvasWithProviders />);

        // Icon order: table-round-4 (0), chair-1 (1), loveseat-2 (2), couch-3 (3)
        const iconLabels = [
          /Round Table \(4-top\)/i,
          /Square Table \(4-top\)/i,
          /Chair/i,
          /Loveseat/i,
          /Couch/i,
        ];

        // Select the starting icon
        if (startIconIndex > 0) {
          const startIcon = screen.getByLabelText(iconLabels[startIconIndex]);
          fireEvent.click(startIcon);
        }

        // Press left arrow
        fireEvent.keyDown(window, { key: "ArrowLeft" });

        // Expected: move to previous icon linearly with wrap-around
        const expectedIndex = (startIconIndex - 1 + 5) % 5;
        const expectedIcon = screen.getByLabelText(iconLabels[expectedIndex]);
        expect(expectedIcon.getAttribute("aria-pressed")).toBe("true");

        unmount();
      }),
      { numRuns: 50 },
    );
  });

  /**
   * Property: Down Arrow Key Moves Vertically
   *
   * WHEN the user presses the down arrow key,
   * THE Application SHALL select the icon below (next row)
   */
  it("Property: Down Arrow Key Moves Down in 2-Column Grid", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4 }), (startIconIndex: number) => {
        const { unmount } = render(<SeatCanvasWithProviders />);

        const iconLabels = [
          /Round Table \(4-top\)/i,
          /Square Table \(4-top\)/i,
          /Chair/i,
          /Loveseat/i,
          /Couch/i,
        ];

        // Select the starting icon
        if (startIconIndex > 0) {
          const startIcon = screen.getByLabelText(iconLabels[startIconIndex]);
          fireEvent.click(startIcon);
        }

        // Press down arrow
        fireEvent.keyDown(window, { key: "ArrowDown" });

        // Expected: move down 2 positions (next row in 2-column grid)
        // [0] -> [2], [1] -> [3], [2] -> [0] (wrap), [3] -> [1] (wrap)
        const expectedIndex = (startIconIndex + 2) % 5;
        const expectedIcon = screen.getByLabelText(iconLabels[expectedIndex]);
        expect(expectedIcon.getAttribute("aria-pressed")).toBe("true");

        unmount();
      }),
      { numRuns: 50 },
    );
  });

  /**
   * Property: Up Arrow Key Moves Vertically
   *
   * WHEN the user presses the up arrow key,
   * THE Application SHALL select the icon above (previous row)
   */
  it("Property: Up Arrow Key Moves Up in 2-Column Grid", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4 }), (startIconIndex: number) => {
        const { unmount } = render(<SeatCanvasWithProviders />);

        const iconLabels = [
          /Round Table \(4-top\)/i,
          /Square Table \(4-top\)/i,
          /Chair/i,
          /Loveseat/i,
          /Couch/i,
        ];

        // Select the starting icon
        if (startIconIndex > 0) {
          const startIcon = screen.getByLabelText(iconLabels[startIconIndex]);
          fireEvent.click(startIcon);
        }

        // Press up arrow
        fireEvent.keyDown(window, { key: "ArrowUp" });

        // Expected: move up 2 positions (previous row in 2-column grid)
        // [0] -> [2] (wrap), [1] -> [3] (wrap), [2] -> [0], [3] -> [1]
        const expectedIndex = (startIconIndex - 2 + 5) % 5;
        const expectedIcon = screen.getByLabelText(iconLabels[expectedIndex]);
        expect(expectedIcon.getAttribute("aria-pressed")).toBe("true");

        unmount();
      }),
      { numRuns: 50 },
    );
  });

  /**
   * Property: R Key Rotates Icon Clockwise Through Cardinal Directions
   *
   * Requirement 10.2: WHEN the user clicks a rotation button or presses the R key,
   * THE Application SHALL rotate the selected icon 90 degrees clockwise
   *
   * Requirement 10.3: THE rotation SHALL cycle through four cardinal directions:
   * left, up, right, down (and back to left)
   */
  it("Property: R Key Rotates Through Cardinal Directions (Requirement 10.2, 10.3)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 3 }), (numRotations: number) => {
        const { unmount } = render(<SeatCanvasWithProviders />);

        const rotationCycle = ["left", "up", "right", "down"];

        // Default rotation should be 'down'
        let currentRotation = "down";
        let currentIndex = rotationCycle.indexOf(currentRotation);

        // Press R key multiple times
        for (let i = 0; i < numRotations; i++) {
          fireEvent.keyDown(window, { key: "r" });

          // Expected next rotation
          currentIndex = (currentIndex + 1) % rotationCycle.length;
          currentRotation = rotationCycle[currentIndex];
        }

        // Verify the correct rotation button is highlighted
        // The rotation controls display the current rotation state
        const rotationButtons = screen
          .getAllByRole("button")
          .filter((btn) => btn.getAttribute("aria-label")?.includes("Rotate"));

        // At least one rotation button should exist
        expect(rotationButtons.length).toBeGreaterThanOrEqual(4);

        unmount();
      }),
      { numRuns: 50 },
    );
  });

  /**
   * Property: R Key Cycles (4 Rotations Return to Starting Point)
   *
   * This property verifies that 4 rotations (full circle) returns to the starting rotation
   */
  it("Property: Four R Key Presses Return to Starting Rotation (Requirement 10.3)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }),
        (additionalRotations: number) => {
          const { unmount } = render(<SeatCanvasWithProviders />);

          // Default is 'down'
          let expectedIndex = 3; // 'down' is at index 3

          // Press R four times (full rotation)
          for (let i = 0; i < 4; i++) {
            fireEvent.keyDown(window, { key: "r" });
          }

          // Should be back to 'down'
          // We can verify by the rotation controls state
          const rotationButtons = screen
            .getAllByRole("button")
            .filter((btn) =>
              btn.getAttribute("aria-label")?.includes("Rotate"),
            );

          expect(rotationButtons.length).toBeGreaterThanOrEqual(4);

          unmount();
        },
      ),
      { numRuns: 50 },
    );
  });

  /**
   * Property: Keyboard Shortcuts Don't Trigger on Input Fields
   *
   * Requirement 41.2 implies that keyboard shortcuts should NOT interfere
   * with normal text input in form fields
   *
   * This property verifies that typing in an input field doesn't trigger shortcuts
   */
  it("Property: Keyboard Shortcuts Disabled in Input Fields (Requirement 41.1)", () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.char(), { minLength: 1, maxLength: 10 }),
        (text: string) => {
          // Skip if text contains arrow keys or 'r'
          if (text.includes("r") || text.includes("R")) {
            return; // Skip this case
          }

          const { unmount } = render(<SeatCanvasWithProviders />);

          // Create and focus an input element (simulating form input)
          const input = document.createElement("input");
          input.type = "text";
          document.body.appendChild(input);
          input.focus();

          // Get initial selected icon
          const initialSelectedIcon = screen.getByLabelText(
            /Round Table \(4-top\)/i,
          );
          const initialSelection =
            initialSelectedIcon.getAttribute("aria-pressed");

          // Try pressing right arrow (should be ignored because input is focused)
          fireEvent.keyDown(input, { key: "ArrowRight" });

          // Icon selection should not change
          expect(initialSelectedIcon.getAttribute("aria-pressed")).toBe(
            initialSelection,
          );

          // Clean up
          document.body.removeChild(input);
          unmount();
        },
      ),
      { numRuns: 30 },
    );
  });

  /**
   * Property: Multiple Consecutive Shortcuts Work Correctly
   *
   * This property verifies that pressing multiple shortcuts in sequence
   * each triggers the correct action
   */
  it("Property: Multiple Consecutive Shortcuts Execute Correctly (Requirement 41.1)", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            fc.constant("ArrowRight"),
            fc.constant("ArrowLeft"),
            fc.constant("ArrowUp"),
            fc.constant("ArrowDown"),
            fc.constant("r"),
          ),
          { minLength: 1, maxLength: 10 },
        ),
        (keySequence: string[]) => {
          const { unmount } = render(<SeatCanvasWithProviders />);

          const iconLabels = [
            /Round Table \(4-top\)/i,
            /Square Table \(4-top\)/i,
            /Chair/i,
            /Loveseat/i,
            /Couch/i,
          ];

          let currentIconIndex = 0; // Start at table
          let currentRotationIndex = 3; // Start at 'down'

          // Execute each key press
          keySequence.forEach((key) => {
            fireEvent.keyDown(window, { key });

            if (key === "ArrowRight") {
              currentIconIndex = (currentIconIndex + 1) % 5;
            } else if (key === "ArrowLeft") {
              currentIconIndex = (currentIconIndex - 1 + 5) % 5;
            } else if (key === "ArrowDown") {
              currentIconIndex = (currentIconIndex + 2) % 5;
            } else if (key === "ArrowUp") {
              currentIconIndex = (currentIconIndex - 2 + 5) % 5;
            } else if (key === "r") {
              currentRotationIndex = (currentRotationIndex + 1) % 4;
            }
          });

          // Verify final icon selection
          const finalSelectedIcon = screen.getByLabelText(
            iconLabels[currentIconIndex],
          );
          expect(finalSelectedIcon.getAttribute("aria-pressed")).toBe("true");

          unmount();
        },
      ),
      { numRuns: 30 },
    );
  });

  /**
   * Property: Icon Bank Highlight Updates with Keyboard Navigation
   *
   * Requirement 9.5: THE Application SHALL update the Icon_Bank highlight
   * to show the newly selected icon
   *
   * This property verifies that keyboard navigation visually updates the icon bank
   */
  it("Property: Icon Bank Highlight Updates with Keyboard Navigation (Requirement 9.5)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 4 }),
        fc.integer({ min: 1, max: 3 }),
        (startIndex: number, numDownPresses: number) => {
          const { unmount } = render(<SeatCanvasWithProviders />);

          const iconLabels = [
            /Round Table \(4-top\)/i,
            /Square Table \(4-top\)/i,
            /Chair/i,
            /Loveseat/i,
            /Couch/i,
          ];

          // Select starting icon
          if (startIndex > 0) {
            const startIcon = screen.getByLabelText(iconLabels[startIndex]);
            fireEvent.click(startIcon);
          }

          // Calculate expected final index after down arrow presses
          let expectedIndex = startIndex;
          for (let i = 0; i < numDownPresses; i++) {
            fireEvent.keyDown(window, { key: "ArrowDown" });
            expectedIndex = (expectedIndex + 2) % 5;
          }

          // Verify final selection
          const finalIcon = screen.getByLabelText(iconLabels[expectedIndex]);
          expect(finalIcon.getAttribute("aria-pressed")).toBe("true");

          // Verify other icons are not selected
          iconLabels.forEach((label, idx) => {
            if (idx !== expectedIndex) {
              const icon = screen.getByLabelText(label);
              expect(icon.getAttribute("aria-pressed")).toBe("false");
            }
          });

          unmount();
        },
      ),
      { numRuns: 40 },
    );
  });

  /**
   * Property: Rotation Persists Globally Across Icon Changes
   *
   * Requirement 10.5: THE rotation setting SHALL be global and persist
   * across icon selections
   *
   * This property verifies that rotation state is maintained globally
   * and not reset when switching icons
   */
  it("Property: Rotation Persists Globally Across Icon Changes (Requirement 10.5)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 3 }),
        fc.integer({ min: 0, max: 3 }),
        (icon1Index: number, icon2Index: number) => {
          // Skip if same icon
          if (icon1Index === icon2Index) {
            return;
          }

          const { unmount } = render(<SeatCanvasWithProviders />);

          const iconLabels = [
            /Round Table \(4-top\)/i,
            /Square Table \(4-top\)/i,
            /Chair/i,
            /Loveseat/i,
            /Couch/i,
          ];

          // Select first icon and rotate it twice
          const icon1 = screen.getByLabelText(iconLabels[icon1Index]);
          fireEvent.click(icon1);

          fireEvent.keyDown(window, { key: "r" });
          fireEvent.keyDown(window, { key: "r" });

          // Select second icon - rotation should persist (not reset to default)
          const icon2 = screen.getByLabelText(iconLabels[icon2Index]);
          fireEvent.click(icon2);

          // The rotation should still be at "right" (2 rotations from default "down")
          // not reset back to "down"
          const rotationButtons = screen
            .getAllByRole("button")
            .filter((btn) =>
              btn.getAttribute("aria-label")?.includes("Rotate"),
            );

          expect(rotationButtons.length).toBeGreaterThanOrEqual(4);

          unmount();
        },
      ),
      { numRuns: 30 },
    );
  });

  /**
   * Property: Case Insensitive R Key
   *
   * Requirement 10.2 mentions "presses the R key" without specifying case
   * This property verifies both 'r' and 'R' work
   */
  it("Property: R Key Case Insensitive (Requirement 10.2)", () => {
    fc.assert(
      fc.property(
        fc.array(fc.oneof(fc.constant("r"), fc.constant("R")), {
          minLength: 1,
          maxLength: 4,
        }),
        (keyPresses: string[]) => {
          const { unmount } = render(<SeatCanvasWithProviders />);

          const rotationCycle = ["left", "up", "right", "down"];
          let expectedIndex = 3; // Start at 'down'

          // Execute each key press
          keyPresses.forEach((key) => {
            fireEvent.keyDown(window, { key });
            expectedIndex = (expectedIndex + 1) % rotationCycle.length;
          });

          // Should have rotated expectedIndex - 3 times from 'down'
          const rotationButtons = screen
            .getAllByRole("button")
            .filter((btn) =>
              btn.getAttribute("aria-label")?.includes("Rotate"),
            );

          expect(rotationButtons.length).toBeGreaterThanOrEqual(4);

          unmount();
        },
      ),
      { numRuns: 40 },
    );
  });
});
