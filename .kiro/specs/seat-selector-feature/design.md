# Design Document

## Seat Selector Feature - Technical Design

---

## Overview

The Seat Selector is a React + TypeScript + Vite application that enables users to create custom seating arrangements through an interactive grid-based interface. The design follows a layered architecture with clear separation between state management, component rendering, and business logic.

### Architecture Philosophy

- **Unidirectional Data Flow**: State flows down through props; events bubble up through callbacks
- **Immutable State Updates**: All state modifications create new objects rather than mutating existing ones
- **Component Composition**: Small, focused components composed into larger features
- **Type Safety**: Comprehensive TypeScript interfaces for all data structures
- **Testability**: Pure functions for business logic (numbering, color generation, collision detection)

---

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Application Shell                         │
│                    (Routing & State Provider)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
       ┌──────▼──────┐  ┌─────▼─────┐  ┌─────▼────────┐
       │  Home Page  │  │ Seat      │  │ Guest        │
       │             │  │ Canvas    │  │ Arrangement  │
       │             │  │           │  │              │
       └──────┬──────┘  └─────┬─────┘  └─────┬────────┘
              │               │               │
              └───────────────┼───────────────┘
                              │
                 ┌────────────▼────────────┐
                 │  Application Context    │
                 │  - Seat Configuration   │
                 │  - Guest List           │
                 │  - Assignments          │
                 └─────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
        ┌─────▼─────┐   ┌────▼─────┐   ┌────▼────────┐
        │  Services │   │ Utilities │   │   Constants  │
        │ (Icon     │   │ (Grid,    │   │ (Colors,     │
        │  Config)  │   │  Numbers) │   │  Configs)    │
        └───────────┘   └──────────┘   └─────────────┘
```

### Component Hierarchy

```
App
├── Home
│   └── NewConfigButton
├── SeatCanvas
│   ├── CanvasHeader
│   │   ├── TitleInput
│   │   └── RotationControls
│   ├── CanvasLayout
│   │   ├── IconBank
│   │   │   └── IconItem[] (2-column grid)
│   │   └── GridCanvas
│   │       ├── GridRenderer
│   │       ├── SeatRenderer
│   │       ├── PreviewRenderer
│   │       └── InteractionLayer
│   └── CanvasFooter
│       ├── SeatCountDisplay
│       ├── ClearAllButton
│       ├── SaveButton
│       └── AddGuestsButton
└── GuestArrangement
    ├── ArrangementHeader
    │   ├── ArrangementNameInput
    │   ├── FillAllButton
    │   └── RandomizeButton
    ├── ArrangementLayout
    │   ├── GuestListPanel
    │   │   ├── AddGuestButton
    │   │   ├── SortButton
    │   │   └── GuestEntry[] (2-column grid)
    │   └── GridCanvas (display mode)
    │       ├── GridRenderer
    │       ├── SeatRenderer
    │       ├── GuestAssignmentRenderer
    │       ├── PreviewRenderer
    │       └── InteractionLayer
    └── ArrangementFooter
        ├── AssignedCountDisplay
        ├── ClearAllButton
        ├── SaveButton
        └── BackButton
```

---

## State Management

### Application Context Structure

The application uses React Context for global state management, providing a centralized point for seat configuration, guest list, and assignments that persists across page navigation.

```
ApplicationContext
├── Configuration
│   ├── title: string
│   ├── seats: Seat[]
│   ├── selectedIconId: string
│   ├── selectedRotation: Rotation
│   └── iconRotationStates: Map<iconId, Rotation>
├── GuestState
│   ├── guests: Guest[]
│   ├── selectedGuestId: string | null
│   ├── sortOrder: SortOrder
│   └── assignments: Map<seatNumber, guestId>
└── UIState
    ├── arrangementName: string
    ├── currentPage: 'home' | 'canvas' | 'guests'
    └── confirmationDialog: ConfirmationState
```

### State Management Strategy

**Context Provider**: Single `AppProvider` wraps entire application and manages:
1. Seat configuration state
2. Guest list state
3. UI navigation state
4. Shared actions (addSeat, removeSeat, assignGuest, etc.)

**Local Component State**: Individual components manage:
1. UI-only state (hover preview position, edit mode flags)
2. Form inputs (title input, guest name input)
3. Animation/visual state (drag state, focus state)

**Immutable Updates**: All state updates follow immutable patterns:
```typescript
// Bad - mutation
seats[0].number = 1;

// Good - immutable update
const updatedSeats = seats.map((s, i) => i === 0 ? {...s, number: 1} : s);
```

---

## Data Models

### Core TypeScript Interfaces

```typescript
// === Icon Configuration ===
interface IconConfig {
  id: string;
  capacity: number;
  size: GridSize;
  name: string;
  svg: string; // SVG content or path
  color: string;
}

interface GridSize {
  width: number;  // in grid squares
  height: number; // in grid squares
}

// === Seat ===
interface Seat {
  id: string;
  iconId: string;
  position: GridPosition;
  rotation: Rotation;
  number: number; // implicit numbering
}

interface GridPosition {
  col: number;
  row: number;
}

type Rotation = 'left' | 'up' | 'right' | 'down';
type CardinalDirection = Rotation; // same as Rotation

// === Guest ===
interface Guest {
  id: string;
  name: string;
  initials: string;
  colorSeed: string;
  color: Color;
}

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  text: 'white' | 'black'; // for contrast
}

// === Guest Assignment ===
interface GuestAssignment {
  seatNumber: number;
  guestId: string;
}

type GuestAssignmentMap = Map<number, string>; // seatNumber -> guestId

// === Configuration ===
interface SeatingConfiguration {
  title: string;
  seats: Seat[];
  createdAt: Date;
  lastModified: Date;
}

interface GuestArrangement {
  name: string;
  configuration: SeatingConfiguration;
  guests: Guest[];
  assignments: GuestAssignmentMap;
  sortOrder: SortOrder;
}

type SortOrder = 'original' | 'alphabetical-asc' | 'alphabetical-desc';

// === UI State ===
interface UIState {
  selectedIconId: string;
  selectedRotation: Rotation;
  selectedGuestId: string | null;
  hoverPosition: GridPosition | null;
  isDragging: boolean;
  dragStart: GridPosition | null;
}

interface ConfirmationDialog {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// === Canvas Rendering ===
interface GridDimensions {
  squareSize: number; // pixels at zoom level
  offsetX: number;    // canvas offset
  offsetY: number;    // canvas offset
  cols: number;
  rows: number;
}

interface PreviewState {
  type: 'icon' | 'guest' | null;
  position: GridPosition | null;
  opacity: number;
}
```

---

## Key Algorithms

### 1. Implicit Numbering Algorithm

The numbering system assigns unique numbers to seats based on their grid position, scanning left-to-right then top-to-bottom.

**Algorithm: CalculateSeatNumbers**

```
Input: seats array with positions
Output: seats array with assigned numbers

1. Create array of (seat, position) tuples
2. Sort by row (ascending), then by column (ascending)
3. Assign numbers 1, 2, 3, ... in sorted order
4. Handle multi-grid seats: all grid squares occupied by a seat receive the same number
5. Return updated seats array
```

**Complexity**: O(n log n) where n = number of seats

**Implementation Details**:
- Multi-grid seats (e.g., 2×2 table occupying 4 grid squares) display the same number in all 4 squares
- Numbering recalculates whenever seats are added, removed, or their positions change
- Ensures unique, deterministic numbering based purely on position

### 2. Collision Detection Algorithm

Prevents placing seats on occupied grid squares and identifies all seats in a drag path.

**Algorithm: GetCollisions**

```
Input: targetPosition (grid cell), seat size (width × height)
Output: list of seats at those positions, or empty if clear

1. Calculate all grid squares occupied by the seat footprint
2. For each grid square, check if a seat already exists there
3. Return list of colliding seats
4. If list is empty, placement is allowed
```

**Complexity**: O(n) where n = number of seats

**Algorithm: GetSeatsInDragPath**

```
Input: dragStart, dragEnd (grid positions), seat size
Output: list of all grid positions in the path

1. If no drag, return [single position]
2. Calculate all grid squares along the path (Bresenham's line algorithm)
3. For each grid square in path:
   - Identify all occupied grid squares for a seat at that position
   - Add to results (avoiding duplicates)
4. Return ordered list of positions
```

### 3. Color Generation Algorithm

Deterministically assigns colors to guests based on their name, ensuring consistent coloring across sessions.

**Algorithm: GenerateGuestColor**

```
Input: guestName (string)
Output: color object with hex, rgb, and appropriate text color

1. Hash the guest name to a numeric seed (0-0xFFFFFF)
2. Extract H, S, L from seed using modulo arithmetic
   - Hue: (seed % 360)
   - Saturation: ((seed >> 8) % 40) + 60  // 60-100%
   - Lightness: ((seed >> 16) % 30) + 45  // 45-75%
3. Convert HSL to RGB
4. Determine text color (white or black) for contrast:
   - Calculate relative luminance of RGB
   - If luminance > 0.5, use black text; else use white
5. Return color object
```

**Complexity**: O(1)

**Color Space**: 360 hues × 40 saturations × 30 lightness variations = 432,000 possible distinct colors

**Contrast Algorithm (WCAG AA)**:
```
relativeLuminance = 0.299 × R + 0.587 × G + 0.114 × B (normalized to 0-1)
textColor = relativeLuminance > 0.5 ? 'black' : 'white'
```

### 4. Grid Coordinate Conversion

Converts between pixel coordinates (mouse events) and grid coordinates (logical positions).

**Algorithm: PixelToGrid**

```
Input: pixelX, pixelY (from mouse event), gridDimensions
Output: gridPosition { col, row }

1. Subtract canvas offset from pixel coordinates
2. Divide by grid square size
3. Quantize to nearest integer (round to grid center)
4. Clamp to valid grid bounds
5. Return GridPosition
```

**Algorithm: GridToPixel**

```
Input: gridPosition, gridDimensions
Output: pixelX, pixelY (center of grid square)

1. Multiply grid column by square size
2. Multiply grid row by square size
3. Add canvas offset
4. Return {pixelX, pixelY}
```

### 5. Guest Assignment Algorithm

Intelligently assigns guests to seats, handling auto-advance and excess guests/seats.

**Algorithm: FillAllInOrder**

```
Input: guests array, seats array, iconConfigs
Output: assignmentMap

1. Filter guests who are not yet assigned
2. For each guest in original order:
   - Find first unassigned seat
   - If seat exists, assign guest to seat
   - If no seat, mark guest as unassigned
3. Return assignmentMap (seat number -> guest ID)
```

**Algorithm: RandomizeAssignments**

```
Input: guests array, seats array
Output: assignmentMap

1. Create list of unassigned guest IDs
2. Shuffle guest list using Fisher-Yates
3. For each seat in order:
   - Pop a guest from shuffled list
   - Assign guest to seat
   - If no more guests, stop
4. Return assignmentMap
```

**Algorithm: AutoAdvanceGuest**

```
Input: assignments, guests array, current selected guest
Output: nextGuestId or same guest if all assigned

1. Find index of currently selected guest in guests array
2. Starting from next index, find first guest not in assignments
3. If found, return that guest's ID
4. If not found, return current guest ID (no advance)
```

---

## Components and Interfaces

### Component Interface Specifications

Each component follows a standardized interface pattern for consistency and maintainability.

#### Core Page Components

**Home Component**
```typescript
interface HomeProps {}

interface HomeState {
  // No internal state - all navigation through context
}
```
- Responsible for home page UI
- Displays "New Seat Config" and "Load Existing Config" buttons
- Handles navigation to Seat Canvas

**SeatCanvas Component**
```typescript
interface SeatCanvasProps {
  // All props come from context
}

interface SeatCanvasState {
  hoverPosition: GridPosition | null;
  dragState: DragState | null;
  editingTitle: boolean;
}

interface DragState {
  startPosition: GridPosition;
  currentPosition: GridPosition;
  mouseButton: 'left' | 'right';
}
```
- Main canvas for seat placement
- Handles all mouse and keyboard interactions
- Renders grid, seats, and previews

**GuestArrangement Component**
```typescript
interface GuestArrangementProps {
  // All props come from context
}

interface GuestArrangementState {
  hoverPosition: GridPosition | null;
  dragState: DragState | null;
  editingGuest: string | null;
}
```
- Guest management interface
- Canvas display (read-only mode)
- Guest list panel with sort/reorder

#### Layout Components

**CanvasLayout Component**
```typescript
interface CanvasLayoutProps {
  sidebar: React.ReactNode;
  canvas: React.ReactNode;
  footer: React.ReactNode;
}
```
- Two-column layout (sidebar + main area)
- Manages responsive sizing
- Adjusts for different screen sizes

**IconBank Component**
```typescript
interface IconBankProps {
  icons: IconConfig[];
  selectedIconId: string;
  onSelectIcon: (iconId: string) => void;
  onRotate?: (rotation: Rotation) => void;
}

interface IconBankState {
  scrollPosition: number;
}
```
- Displays available seat icons in 2-column grid
- Organized by seating capacity
- Shows capacity labels and selection highlight

**GuestListPanel Component**
```typescript
interface GuestListPanelProps {
  guests: Guest[];
  selectedGuestId: string | null;
  sortOrder: SortOrder;
  onSelectGuest: (guestId: string) => void;
  onAddGuest: () => void;
  onDeleteGuest: (guestId: string) => void;
  onEditGuest: (guestId: string) => void;
  onSortChange: (sortOrder: SortOrder) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

interface GuestListPanelState {
  editingGuestId: string | null;
  editingName: string;
  scrollPosition: number;
}
```
- Displays guest list in 2-column grid
- Shows color circle with initials
- Supports add, edit, delete, sort, reorder

#### Canvas Components

**GridCanvas Component**
```typescript
interface GridCanvasProps {
  seats: Seat[];
  selectedIconId: string;
  selectedRotation: Rotation;
  selectedGuestId?: string | null;
  assignments?: GuestAssignmentMap;
  guests?: Guest[];
  onSeatAdd: (position: GridPosition, iconId: string, rotation: Rotation) => void;
  onSeatRemove: (positions: GridPosition[]) => void;
  onGuestAssign?: (position: GridPosition, guestId: string) => void;
  iconConfigs: Map<string, IconConfig>;
  gridDimensions: GridDimensions;
  readOnly?: boolean;
}

interface GridCanvasState {
  hoverPosition: GridPosition | null;
  dragState: DragState | null;
  previewType: 'icon' | 'guest' | null;
  previewOpacity: number;
}
```
- Main interactive canvas
- Renders grid, seats, previews
- Handles mouse and keyboard events
- Optional read-only mode for guest arrangement

**GridRenderer Component**
```typescript
interface GridRendererProps {
  gridDimensions: GridDimensions;
  svgRef: React.RefObject<SVGSVGElement>;
}
```
- Renders grid lines
- Uses SVG for crisp rendering
- Light blue subtle appearance

**SeatRenderer Component**
```typescript
interface SeatRendererProps {
  seats: Seat[];
  seatNumbers: Map<string, number>;
  guests?: Guest[];
  assignments?: GuestAssignmentMap;
  gridDimensions: GridDimensions;
  iconConfigs: Map<string, IconConfig>;
}
```
- Renders placed seats
- Displays seat icons with rotation
- Shows seat numbers for all grid squares

**PreviewRenderer Component**
```typescript
interface PreviewRendererProps {
  type: 'icon' | 'guest' | null;
  position: GridPosition | null;
  opacity: number;
  selectedIconId?: string;
  selectedGuest?: Guest;
  gridDimensions: GridDimensions;
  iconConfigs?: Map<string, IconConfig>;
  targetOccupied?: boolean;
}
```
- Renders semi-transparent preview
- Icon preview during seat placement
- Guest preview during assignment

#### Input Components

**TitleInput Component**
```typescript
interface TitleInputProps {
  value: string;
  onChange: (title: string) => void;
  onBlur?: () => void;
  maxLength?: number;
  placeholder?: string;
}

interface TitleInputState {
  error: string | null;
}
```
- Text input for configuration title
- Validates max length
- Shows error inline

**GuestNameInput Component**
```typescript
interface GuestNameInputProps {
  value: string;
  onChange: (name: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

interface GuestNameInputState {
  error: string | null;
}
```
- Text input for guest name
- Inline validation
- Submit/cancel buttons

#### Control Components

**RotationControls Component**
```typescript
interface RotationControlsProps {
  currentRotation: Rotation;
  onRotate: (rotation: Rotation) => void;
}
```
- 4 directional buttons for rotation
- Shows active rotation state
- Supports R key shortcut

**SortButton Component**
```typescript
interface SortButtonProps {
  currentSort: SortOrder;
  onSortChange: (sortOrder: SortOrder) => void;
}
```
- Cycles through sort orders
- Shows current sort order
- Tooltip explaining sort options

**ConfirmationDialog Component**
```typescript
interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
```
- Modal confirmation dialog
- Required before destructive operations
- Clear messaging

#### Display Components

**SeatCountDisplay Component**
```typescript
interface SeatCountDisplayProps {
  count: number;
}
```
- Shows total number of seats
- Updates in real-time

**AssignedCountDisplay Component**
```typescript
interface AssignedCountDisplayProps {
  assigned: number;
  total: number;
}
```
- Shows "X / Y filled" format
- Updates when assignments change

**GuestInitialCircle Component**
```typescript
interface GuestInitialCircleProps {
  guest: Guest;
  size?: 'small' | 'medium' | 'large';
  isSelected?: boolean;
}
```
- Displays colored circle with initials
- Supports selection highlight
- Various sizes

---

## Component Design Details

### SeatCanvas Component

The core interactive canvas for placing and managing seats. Handles mouse events, hover previews, and drag operations.

**Responsibilities**:
- Render grid lines
- Render placed seats
- Render hover preview
- Handle click and drag events
- Display seat numbers

**State Needed**:
- `hoverPosition`: Current mouse position on grid (for preview)
- `dragState`: Tracks active drag (start position, current position)

**Props**:
```typescript
interface SeatCanvasProps {
  seats: Seat[];
  selectedIconId: string;
  selectedRotation: Rotation;
  onSeatAdd: (position: GridPosition, iconId: string, rotation: Rotation) => void;
  onSeatRemove: (positions: GridPosition[]) => void;
  iconConfigs: Map<string, IconConfig>;
  gridDimensions: GridDimensions;
}
```

**Rendering Strategy**:
- Use SVG for grid lines and seat rendering
- SVG provides crisp rendering at any zoom level
- Hover preview rendered as semi-transparent SVG element
- Interaction layer (mouse event handler) overlay on top

### GridRenderer Component

Renders the underlying grid structure. Responsible for grid lines and background.

**Algorithm: RenderGrid**

```
1. For each column from 0 to gridDimensions.cols:
   - Draw vertical line at (col × squareSize, 0) to (col × squareSize, maxHeight)
   - Use light blue color with opacity 0.3

2. For each row from 0 to gridDimensions.rows:
   - Draw horizontal line at (0, row × squareSize) to (maxWidth, row × squareSize)
   - Use light blue color with opacity 0.3

3. Optimize: Use dash pattern or line dash array for subtle appearance
```

### SeatRenderer Component

Renders placed seat icons on the canvas with their numbers.

**Algorithm: RenderSeat**

```
For each seat:
1. Calculate pixel position from grid position
2. Apply rotation transform to SVG icon
3. Scale icon to match icon size (width × height grid squares)
4. Render seat icon at calculated position
5. For multi-grid seats:
   - Calculate all grid squares occupied
   - Render seat number in center of each grid square
6. Render seat number as white text, centered on seat footprint
```

### IconBank Component

Displays available seat icons organized by capacity in a 2-column grid.

**Layout**:
```
[Icon 0] [Icon 1]
[Icon 2] [Icon 3]
[Icon 4] [Icon 5]
...
```

**Rendering**:
```
1. Sort icons by capacity (ascending)
2. Render in 2-column grid layout
3. Each icon cell:
   - Display icon SVG
   - Display capacity label
   - Highlight if selected
4. Scale vertically to fit all icons (scrollable if needed)
```

### GuestListPanel Component

Displays guests in a 2-column grid similar to IconBank.

**Rendering**:
```
1. Add "+" button at top to add guest
2. Apply sort order to guest list
3. For each guest:
   - Render color circle with initials
   - Display guest name
   - Highlight if selected
4. Layout in 2-column grid
5. Support drag-to-reorder
```

### PreviewRenderer Components

**IconPreview**: Shows where icon will be placed on hover

```
1. Get current mouse position
2. Quantize to grid center
3. Calculate all grid squares the icon will occupy
4. Render semi-transparent (50% opacity) icon at quantized position
5. Use light color overlay to indicate preview
```

**GuestPreview**: Shows where guest will be assigned on canvas

```
1. Get current mouse position on canvas
2. Quantize to grid center
3. Get selected guest's color
4. Render semi-transparent circle with guest initials
5. Adjust opacity based on target:
   - 25% opacity over empty grid square
   - 60% opacity over occupied seat (showing replacement)
```

---

## Interaction Handlers

### Mouse Event Handling

**Canvas Click Handler (Left Click)**

```typescript
function handleCanvasClick(event: MouseEvent, gridPosition: GridPosition) {
  // 1. Check if clicking on existing seat
  const seat = findSeatAt(gridPosition, selectedIcon);
  
  // 2. If on Guest Arrangement page and guest selected
  if (currentPage === 'guests' && selectedGuestId) {
    assignGuestToSeat(gridPosition, selectedGuestId);
    autoAdvanceToNextGuest();
    return;
  }
  
  // 3. If on Seat Canvas page
  if (currentPage === 'canvas') {
    const newSeat = createSeat(gridPosition, selectedIconId, selectedRotation);
    addSeat(newSeat);
    updateSeatNumbers();
  }
}
```

**Canvas Drag Handler (Click + Move)**

```typescript
function handleCanvasDrag(startPos: GridPosition, endPos: GridPosition) {
  // 1. Calculate all grid positions in drag path
  const path = calculateDragPath(startPos, endPos);
  
  // 2. If left-click drag (adding)
  if (mouseButton === 'left') {
    const newSeats = path.map(pos => 
      createSeat(pos, selectedIconId, selectedRotation)
    );
    addSeats(newSeats);
    updateSeatNumbers();
  }
  
  // 3. If right-click drag (deleting)
  if (mouseButton === 'right') {
    const seatsToDelete = findSeatsInPath(path);
    deleteSeats(seatsToDelete);
    updateSeatNumbers();
  }
  
  // 4. If on Guest Arrangement and guest selected
  if (currentPage === 'guests' && selectedGuestId) {
    path.forEach(pos => {
      const seatAtPos = findSeatAt(pos, selectedIcon);
      if (seatAtPos) {
        assignGuestToSeat(pos, selectedGuestId);
      }
    });
    autoAdvanceToNextGuest();
  }
}
```

**Right-Click Handler (Delete)**

```typescript
function handleContextMenu(event: MouseEvent) {
  event.preventDefault();
  const gridPosition = pixelToGrid(event.clientX, event.clientY);
  const seat = findSeatAt(gridPosition, /* any icon */);
  
  if (seat) {
    deleteSeat(seat);
    updateSeatNumbers();
  }
}
```

**Hover Handler (Preview)**

```typescript
function handleMouseMove(event: MouseEvent) {
  const gridPosition = pixelToGrid(event.clientX, event.clientY);
  
  // 1. If on Seat Canvas: show icon preview
  if (currentPage === 'canvas') {
    setHoverPosition(gridPosition);
    setPreviewType('icon');
  }
  
  // 2. If on Guest Arrangement and guest selected: show guest preview
  if (currentPage === 'guests' && selectedGuestId) {
    setHoverPosition(gridPosition);
    setPreviewType('guest');
    
    // Adjust opacity based on whether seat is occupied
    const seatExists = findSeatAt(gridPosition, /* any */);
    setPreviewOpacity(seatExists ? 0.6 : 0.25);
  }
}

function handleMouseLeave() {
  setHoverPosition(null);
  setPreviewType(null);
}
```

### Keyboard Event Handling

```typescript
function handleKeyDown(event: KeyboardEvent) {
  // Arrow keys: cycle icons
  if (event.key === 'ArrowRight') {
    selectNextIcon();
  } else if (event.key === 'ArrowLeft') {
    selectPreviousIcon();
  }
  
  // R key: rotate icon
  if (event.key.toLowerCase() === 'r') {
    rotateSelectedIcon();
  }
  
  // Delete key: delete selected guest (with confirmation)
  if (event.key === 'Delete' && currentPage === 'guests' && selectedGuestId) {
    showConfirmationDialog({
      title: 'Delete Guest',
      message: `Remove "${selectedGuest.name}" from the arrangement?`,
      onConfirm: () => deleteGuest(selectedGuestId),
    });
  }
}
```

---

## Icon Configuration Management

### Icon Configuration Service

Centralized management of available seat types, loaded at application startup.

```typescript
interface IconConfigService {
  configs: Map<string, IconConfig>;
  getConfig(iconId: string): IconConfig;
  getAllConfigs(): IconConfig[];
  getConfigsByCapacity(): IconConfig[][];
  getIconSVG(iconId: string): string;
}
```

**Predefined Icon Configurations**:

```typescript
const DEFAULT_ICONS: IconConfig[] = [
  {
    id: 'table-round-4',
    capacity: 0,
    size: { width: 2, height: 2 },
    name: 'Round Table (4-top)',
    color: '#E8B4A2',
    svg: '<circle cx="1" cy="1" r="0.8" fill="currentColor" />'
  },
  {
    id: 'chair-1',
    capacity: 1,
    size: { width: 1, height: 1 },
    name: 'Chair',
    color: '#8B4513',
    svg: '<rect x="0.2" y="0.2" width="0.6" height="0.6" fill="currentColor" />'
  },
  {
    id: 'loveseat-2',
    capacity: 2,
    size: { width: 2, height: 1 },
    name: 'Loveseat',
    color: '#D2691E',
    svg: '<rect x="0.1" y="0.2" width="1.8" height="0.6" fill="currentColor" />'
  },
  {
    id: 'couch-3',
    capacity: 3,
    size: { width: 3, height: 1 },
    name: 'Couch',
    color: '#A0522D',
    svg: '<rect x="0.1" y="0.2" width="2.8" height="0.6" fill="currentColor" />'
  },
  // ... additional icons
];
```

**Icon SVG Format**:
- Icons use normalized coordinates (0-1 range)
- SVG is transformed and scaled to fit grid squares
- Icons support rotation via CSS transforms

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Seat Placement Creates Unoccupied Placement

*For any* valid grid position and selected icon, placing a seat at that position SHALL result in a seat existing at the quantized grid position. The seat SHALL be retrievable by its position.

**Validates: Requirements 7.1, 7.2**

### Property 2: Seat Deletion Removes Seat

*For any* placed seat on the canvas, deleting it SHALL remove that seat from the seat list. A subsequent query for seats at that position SHALL return empty.

**Validates: Requirements 8.1, 8.2, 8.4**

### Property 3: Icon Cycling Wraps Correctly

*For any* icon bank with N icons, pressing the right arrow key N times SHALL result in returning to the originally selected icon. Pressing the left arrow key N times SHALL also return to the original icon.

**Validates: Requirements 9.1, 9.2, 9.3, 9.4**

### Property 4: Rotation State Cycles Through Cardinals

*For any* rotation state, applying rotate operation 4 times SHALL return to the original rotation state. The cycle SHALL always be left → up → right → down → left.

**Validates: Requirements 10.2, 10.3, 10.4**

### Property 5: Icon Size Matches Configuration

*For any* icon with configured capacity C, a placed seat with that icon SHALL occupy a grid footprint matching the configured size (width × height). Multi-grid seats SHALL occupy all their grid squares.

**Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**

### Property 6: Implicit Numbering Is Deterministic

*For any* arrangement of seats at any positions, recalculating seat numbers twice SHALL produce identical numbering. The numbering SHALL always follow left-to-right, top-to-bottom order based on seat position.

**Validates: Requirements 12.1, 12.2, 12.3, 12.4**

### Property 7: Clear All Removes All Seats

*For any* non-empty seat configuration, executing "Clear All" SHALL result in zero seats on the canvas. A subsequent query for all seats SHALL return an empty list.

**Validates: Requirements 14.1, 14.2, 14.3**

### Property 8: Seat Count Equals Number of Seats

*For any* seat configuration, the displayed seat count SHALL equal the actual number of seats in the configuration. This SHALL hold true after add, remove, and clear operations.

**Validates: Requirements 15.1, 15.2, 15.3**

### Property 9: Non-Empty Guest Name Can Be Added

*For any* non-empty, non-whitespace guest name, adding the guest to the list SHALL result in that guest appearing in the guest list with correct initials and deterministic color.

**Validates: Requirements 21.1, 21.2, 21.3, 21.4, 21.5**

### Property 10: Guest Sort Order Is Correct

*For any* guest list and any sort order (alphabetical ascending, alphabetical descending, or original), applying the sort order SHALL reorder the display correctly while preserving seat-to-guest assignments unchanged.

**Validates: Requirements 22.1, 22.2, 22.3, 22.4, 22.5**

### Property 11: Guest Selection Persists

*For any* guest in the list, clicking to select that guest SHALL mark it as selected. The selection SHALL persist until a different guest is clicked or the list is modified.

**Validates: Requirements 23.1, 23.2, 23.3, 23.4**

### Property 12: Guest Deletion Removes From List

*For any* guest in the list, deleting that guest SHALL remove it from the guest list. Any seat assignments for that guest SHALL become unassigned.

**Validates: Requirements 24.1, 24.2, 24.3, 24.4**

### Property 13: Guest Name Editing Updates Identity

*For any* guest with name N1 and generated color C1, editing the name to N2 SHALL update the guest name AND regenerate the color based on N2. The new color SHALL be different if N2 ≠ N1 (with high probability).

**Validates: Requirements 25.1, 25.2, 25.3, 25.4**

### Property 14: Guest Reordering Preserves Assignments

*For any* guest list with seat assignments, reordering guests via drag-to-reorder SHALL change the display order but NOT change which guest is assigned to which seat.

**Validates: Requirements 26.1, 26.2, 26.3, 26.4, 26.5**

### Property 15: Guest Assignment Binds Guest to Seat

*For any* selected guest and any seat, assigning the guest to the seat SHALL result in that seat displaying the guest's initial circle. A query for the seat's assignment SHALL return that guest's ID.

**Validates: Requirements 29.1, 29.2, 29.3, 29.4, 29.5**

### Property 16: Auto-Advance Selects Next Unassigned

*For any* guest list and assignment state, after assigning a guest to a seat, the next unassigned guest (in original order) SHALL be automatically selected. If all guests are assigned, the current guest SHALL remain selected.

**Validates: Requirements 30.1, 30.2, 30.3**

### Property 17: Fill All In Order Maps Correctly

*For any* guest list G and seat list S, executing "Fill all in order" SHALL assign Guest[i] to Seat[i] for all valid i. Excess guests/seats SHALL remain unassigned.

**Validates: Requirements 31.1, 31.2, 31.3, 31.4, 31.5, 31.6**

### Property 18: Randomize Assigns All Possible Guests

*For any* guest list G with |G| guests and seat list S with |S| seats, executing "Randomize" SHALL assign min(|G|, |S|) guests to seats such that each guest is assigned to at most one seat and each seat gets at most one guest.

**Validates: Requirements 32.1, 32.2, 32.3, 32.4, 32.5, 32.6, 32.7**

### Property 19: Assigned Count Reflects Actual Assignments

*For any* assignment state, the displayed count "X / Y filled" SHALL have X equal to the number of assigned guests and Y equal to the total number of seats.

**Validates: Requirements 33.1, 33.2, 33.3, 33.4**

### Property 20: Clear All Assignments Removes All Bindings

*For any* non-empty assignment state, executing "Clear all" on assignments SHALL result in zero guests assigned to seats. All guests SHALL remain in the guest list.

**Validates: Requirements 34.1, 34.2, 34.3, 34.4, 34.5, 34.6**

### Property 21: Grid Coordinates Uniquely Identify Positions

*For any* two distinct grid positions P1 and P2, their coordinates SHALL be distinct. The coordinate system SHALL provide a one-to-one mapping between valid grid positions and coordinate pairs.

**Validates: Requirements 38.1, 38.2, 38.3, 38.4**

### Property 22: Guest Color Generation Is Deterministic

*For any* guest name N, calling the color generation function twice with the same name SHALL produce identical colors. Different names SHALL produce different colors (with high probability).

**Validates: Requirements 40.1, 40.2, 40.3, 40.4**

### Property 23: Keyboard Shortcuts Trigger Correct Actions

*For any* keyboard input (arrow keys, R key, Delete key), the corresponding action SHALL be triggered correctly. Pressing the right arrow SHALL cycle to next icon, pressing R SHALL rotate, pressing Delete on selected guest SHALL prompt deletion.

**Validates: Requirements 41.1, 41.2, 41.3**

### Property 24: Input Validation Rejects Invalid Values

*For any* invalid input (empty guest name, title > 32 chars, whitespace-only names), the validation function SHALL return false/error, and the invalid input SHALL NOT be persisted to state.

**Validates: Requirements 43.1, 43.3, 43.4**

---

## Rendering System

### Grid Rendering with SVG

**Advantages**:
- Vector-based: crisp at any zoom level
- Easy to layer (grid, seats, numbers, previews)
- Easy to apply transforms (rotation, scaling)
- Good browser support

**SVG Layer Structure**:

```xml
<svg class="grid-canvas">
  <!-- Background -->
  <rect class="canvas-bg" width="100%" height="100%" />
  
  <!-- Grid lines -->
  <g class="grid-lines">
    <!-- Vertical and horizontal lines -->
  </g>
  
  <!-- Seats -->
  <g class="seats">
    <!-- Each seat: icon + numbers -->
  </g>
  
  <!-- Preview (icon or guest) -->
  <g class="preview">
    <!-- Semi-transparent preview -->
  </g>
  
  <!-- Interaction overlay (for mouse events) -->
  <rect class="interaction-overlay" width="100%" height="100%" />
</svg>
```

**Performance Optimization**:
- Use CSS transforms for rotation (GPU-accelerated)
- Debounce hover updates (15ms)
- Virtualize rendering for large grids (only render visible areas)
- Use `will-change` CSS property for animated elements

---

## Numbering System Implementation

### SeatNumbering Service

```typescript
class SeatNumberingService {
  calculateNumbers(seats: Seat[]): Map<string, number> {
    // 1. Sort seats by position (row, then column)
    const sorted = seats.sort((a, b) => {
      if (a.position.row !== b.position.row) {
        return a.position.row - b.position.row;
      }
      return a.position.col - b.position.col;
    });
    
    // 2. Assign numbers 1, 2, 3, ...
    const numberMap = new Map<string, number>();
    sorted.forEach((seat, index) => {
      numberMap.set(seat.id, index + 1);
    });
    
    return numberMap;
  }
  
  // For rendering numbers in each grid square of multi-grid seats
  getGridNumberAt(position: GridPosition, seats: Seat[]): number | null {
    const seat = seats.find(s => {
      const icon = this.getIconConfig(s.iconId);
      return this.positionOccupiesSeat(position, s.position, icon.size);
    });
    return seat ? this.seatNumbers.get(seat.id) || null : null;
  }
  
  private positionOccupiesSeat(
    pos: GridPosition,
    seatPos: GridPosition,
    seatSize: GridSize
  ): boolean {
    return (
      pos.col >= seatPos.col && 
      pos.col < seatPos.col + seatSize.width &&
      pos.row >= seatPos.row && 
      pos.row < seatPos.row + seatSize.height
    );
  }
}
```

---

## Color Generation Implementation

### ColorService

```typescript
class ColorService {
  private readonly COLOR_PALETTE = [
    // 12+ distinct HSL values for good distribution
    { h: 0, s: 70, l: 60 },    // Red
    { h: 30, s: 70, l: 60 },   // Orange
    { h: 60, s: 70, l: 60 },   // Yellow
    { h: 120, s: 70, l: 60 },  // Green
    { h: 180, s: 70, l: 60 },  // Cyan
    { h: 210, s: 70, l: 60 },  // Light Blue
    { h: 240, s: 70, l: 60 },  // Blue
    { h: 270, s: 70, l: 60 },  // Purple
    { h: 300, s: 70, l: 60 },  // Magenta
    { h: 330, s: 70, l: 60 },  // Pink
    { h: 45, s: 70, l: 60 },   // Amber
    { h: 150, s: 70, l: 60 },  // Teal
  ];
  
  generateColor(guestName: string): Color {
    // 1. Hash guest name to get index
    const hash = this.hashString(guestName);
    const paletteIndex = hash % this.COLOR_PALETTE.length;
    const hsl = this.COLOR_PALETTE[paletteIndex];
    
    // 2. Convert HSL to RGB
    const rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    
    // 3. Convert RGB to Hex
    const hex = this.rgbToHex(rgb);
    
    // 4. Determine text color for contrast
    const textColor = this.getContrastColor(rgb);
    
    return { hex, rgb, text: textColor };
  }
  
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  
  private hslToRgb(h: number, s: number, l: number) {
    // Standard HSL to RGB conversion algorithm
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return {
      r: Math.round(255 * f(0)),
      g: Math.round(255 * f(8)),
      b: Math.round(255 * f(4)),
    };
  }
  
  private getContrastColor(rgb: { r: number; g: number; b: number }): 'white' | 'black' {
    // WCAG relative luminance calculation
    const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
    return luminance > 128 ? 'black' : 'white';
  }
}
```

---

## Navigation & Routing

### Application Routes

```typescript
const routes = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/seats',
    element: <SeatCanvas />,
  },
  {
    path: '/arrange',
    element: <GuestArrangement />,
  },
];
```

### State Persistence Across Routes

The `ApplicationContext` is placed at the root level and wraps all routes, ensuring state persists when navigating between pages:

```
App
├── AppProvider (manages all global state)
│   ├── Router
│   │   ├── Home (can navigate to /seats)
│   │   ├── SeatCanvas (can navigate to /)  or /arrange)
│   │   └── GuestArrangement (can navigate to /seats)
```

This ensures:
- Seat configuration persists when moving between Seat Canvas and Guest Arrangement
- Guest list persists across all pages
- Selected guest and assignments remain intact during navigation

---

## Utility Functions

### Grid Utilities

```typescript
// Coordinate conversion
function pixelToGrid(px: number, py: number, gridDimensions: GridDimensions): GridPosition
function gridToPixel(pos: GridPosition, gridDimensions: GridDimensions): { x: number; y: number }

// Position utilities
function getGridSquaresOccupied(position: GridPosition, iconSize: GridSize): GridPosition[]
function isPositionValid(position: GridPosition, gridBounds: GridDimensions): boolean
function clampPosition(position: GridPosition, gridBounds: GridDimensions): GridPosition

// Drag path calculation
function calculateDragPath(start: GridPosition, end: GridPosition): GridPosition[]
function bresenhamLine(start: GridPosition, end: GridPosition): GridPosition[]

// Collision detection
function hasCollision(position: GridPosition, iconSize: GridSize, existingSeats: Seat[]): boolean
function findSeatsAt(position: GridPosition, seats: Seat[]): Seat[]
function findSeatsInBounds(bounds: GridBounds, seats: Seat[]): Seat[]
```

### String Utilities

```typescript
// Guest initials
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 2);
}

// Title validation
function validateTitle(title: string): { valid: boolean; error?: string } {
  if (title.length > 32) {
    return { valid: false, error: 'Title must be 32 characters or less' };
  }
  return { valid: true };
}

// Guest name validation
function validateGuestName(name: string): { valid: boolean; error?: string } {
  if (!name.trim()) {
    return { valid: false, error: 'Guest name cannot be empty' };
  }
  return { valid: true };
}
```

---

## Testing Strategy

### Property-Based Testing Applicability Assessment

The Seat Selector feature includes several components suitable for property-based testing (PBT):

**PBT-Suitable Components**:
1. **Implicit Numbering System** - Pure function with universal properties
2. **Color Generation** - Deterministic hash function with universal properties
3. **Grid Coordinate Conversion** - Pure mathematical transformations
4. **Collision Detection** - Pure logic for geometric operations
5. **Guest Assignment Algorithms** - Pure functions for FillAll, Randomize, AutoAdvance

**Non-PBT Components**:
1. **UI Rendering** - Use snapshot and visual regression tests
2. **React Components** - Use example-based unit tests with React Testing Library
3. **Event Handlers** - Use example-based tests with mocked interactions
4. **State Management** - Use example-based tests with Context API mocks
5. **Navigation** - Use example-based tests with react-router mocks

### Property-Based Test Structure

For each testable component, we will implement property-based tests using Vitest + fast-check:

**Test Configuration**:
- Minimum 100 iterations per property
- Seed-based reproducibility for failed tests
- Clear error messages showing failing input

**Test Format**:
```typescript
describe('Feature: Seat Selector, Property N: [Property Description]', () => {
  it('[property test name]', () => {
    fc.assert(
      fc.property(
        /* generators */,
        (generatedInput) => {
          // Test logic
          return result;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Test Strategy

- **Icon Configuration**: Example-based tests for loading and validation
- **Seat Management**: Example-based tests for add/remove operations
- **Guest Management**: Example-based tests for add/edit/delete operations
- **Assignments**: Example-based tests for manual and bulk assignment operations
- **UI Components**: Snapshot and interaction tests with React Testing Library

### Integration Test Strategy

- End-to-end workflow: Create config → Add guests → Assign guests
- Navigation flow: Home → Seats Canvas → Guest Arrangement → Back
- State persistence: Verify configuration survives navigation
- Large dataset handling: Test with 50+ seats and 20+ guests

---

## Implementation Priorities

### Phase 1 (Core Functionality)

1. **Grid System** - Rendering, coordinate conversion, collision detection
2. **Seat Management** - Add, remove, numbering, rotation
3. **Icon Configuration** - Load and manage seat types
4. **Guest Management** - Add, edit, delete, sort
5. **Guest Assignment** - Manual assignment, auto-advance, fill all, randomize
6. **Navigation** - Routes between pages, state persistence

### Phase 2 (Polish & Performance)

1. **Keyboard Shortcuts** - Arrow keys, R for rotate, Delete for guest
2. **Drag Operations** - Multi-seat placement and deletion
3. **Undo/Redo** - State history management
4. **Persistence** - Save/load configurations (backend)
5. **Performance Optimization** - Large grid rendering, memoization

### Phase 3 (Advanced Features)

1. **Zoom/Pan** - Grid scaling and canvas navigation
2. **Templates** - Pre-built seating arrangements
3. **Collaboration** - Real-time sharing (WebSocket)
4. **Export** - PDF, SVG, CSV export options

---

## Technical Stack Justification

- **React 19**: Modern hooks, concurrent rendering, excellent component library support
- **TypeScript**: Type safety, better IDE support, self-documenting code
- **Vite**: Fast development server, optimized builds, ES modules
- **React Context**: Sufficient for this application's state complexity (alternative: Zustand for larger scale)
- **SVG**: Vector rendering for crisp grid and seats at any zoom level
- **Vitest**: Fast unit testing framework with TypeScript support
- **fast-check**: Mature PBT library with excellent integration

---

## Error Handling

### User-Facing Error Scenarios

1. **Invalid Title**: Display inline error, prevent submission
2. **Empty Guest Name**: Show validation message, focus input field
3. **Too Many Seats**: Show warning about grid bounds
4. **Duplicate Guest Names**: Warn but allow (use name + ID for uniqueness)
5. **Operation Failures**: Show user-friendly error modal with retry option

### System-Level Error Handling

1. **State Corruption**: Detect via validation, offer state reset
2. **Rendering Issues**: Fallback to simpler rendering, log error
3. **Configuration Loading**: Display default icons if load fails
4. **Memory Constraints**: Limit grid size, warn user of large configurations

---

## Accessibility Considerations

### WCAG AA Compliance

1. **Color Contrast**: All text meets WCAG AA minimum (4.5:1 for normal text)
2. **Keyboard Navigation**: All features accessible via keyboard
3. **Focus Management**: Visible focus indicators on all interactive elements
4. **Screen Reader Support**: Semantic HTML, ARIA labels where needed
5. **Grid Announcements**: Live region updates for seat count, guest additions

### Implementation Details

- Use semantic HTML (`<button>`, `<input>`, `<label>`)
- ARIA `aria-label` for icon buttons (rotation, clear all, etc.)
- `aria-live="polite"` for dynamic updates (seat count, guest list changes)
- Keyboard focus trap in modals/dialogs
- Clear focus outline visible on all interactive elements

---

## Performance Targets

- **Initial Load**: < 2 seconds
- **Seat Addition**: < 100ms perceived latency (< 50ms actual)
- **Hover Preview Update**: 60 FPS (16.67ms per frame)
- **Grid Render**: SVG render < 33ms for 100 seats
- **Memory Usage**: < 50MB for typical configurations (100 seats, 30 guests)

---

## Next Steps

1. **Prework Analysis**: Analyze acceptance criteria for property-based testing applicability
2. **Correctness Properties**: Define formal properties for PBT-suitable components
3. **Task Decomposition**: Break design into implementable tasks
4. **Implementation**: Develop components following this design specification
