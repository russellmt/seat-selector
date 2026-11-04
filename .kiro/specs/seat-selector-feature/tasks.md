# Implementation Plan: Seat Selector Feature

## Overview

Implementation of a React + TypeScript + Vite interactive seating arrangement application with grid-based seat placement, guest management, and real-time assignments. The plan follows a phased approach: Foundation → Seat Canvas → Guest Arrangement → Integration & Polish.

---

## Tasks

### Phase 1: Foundation & Core Infrastructure

### Objective

Establish application structure, state management, and shared utilities that all other phases depend on.

---

- [x] 1. Set up application structure and routing
  - [x] 1.1 Initialize React Router with Home, SeatCanvas, and GuestArrangement pages
    - Create router configuration
    - Set up page components with basic shells
    - Implement client-side navigation
    - _Requirements: 1.1, 18.1, 36.1_
  
  - [x] 1.2 Create AppProvider context and hook
    - Build ApplicationContext with seat, guest, and UI state
    - Implement useApp hook for component access
    - Set up state update functions for all operations
    - _Requirements: 37.1, 37.2, 37.3_

- [x] 2. Define core TypeScript data models and interfaces
  - [x] 2.1 Create icon configuration types and loader
    - Define IconConfig, GridSize, Rotation types
    - Load DEFAULT_ICONS configuration
    - Create IconConfigService for management
    - _Requirements: 39.1, 39.2, 39.3, 39.4_
  
  - [x] 2.2 Implement Seat and Guest data models
    - Define Seat, Guest, GridPosition, Color interfaces
    - Create GuestAssignment types and utility functions
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 20.1, 20.2, 20.3_
  
  - [x] 2.3 Create UI state and ConfirmationDialog types
    - Define UIState, DragState, PreviewState interfaces
    - Implement ConfirmationDialog component structure
    - _Requirements: 6.1, 43.1_

- [x] 3. Implement grid utility functions
  - [x] 3.1 Build coordinate conversion functions (pixelToGrid, gridToPixel)
    - Implement pixel-to-grid quantization algorithm
    - Implement grid-to-pixel centering algorithm
    - _Requirements: 38.1, 38.2, 38.3, 38.4_
  
  - [x] 3.2 Implement collision detection and path calculation
    - Build hasCollision function for overlap detection
    - Implement calculateDragPath with Bresenham's line algorithm
    - Implement findSeatsInPath and getGridSquaresOccupied
    - _Requirements: 7.3, 8.2_
  
  - [x] 3.3 Write property tests for coordinate conversion
    - **Property 21: Grid Coordinates Uniquely Identify Positions**
    - **Validates: Requirements 38.1, 38.2, 38.3, 38.4**

- [x] 4. Implement seating numbering service
  - [x] 4.1 Create SeatNumberingService with implicit numbering algorithm
    - Sort seats by position (row, then column)
    - Assign sequential numbers starting at 1
    - Handle multi-grid seats (same number in all grid squares)
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  
  - [x] 4.2 Write property tests for implicit numbering
    - **Property 6: Implicit Numbering Is Deterministic**
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4**

- [x] 5. Implement color generation service
  - [x] 5.1 Create ColorService with deterministic color seeding
    - Hash guest name to numeric seed
    - Generate HSL color with sufficient saturation and lightness variation
    - Convert to RGB and determine text color for contrast (WCAG AA)
    - _Requirements: 40.1, 40.2, 40.3, 40.4_
  
  - [x] 5.2 Write property tests for color generation
    - **Property 22: Guest Color Generation Is Deterministic**
    - **Validates: Requirements 40.1, 40.2, 40.3, 40.4**

- [x] 6. Create shared utilities
  - [x] 6.1 Implement string utilities (getInitials, validation functions)
    - Guest initials extraction from name
    - Title validation (max 32 chars)
    - Guest name validation (non-empty, non-whitespace)
    - _Requirements: 3.2, 21.5, 43.1_
  
  - [x] 6.2 Create constants and configuration
    - Grid styling defaults (square size, colors)
    - Icon capacity configurations
    - Sort order enums and defaults
    - _Requirements: 2.1, 4.2, 4.4_

- [x] 7. Checkpoint - Foundation Setup Complete
  - Ensure all utilities export correctly and have minimal tests
  - Verify AppContext provides all required state and actions
  - Ask the user if questions arise.

---

## Phase 2: Seat Canvas UI & Interactions

### Objective

Build the Seat Canvas page with grid rendering, icon selection, seat placement/deletion, and hover previews.

---

- [x] 8. Create base canvas components
  - [x] 8.1 Create GridCanvas component with SVG canvas setup
    - Build SVG-based canvas container
    - Set up canvas dimensions and zoom defaults
    - Implement mouse event binding (click, drag, right-click)
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 8.2 Implement GridRenderer component
    - Render subtle blue grid lines
    - Use light opacity (0.3) for unobtrusive appearance
    - Scale grid with zoom level (future feature)
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 8.3 Write property tests for grid rendering
    - **Property 21: Grid Coordinates Uniquely Identify Positions**
    - **Validates: Requirements 38.1, 38.2, 38.3, 38.4**

- [x] 9. Create SeatCanvas page and header components
  - [x] 9.1 Build SeatCanvas page layout with header, main area, footer
    - Create three-section layout (header, canvas area, footer)
    - Set up state management connection
    - _Requirements: 1.1, 3.1, 14.1, 15.1, 16.1_
  
  - [x] 9.2 Implement TitleInput component
    - Create text input with max 32 character limit
    - Update AppContext on input change
    - Display validation error if exceeded
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 9.3 Implement RotationControls component
    - Display 4 directional buttons (left, up, right, down)
    - Highlight currently selected rotation
    - Update AppContext on button click
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
  
  - [x] 9.4 Write property tests for rotation state
    - **Property 4: Rotation State Cycles Through Cardinals**
    - **Validates: Requirements 10.2, 10.3, 10.4**

- [ ] 10. Implement icon bank component
  - [~] 10.1 Create IconBank component with 2-column grid layout
    - Display available icons organized by capacity
    - Implement scrollable container for many icons
    - Show capacity labels on each icon
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  
  - [~] 10.2 Implement icon selection and highlighting
    - Highlight selected icon with visual indicator
    - Update AppContext when icon is clicked
    - Show rotation state for selected icon
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [~] 10.3 Write property tests for icon cycling
    - **Property 3: Icon Cycling Wraps Correctly**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4**

- [ ] 11. Implement seat rendering and display
  - [~] 11.1 Create SeatRenderer component
    - Render placed seats with icon SVG at correct position
    - Apply rotation transform to each seat icon
    - Scale seats to match icon configuration dimensions
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [~] 11.2 Implement seat number display
    - Display implicit seat numbers as white text
    - Show numbers in center of each grid square occupied by seat
    - For multi-grid seats, display same number in all occupied squares
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [~] 11.3 Write property tests for seat placement and numbering
    - **Property 1: Seat Placement Creates Unoccupied Placement**
    - **Property 8: Seat Count Equals Number of Seats**
    - **Validates: Requirements 7.1, 7.2, 15.1, 15.2, 15.3**

- [ ] 12. Implement hover preview
  - [~] 12.1 Create PreviewRenderer component
    - Render semi-transparent (50% opacity) icon at hover position
    - Quantize preview to grid centers
    - Update preview position on mouse move
    - Hide preview when cursor leaves canvas
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 13. Implement left-click seat placement
  - [~] 13.1 Build click handler and seat creation logic
    - Detect left-click on canvas
    - Create seat at grid-quantized position
    - Check for collisions with existing seats
    - Add seat to AppContext state
    - _Requirements: 7.1, 7.2, 7.4_
  
  - [~] 13.2 Implement single-point and drag placement
    - Support single click placement
    - Support click-and-drag to place multiple seats
    - Recalculate seat numbers after each placement
    - _Requirements: 7.1, 7.3, 7.4_
  
  - [~] 13.3 Write property tests for seat placement
    - **Property 1: Seat Placement Creates Unoccupied Placement**
    - **Property 5: Icon Size Matches Configuration**
    - **Validates: Requirements 7.1, 7.2, 11.1, 11.2, 11.3, 11.4, 11.5**

- [ ] 14. Implement right-click seat deletion
  - [~] 14.1 Build right-click deletion handler
    - Detect right-click on canvas (prevent context menu)
    - Find seat at clicked position
    - Remove seat from AppContext state
    - Recalculate seat numbers
    - _Requirements: 8.1, 8.3_
  
  - [~] 14.2 Implement right-click drag deletion
    - Support click-and-drag deletion along path
    - Delete all seats intersecting drag path
    - Recalculate seat numbers after deletion
    - _Requirements: 8.2, 8.3_
  
  - [~] 14.3 Write property tests for seat deletion
    - **Property 2: Seat Deletion Removes Seat**
    - **Property 6: Implicit Numbering Is Deterministic**
    - **Validates: Requirements 8.1, 8.2, 8.4, 12.1, 12.2, 12.3, 12.4**

- [ ] 15. Implement keyboard shortcuts for Seat Canvas
  - [~] 15.1 Add arrow key handlers for icon cycling
    - Right arrow: select next icon (wrap to first at end)
    - Left arrow: select previous icon (wrap to last at start)
    - Update AppContext and highlight in IconBank
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [~] 15.2 Add R key handler for icon rotation
    - Press R to rotate selected icon 90 degrees clockwise
    - Cycle through cardinal directions: left → up → right → down → left
    - Update AppContext rotation state
    - _Requirements: 10.2, 10.3, 10.4_
  
  - [~] 15.3 Write property tests for keyboard shortcuts
    - **Property 23: Keyboard Shortcuts Trigger Correct Actions**
    - **Validates: Requirements 41.1, 41.2, 41.3**

- [ ] 16. Implement footer controls for Seat Canvas
  - [~] 16.1 Create SeatCountDisplay component
    - Display total number of seats
    - Update in real-time when seats added/removed
    - _Requirements: 15.1, 15.2, 15.3_
  
  - [~] 16.2 Create ClearAllButton (Seat Canvas)
    - Display "Clear All" button
    - Show confirmation dialog on click
    - Remove all seats from canvas on confirmation
    - _Requirements: 14.1, 14.2, 14.3_
  
  - [~] 16.3 Create SaveButton placeholder (Seat Canvas)
    - Display "Save" button (non-functional in Phase 1)
    - Show tooltip explaining Phase 1 limitation
    - _Requirements: 17.1, 17.2, 17.3_
  
  - [~] 16.4 Create AddGuestsButton
    - Display "Add Guests" button at bottom right
    - Navigate to GuestArrangement page on click
    - Pass seat configuration via AppContext
    - _Requirements: 16.1, 16.2, 16.3_

- [~] 17. Checkpoint - Seat Canvas Complete
  - Ensure seat placement, deletion, and numbering work correctly
  - Verify icon selection and rotation persists
  - Verify preview updates smoothly on hover
  - Ask the user if questions arise.

---

## Phase 3: Guest Arrangement UI & Interactions

### Objective

Build the Guest Arrangement page with guest management, assignment logic, bulk operations, and auto-advance functionality.

---

- [ ] 18. Create guest list panel component
  - [~] 18.1 Build GuestListPanel with 2-column grid layout
    - Display guests in similar grid layout to IconBank
    - Show guest color circle with initials
    - Implement scrollable container
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6_
  
  - [~] 18.2 Implement add guest functionality
    - Display "+" button at top of guest list
    - Create AddGuestInput modal/inline form
    - Validate non-empty guest name
    - Generate color and initials on submission
    - Add guest to AppContext state
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5_
  
  - [~] 18.3 Write property tests for guest addition
    - **Property 9: Non-Empty Guest Name Can Be Added**
    - **Validates: Requirements 21.1, 21.2, 21.3, 21.4, 21.5**

- [ ] 19. Implement guest selection and deletion
  - [~] 19.1 Implement guest entry selection
    - Single-click to highlight guest entry
    - Visual indicator for selected guest
    - Remember selection until user selects different guest
    - _Requirements: 23.1, 23.2, 23.3, 23.4_
  
  - [~] 19.2 Implement guest deletion
    - Delete key to remove selected guest
    - Show confirmation dialog before deletion
    - Unassign guest from all seats on deletion
    - Remove guest from AppContext state
    - _Requirements: 24.1, 24.2, 24.3, 24.4_
  
  - [~] 19.3 Write property tests for guest deletion
    - **Property 12: Guest Deletion Removes From List**
    - **Validates: Requirements 24.1, 24.2, 24.3, 24.4**

- [ ] 20. Implement guest editing and color regeneration
  - [~] 20.1 Implement guest name editing
    - Double-click guest entry to enter edit mode
    - Display editable input field with current name
    - Submit on Enter, cancel on Escape
    - _Requirements: 25.1, 25.2, 25.3, 25.4_
  
  - [~] 20.2 Implement color regeneration on name change
    - Regenerate guest color based on new name
    - Update initial circle with new color
    - Update text color for contrast
    - _Requirements: 25.3, 25.4_
  
  - [~] 20.3 Write property tests for guest editing
    - **Property 13: Guest Name Editing Updates Identity**
    - **Validates: Requirements 25.1, 25.2, 25.3, 25.4**

- [ ] 21. Implement guest sorting
  - [~] 21.1 Create SortButton component
    - Display sort button with current sort order
    - Cycle through: Original → Alphabetical ASC → Alphabetical DESC → Original
    - Update display order without changing assignments
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5_
  
  - [~] 21.2 Write property tests for guest sorting
    - **Property 10: Guest Sort Order Is Correct**
    - **Validates: Requirements 22.1, 22.2, 22.3, 22.4, 22.5**

- [ ] 22. Implement guest drag-to-reorder
  - [~] 22.1 Implement drag-and-drop reordering
    - Click-and-drag guest entry to reorder
    - Update original order (for "original" sort option)
    - Preserve seat assignments during reordering
    - Show visual feedback during drag
    - _Requirements: 26.1, 26.2, 26.3, 26.4, 26.5_
  
  - [~] 22.2 Write property tests for guest reordering
    - **Property 14: Guest Reordering Preserves Assignments**
    - **Validates: Requirements 26.1, 26.2, 26.3, 26.4, 26.5**

- [ ] 23. Create GuestArrangement page and header
  - [~] 23.1 Build GuestArrangement page layout
    - Create header, main area (guest list + canvas), footer layout
    - Set up state management connection
    - _Requirements: 18.1, 18.2, 19.1, 27.1_
  
  - [~] 23.2 Implement ArrangementNameInput component
    - Display editable arrangement name at top center
    - Generate default name (two random words + hyphen) if not provided
    - Update AppContext on input change
    - _Requirements: 19.1, 19.2, 19.3, 19.4_
  
  - [~] 23.3 Implement FillAllButton
    - Display "Fill all in order" button
    - Show confirmation dialog on click
    - Assign Guest[i] to Seat[i] for all valid i
    - Handle excess guests/seats gracefully
    - _Requirements: 31.1, 31.2, 31.3, 31.4, 31.5, 31.6_
  
  - [~] 23.4 Implement RandomizeButton
    - Display "Randomize" button
    - Show confirmation dialog on click
    - Shuffle guests and assign to seats randomly
    - Handle excess guests/seats gracefully
    - _Requirements: 32.1, 32.2, 32.3, 32.4, 32.5, 32.6, 32.7_
  
  - [~] 23.5 Write property tests for fill-all and randomize
    - **Property 17: Fill All In Order Maps Correctly**
    - **Property 18: Randomize Assigns All Possible Guests**
    - **Validates: Requirements 31.1-31.6, 32.1-32.7**

- [ ] 24. Implement guest assignment on canvas
  - [~] 24.1 Create GuestAssignmentRenderer component
    - Display guest initial circles on assigned seats
    - Overlay circles on seat icons
    - Show guest color with initials
    - _Requirements: 29.1, 29.2, 29.3, 29.4, 29.5_
  
  - [~] 24.2 Implement click-to-assign handler
    - Detect left-click on seat when guest selected
    - Assign guest to seat
    - Replace existing guest if seat occupied
    - Auto-advance to next unassigned guest
    - _Requirements: 29.1, 29.2, 29.3, 29.4_
  
  - [~] 24.3 Implement drag-to-assign handler
    - Support click-and-drag assignment along path
    - Assign guest to multiple seats in drag path
    - Auto-advance after final assignment
    - _Requirements: 29.5_
  
  - [~] 24.4 Write property tests for guest assignment
    - **Property 15: Guest Assignment Binds Guest to Seat**
    - **Validates: Requirements 29.1, 29.2, 29.3, 29.4, 29.5**

- [ ] 25. Implement guest preview on canvas hover
  - [~] 25.1 Implement PreviewRenderer for guest assignments
    - Show semi-transparent circle with guest initials on hover
    - Quantize preview to grid centers
    - 25% opacity over empty seats, 60% over occupied seats
    - Hide preview when cursor leaves canvas
    - _Requirements: 28.1, 28.2, 28.3, 28.4, 28.5, 28.6_

- [ ] 26. Implement auto-advance guest logic
  - [~] 26.1 Build auto-advance mechanism
    - After assignment, select next unassigned guest
    - Keep current guest selected if all assigned
    - Do not auto-advance on empty grid clicks
    - _Requirements: 30.1, 30.2, 30.3_
  
  - [~] 26.2 Write property tests for auto-advance
    - **Property 16: Auto-Advance Selects Next Unassigned**
    - **Validates: Requirements 30.1, 30.2, 30.3**

- [ ] 27. Implement footer controls for Guest Arrangement
  - [~] 27.1 Create AssignedCountDisplay component
    - Display "X / Y filled" format
    - Show number of assigned vs. total seats
    - Update in real-time on assignment changes
    - _Requirements: 33.1, 33.2, 33.3, 33.4_
  
  - [~] 27.2 Create ClearAllButton (Guest Arrangement)
    - Display "Clear All" button for assignments
    - Show confirmation dialog on click
    - Unassign all guests from all seats
    - Keep guests in list (only clear assignments)
    - _Requirements: 34.1, 34.2, 34.3, 34.4, 34.5, 34.6_
  
  - [~] 27.3 Write property tests for assignment clearing
    - **Property 20: Clear All Assignments Removes All Bindings**
    - **Validates: Requirements 34.1, 34.2, 34.3, 34.4, 34.5, 34.6**
  
  - [~] 27.4 Create SaveButton placeholder (Guest Arrangement)
    - Display "Save" button (non-functional in Phase 1)
    - Show tooltip explaining Phase 1 limitation
    - _Requirements: 35.1, 35.2, 35.3_
  
  - [~] 27.5 Create BackButton
    - Display "Back" button to return to Seat Canvas
    - Navigate to SeatCanvas page on click
    - Preserve seat configuration and guest list
    - _Requirements: 36.1, 36.2, 36.3_

- [~] 28. Checkpoint - Guest Arrangement Complete
  - Ensure guest management (add, edit, delete) works correctly
  - Verify assignment operations (fill-all, randomize, manual assignment)
  - Verify auto-advance and seat count display
  - Ask the user if questions arise.

---

## Phase 4: Integration & Polish

### Objective

Integrate all components, add confirmation dialogs, error handling, and final polish.

---

- [ ] 29. Implement confirmation dialogs and error handling
  - [~] 29.1 Create ConfirmationDialog component
    - Display modal with title, message, and action buttons
    - Support confirm/cancel callbacks
    - Show visual indication for destructive operations
    - _Requirements: 43.1, 43.2, 43.3_
  
  - [~] 29.2 Implement error handling across state updates
    - Validate input before state updates
    - Display user-friendly error messages
    - Prevent invalid state transitions
    - _Requirements: 43.1, 43.2, 43.3, 43.4_

- [ ] 30. Implement input validation and constraints
  - [~] 30.1 Add comprehensive input validation
    - Validate title length (max 32 chars)
    - Validate guest name (non-empty, non-whitespace)
    - Prevent duplicate entries where appropriate
    - _Requirements: 43.1, 43.3, 43.4_
  
  - [~] 30.2 Write property tests for input validation
    - **Property 24: Input Validation Rejects Invalid Values**
    - **Validates: Requirements 43.1, 43.3, 43.4**

- [ ] 31. Implement navigation and state persistence
  - [~] 31.1 Build navigation handlers between pages
    - Home → Seat Canvas
    - Seat Canvas → Guest Arrangement
    - Guest Arrangement → Seat Canvas
    - All paths preserve state via AppContext
    - _Requirements: 36.1, 36.2, 36.3, 37.1, 37.2, 37.3_
  
  - [~] 31.2 Verify state persistence across navigation
    - Seat configuration persists during page navigation
    - Guest list persists across pages
    - Assignments persist across navigation
    - _Requirements: 37.1, 37.2, 37.3_

- [ ] 32. Implement responsive canvas interaction and performance
  - [~] 32.1 Optimize canvas rendering performance
    - Use CSS transforms for GPU acceleration (rotation, scaling)
    - Debounce hover updates (15ms)
    - Implement virtual rendering for large grids
    - _Requirements: 42.1, 42.2, 42.3, 42.4_
  
  - [~] 32.2 Implement responsive sizing
    - Canvas scales with window size
    - Components resize appropriately
    - UI remains usable on different screen sizes
    - _Requirements: 2.1, 4.6, 20.2_

- [ ] 33. Add accessibility features
  - [~] 33.1 Implement keyboard navigation and focus management
    - All interactive elements keyboard-accessible
    - Clear focus indicators on all interactive elements
    - Proper tab order throughout application
    - _Requirements: 44.1, 44.2, 44.3, 44.4, 41.1, 41.2, 41.3_
  
  - [~] 33.2 Add ARIA labels and semantic HTML
    - Use semantic HTML throughout
    - Add aria-label for icon buttons
    - Add aria-live regions for dynamic updates
    - Test with screen reader if possible
    - _Requirements: 44.1, 44.2, 44.3, 44.4_
  
  - [~] 33.3 Ensure color contrast compliance
    - Verify all text meets WCAG AA minimum (4.5:1)
    - Test guest color generation for sufficient contrast
    - Verify grid lines don't interfere with readability
    - _Requirements: 2.3, 13.4, 44.1, 40.3_

- [ ] 34. Final testing and cross-browser verification
  - [~] 34.1 Run comprehensive unit tests
    - Execute all unit and property tests
    - Verify 100+ iterations on each property test
    - Fix any failing tests
  
  - [~] 34.2 Test on multiple browsers
    - Verify on Chrome, Firefox, Safari, Edge
    - Ensure consistent rendering and interactions
    - Test keyboard shortcuts across browsers
    - _Requirements: 45.1, 45.2, 45.3_
  
  - [~] 34.3 Verify responsive design
    - Test on different screen sizes
    - Ensure UI adapts appropriately
    - Verify touch interactions if applicable
  
  - [~] 34.4 Performance testing
    - Measure initial load time (< 2 seconds target)
    - Verify seat placement/deletion responsiveness (< 100ms)
    - Check hover preview FPS (60 FPS target)
    - Measure memory usage with large configurations

- [~] 35. Final checkpoint and handoff
  - Ensure all requirements are implemented
  - Verify all acceptance criteria pass
  - Run full test suite with 100% pass rate
  - Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional property-based tests and can be prioritized for later development
- Core implementation tasks (non-asterisk) must be completed before claiming feature complete
- Each phase includes a checkpoint task for validation before moving to next phase
- State management via AppContext enables all phases to work independently once foundation is complete
- Property tests use Vitest + fast-check framework (100 iterations minimum per property)
- All components follow TypeScript for type safety and use React hooks patterns
- CSS and styling guidance provided in design doc; focus on functionality in implementation tasks

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "2.1", "2.2", "2.3"] },
    { "id": 1, "tasks": ["3.1", "3.2", "4.1", "5.1", "6.1", "6.2"] },
    { "id": 2, "tasks": ["3.3", "4.2", "5.2"] },
    { "id": 3, "tasks": ["7"] },
    { "id": 4, "tasks": ["8.1", "8.2", "9.1", "9.2", "9.3", "10.1", "10.2"] },
    { "id": 5, "tasks": ["8.3", "9.4", "10.3", "11.1", "11.2", "11.3", "12.1"] },
    { "id": 6, "tasks": ["13.1", "13.2", "14.1", "14.2"] },
    { "id": 7, "tasks": ["13.3", "14.3", "15.1", "15.2", "15.3"] },
    { "id": 8, "tasks": ["16.1", "16.2", "16.3", "16.4"] },
    { "id": 9, "tasks": ["17"] },
    { "id": 10, "tasks": ["18.1", "18.2", "19.1", "19.2", "20.1", "20.2", "21.1", "22.1"] },
    { "id": 11, "tasks": ["18.3", "19.3", "20.3", "21.2", "22.2", "23.1", "23.2", "23.3", "23.4"] },
    { "id": 12, "tasks": ["23.5", "24.1", "24.2", "24.3", "25.1", "26.1"] },
    { "id": 13, "tasks": ["24.4", "26.2", "27.1", "27.2", "27.3", "27.4", "27.5"] },
    { "id": 14, "tasks": ["28"] },
    { "id": 15, "tasks": ["29.1", "29.2", "30.1"] },
    { "id": 16, "tasks": ["30.2", "31.1", "31.2"] },
    { "id": 17, "tasks": ["32.1", "32.2", "33.1", "33.2", "33.3"] },
    { "id": 18, "tasks": ["34.1", "34.2", "34.3", "34.4"] },
    { "id": 19, "tasks": ["35"] }
  ]
}
```

