# Bugfix Spec: Seat Numbering Model

## Bug Summary

The current seat numbering implementation incorrectly shows the same number for all grid squares occupied by a multi-seat icon (e.g., loveseat shows "1, 1" instead of "1, 2"). Additionally, tables incorrectly display numbers when they should display nothing (capacity 0 means no individual seats).

## Root Cause

The data model treats numbers as properties of the Seat object rather than properties of the grid. This causes all grid squares covered by a multi-seat icon to inherit the same seat number.

**Current (Incorrect) Model:**
```
Seat object = { id, iconId, position, rotation, number: 1 }
All grid squares this icon covers → display 1
```

**Correct Model:**
```
Seat object = { id, iconId, position, rotation } (no number field)
Grid square [0,0] → references this Seat, calculates number 1
Grid square [1,0] → references this Seat, calculates number 2
Grid square [1,1] → references this Seat, calculates number 3 (different from 1)
```

## Requirements

**Requirement**: Each grid square SHALL display the seat number corresponding to that specific seat position, even if multiple grid squares reference the same icon.

**Examples:**
- Table at [0,0]: occupies [0,0],[0,1],[1,0],[1,1] → NO numbers (capacity 0)
- Chair at [0,0]: occupies [0,0] → displays 1
- Loveseat at [0,0]: occupies [0,0],[1,0] → displays 1 at [0,0], displays 2 at [1,0]
- Couch at [0,0]: occupies [0,0],[1,0],[2,0] → displays 1, 2, 3 respectively

## Impact Analysis

**Files to modify:**
1. `src/types/Seat.ts` - Remove `number` field from Seat interface
2. `src/services/SeatNumberingService.ts` - Change from seat numbering to grid square numbering
3. `src/components/canvas/SeatRenderer.tsx` - Use grid square numbering instead of seat.number
4. `src/components/canvas/PreviewRenderer.tsx` - Update hover preview numbering
5. `src/context/AppContext.tsx` - Update seat creation (no initial number)

**Breaking changes:**
- Seat interface no longer has `number` field
- Numbering system based on grid square instead of seat object
- Storage format will differ (but only matters when implementing save/load)

**Tests affected:**
- PBT tests: May need to adjust expectations for seat number calculation
- Existing unit tests: Will need updates due to interface change

## Condition Analysis

**Pre-condition (Bug exists if all true):**
1. A multi-seat icon is placed on canvas
2. Multiple grid squares are occupied by this icon
3. Rendering shows the SAME number in all occupied squares

**Examples of bug manifestation:**
- Loveseat at [0,0] → shows 1 at both [0,0] and [1,0]
- Couch at [5,5] → shows 5 at [5,5], [6,5], [7,5] (should be 5, 6, 7)
- Table at [0,0] → shows 0 at all four squares (should show nothing)

**Root cause confirmation:**
```typescript
// Current (wrong) implementation
const occupiedSquares = getGridSquaresOccupied(seat.position, iconConfig.size);
for (const square of occupiedSquares) {
  const key = `${square.col},${square.row}`;
  map.set(key, seat.number);  // ← ALL squares get SAME seat.number
}
```

## Solution

**Phase 1: Data Model**
1. Remove `number` field from Seat interface
2. Update createSeat() to not set number
3. Add logic to skip rendering numbers for tables (capacity 0)

**Phase 2: Numbering Logic**
1. Modify SeatNumberingService to calculate numbers per grid square, not per seat
2. New function: `getNumberForGridSquare(gridPosition, seats, iconConfigs)` 
   - Find seat occupying this grid square
   - Calculate which index this grid square is within that seat's footprint
   - Return the calculated number for this position
3. Maintain deterministic left-to-right, top-to-bottom ordering

**Phase 3: Rendering**
1. Update SeatRenderer to:
   - Loop through occupied grid squares
   - Call getNumberForGridSquare for EACH square
   - Display the calculated number
2. Update PreviewRenderer similarly
3. Skip number rendering for tables (capacity 0)

**Phase 4: Testing**
1. Update PBT tests to match new numbering behavior
2. Add test cases: loveseat shows different numbers, table shows no numbers
3. Verify collision detection still works correctly

## Success Criteria

1. Table at any position shows NO seat numbers
2. Chair shows 1 seat number
3. Loveseat shows 2 DIFFERENT seat numbers (consecutive, left-to-right)
4. Couch shows 3 DIFFERENT seat numbers (consecutive, left-to-right)
5. Hover preview correctly shows all numbers for multi-seat icons
6. All 672 existing tests still pass (after updates)

## Testing Strategy

**Unit Tests:**
- Test getNumberForGridSquare() with various seat configurations
- Test that table has capacity 0 and produces no numbers
- Test that loveseat produces exactly 2 different numbers

**PBT (Property-Based Tests):**
- Property: For any placed icon, the count of unique numbers shown SHALL equal the icon's capacity
- Property: Numbers SHALL be consecutive when icon is horizontal
- Property: All occupied grid squares SHALL show different numbers

**Manual Testing:**
1. Place table → no numbers
2. Place chair → one number
3. Place loveseat → two different numbers
4. Place couch → three different numbers
5. Place loveseat, rotate 90 degrees, place couch → numbering recalculates correctly
6. Hover preview shows correct numbers for each icon type
