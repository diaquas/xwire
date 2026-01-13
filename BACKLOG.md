# xDiagram Development Backlog

## 🔴 Critical Issues (Blocking Basic Functionality)

### Issue #1: xLights XML Parser Not Working
**Status:** 🔴 In Progress
**Priority:** Critical
**Description:** Parser doesn't recognize the xLights XML format with `<Networks><Controller>` and lowercase `<network>` elements.

**Current Behavior:**
- Shows "No controllers found in xLights network file"
- Debug logs not appearing in backend console
- File watcher detecting changes but parser failing

**Expected Behavior:**
- Parse controllers from XML structure: `<Networks><Controller><network>`
- Extract controller name, vendor, model
- Extract port/universe information from `<network>` elements
- Use `BaudRate` attribute as universe/port number
- Use `MaxChannels` attribute for channel count

**Files Involved:**
- `src/server/xlights-parser.ts`

**Test Data:**
- User's XML has format: `<Networks><Controller Id="30" Name="Megatree" Vendor="HolidayCoro" Model="AlphaPix 16"><network BaudRate="200" MaxChannels="510"/></Controller></Networks>`

---

### Issue #2: Node Properties Not Editable
**Status:** 🔴 To Do
**Priority:** High
**Description:** No way to edit controller names, port counts, DIP switches, etc. after creating nodes.

**Current Behavior:**
- All nodes show default values ("New Controller", "F16V4", etc.)
- No UI to modify node properties
- Can only delete and recreate

**Expected Behavior:**
- Double-click node to open property editor
- Edit controller name, type, ports
- Edit receiver name, DIP switch, ports
- Edit power supply voltage, amperage
- Edit label text

**Implementation Ideas:**
- Create `PropertyPanel.tsx` component
- Add `onNodeDoubleClick` handler to DiagramCanvas
- Show modal or sidebar with editable form
- Update store when properties change

---

### Issue #3: Wire Color Selection Not Working
**Status:** 🔴 To Do
**Priority:** Medium
**Description:** Wire color selector in toolbar doesn't affect newly created wires - all wires are black.

**Current Behavior:**
- Can select red/black/blue in toolbar
- Creating wires always makes them black
- Selected color not passed to wire creation logic

**Expected Behavior:**
- Selected color in toolbar affects new wire connections
- Red = Power, Black = Data, Blue = Network
- Wire color persists when saved/loaded

**Files Involved:**
- `src/components/Toolbar.tsx`
- `src/components/DiagramCanvas.tsx`

**Implementation:**
- Pass `selectedWireColor` from Toolbar to DiagramCanvas
- Use context or lift state to App.tsx
- Update `onConnect` to use selected color

---

## 🟡 High Priority Features

### Issue #4: Import Controllers from xLights
**Status:** 🟡 To Do
**Priority:** High
**Description:** Once parser works, add UI to import controllers from xLights file into diagram.

**Expected Behavior:**
- After connecting to xLights file, show "Import Controllers" button
- Select which controllers to import
- Automatically create controller nodes with proper:
  - Name (from XML)
  - Type (Vendor + Model)
  - Ports (from `<network>` elements with universe numbers)
  - Max pixels (calculated from MaxChannels ÷ 3)
- Position nodes automatically or allow manual placement

---

### Issue #5: Node Deletion
**Status:** 🟡 To Do
**Priority:** High
**Description:** Need ability to delete nodes from diagram.

**Expected Behavior:**
- Press Delete key when node selected
- Or right-click → Delete
- Or button in property panel
- Remove node and all connected wires
- Confirm before deleting

**Implementation:**
- Add keyboard event handler
- Call store's `removeController`, `removeReceiver`, etc.
- Wire removal handled automatically by store

---

### Issue #6: DIP Switch Configuration UI
**Status:** 🟡 To Do
**Priority:** High
**Description:** Need better UI for setting receiver DIP switches (essential feature per Miro screenshot).

**Expected Behavior:**
- Visual DIP switch toggles in receiver property editor
- 4 or 8 switches depending on receiver type
- Show as binary (0001, 0010, etc.)
- Display on receiver node prominently

**UI Ideas:**
- Toggle switches that look like actual DIP switches
- Click to flip each switch
- Show resulting binary code
- Maybe show decimal equivalent

---

## 🟢 Medium Priority Enhancements

### Issue #7: Better Visual Design
**Status:** 🟢 To Do
**Priority:** Medium
**Description:** Make nodes look more like the Miro screenshot - more compact, better layout.

**Improvements Needed:**
- Controllers: Show ports in grid instead of list
- Receivers: Highlight DIP switch setting
- Power supplies: Larger text for voltage/amperage
- Use icons or better visual indicators
- Match Miro color scheme more closely

---

### Issue #8: Port Pixel Tracking
**Status:** 🟢 To Do
**Priority:** Medium
**Description:** Track current pixel usage per port and warn when approaching max.

**Expected Behavior:**
- Each port shows "current/max" pixels
- Calculate current from connected models/props
- Highlight in yellow when >80% capacity
- Highlight in red when over capacity
- Update automatically when connections change

---

### Issue #9: Save/Load Improvements
**Status:** 🟢 To Do
**Priority:** Medium
**Description:** Current save/load requires backend API call - add local storage option.

**Improvements:**
- Auto-save to browser localStorage
- Export to JSON file (download)
- Import from JSON file
- Multiple saved diagrams (named saves)
- Backup/restore functionality

---

## 🔵 Nice-to-Have Features

### Issue #10: Multi-Page Diagrams
**Status:** 🔵 To Do
**Priority:** Low
**Description:** Support for multiple pages/tabs (e.g., "Front Yard", "Roof", "Backyard").

---

### Issue #11: Export to Image
**Status:** 🔵 To Do
**Priority:** Low
**Description:** Export diagram as PNG or PDF for printing/sharing.

---

### Issue #12: Wire Length Calculations
**Status:** 🔵 To Do
**Priority:** Low
**Description:** Calculate wire lengths based on node positions and generate shopping list.

---

### Issue #13: Bill of Materials
**Status:** 🔵 To Do
**Priority:** Low
**Description:** Auto-generate BOM from diagram (controllers, receivers, power supplies, wire lengths).

---

### Issue #14: Collaboration Features
**Status:** 🔵 To Do
**Priority:** Low
**Description:** Real-time collaboration, comments, version history.

---

## 🐛 Known Bugs

### Bug #1: Nodes Overlap on Creation
**Status:** 🐛 To Do
**Description:** All new nodes created at same position (100, 100) causing overlap.

**Fix:** Randomize or increment position for each new node.

---

### Bug #2: Backend Debug Logs Not Showing
**Status:** 🐛 To Do
**Description:** Console.log statements in xlights-parser.ts not appearing in terminal.

**Possible Causes:**
- tsx watch not recompiling properly
- Caching issue
- TypeScript compilation error silently failing

**Investigation Needed:** Check if TypeScript is compiling, check for errors in backend terminal.

---

## ✅ Completed

### ✓ Basic Diagram Canvas
Drag-and-drop canvas with React Flow - **DONE**

### ✓ Add Nodes via Toolbar
Buttons to add controllers, receivers, power supplies, labels - **DONE**

### ✓ Node Rendering
Custom node components with basic styling - **DONE**

### ✓ Store Synchronization
Zustand store syncing with React Flow canvas - **DONE**

---

## Next Steps

**Recommended Priority Order:**

1. **Fix Issue #1** - Get xLights parser working (critical for main feature)
2. **Fix Issue #3** - Wire color selection (quick fix, important for usability)
3. **Implement Issue #2** - Property editing (needed before import)
4. **Implement Issue #4** - Import from xLights (main value proposition)
5. **Fix Bug #1** - Node positioning (UX improvement)
6. **Implement Issue #5** - Node deletion (basic functionality)
7. Continue with medium/low priority items

---

**Last Updated:** 2026-01-13
