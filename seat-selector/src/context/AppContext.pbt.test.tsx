/**
 * Property-Based Tests for guest deletion in AppContext
 *
 * Property 12: Guest Deletion Removes From List
 * **Validates: Requirements 24.1, 24.2, 24.3, 24.4**
 *
 * For any guest list, any seat assignments, and any guest to delete, removing
 * that guest:
 * - removes it from the guest list, keeping every other guest in original order,
 * - unassigns every seat that was assigned to it,
 * - leaves all other seat assignments unchanged,
 * - clears the selection only when the deleted guest was the selected one.
 *
 * The confirmation dialog (Requirement 24.2) lives in the page component and is
 * not part of this context-level property.
 */
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { AppProvider, useApp } from "./AppContext";
import type { Guest } from "../types";

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AppProvider>{children}</AppProvider>;
  };
}

/** Builds a guest with a deterministic, unique id so expectations are easy to state. */
function makeGuest(index: number, name: string): Guest {
  return {
    id: `guest-${index}`,
    name,
    initials: `G${index}`,
    colorSeed: name,
    color: {
      hex: "#FF0000",
      rgb: { r: 255, g: 0, b: 0 },
      text: "white",
    },
  };
}

interface Scenario {
  names: string[];
  /** Entry i is the guest index assigned to seat number i + 1, or null if the seat is empty. */
  seatGuest: (number | null)[];
  targetIndex: number;
  selectedIndex: number | null;
}

const scenarioArb: fc.Arbitrary<Scenario> = fc
  .integer({ min: 1, max: 8 })
  .chain((guestCount) =>
    fc.record({
      names: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
        minLength: guestCount,
        maxLength: guestCount,
      }),
      seatGuest: fc.array(
        fc.option(fc.integer({ min: 0, max: guestCount - 1 }), { nil: null }),
        { maxLength: 20 },
      ),
      targetIndex: fc.integer({ min: 0, max: guestCount - 1 }),
      selectedIndex: fc.option(fc.integer({ min: 0, max: guestCount - 1 }), {
        nil: null,
      }),
    }),
  );

describe("Property 12: Guest Deletion Removes From List", () => {
  it("removes the target guest, unassigns only its seats, and keeps everything else unchanged", () => {
    fc.assert(
      fc.property(scenarioArb, (scenario) => {
        const guests = scenario.names.map((name, i) => makeGuest(i, name));
        const target = guests[scenario.targetIndex];

        const seatEntries: [number, string][] = [];
        scenario.seatGuest.forEach((guestIndex, seatIndex) => {
          if (guestIndex !== null) {
            seatEntries.push([seatIndex + 1, guests[guestIndex].id]);
          }
        });

        const { result, unmount } = renderHook(() => useApp(), {
          wrapper: createWrapper(),
        });

        act(() => {
          guests.forEach((guest) => result.current.addGuest(guest));
        });
        act(() => {
          seatEntries.forEach(([seatNumber, guestId]) =>
            result.current.assignGuest(seatNumber, guestId),
          );
        });
        if (scenario.selectedIndex !== null) {
          act(() => {
            result.current.selectGuest(guests[scenario.selectedIndex as number].id);
          });
        }

        const guestsBefore = result.current.guests;
        const assignmentsBefore = new Map(result.current.assignments);
        const selectedBefore = result.current.selectedGuestId;

        act(() => {
          result.current.removeGuest(target.id);
        });

        // 24.1 / 24.3: the target is removed and every other guest keeps its order.
        const expectedGuests = guestsBefore.filter((g) => g.id !== target.id);
        expect(result.current.guests).toEqual(expectedGuests);
        expect(result.current.guests.some((g) => g.id === target.id)).toBe(false);

        // 24.4: seats assigned to the target become unassigned.
        const targetSeats = [...assignmentsBefore.entries()]
          .filter(([, guestId]) => guestId === target.id)
          .map(([seatNumber]) => seatNumber);
        for (const seatNumber of targetSeats) {
          expect(result.current.assignments.has(seatNumber)).toBe(false);
        }

        // Every other assignment is unchanged, and no seat points at the target.
        const expectedAssignments = [...assignmentsBefore.entries()]
          .filter(([, guestId]) => guestId !== target.id)
          .sort(([a], [b]) => a - b);
        const actualAssignments = [...result.current.assignments.entries()].sort(
          ([a], [b]) => a - b,
        );
        expect(actualAssignments).toEqual(expectedAssignments);

        // Selection is cleared only when the deleted guest was selected.
        const expectedSelected = selectedBefore === target.id ? null : selectedBefore;
        expect(result.current.selectedGuestId).toBe(expectedSelected);

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});
