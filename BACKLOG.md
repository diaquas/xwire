# xDiagram Development Backlog

## 🔴 Critical Issues (Blocking Basic Functionality)

### Issue #1: xLights XML Parser Not Working
**Status:** ✅ COMPLETED (2026-01-13)
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
**Status:** ✅ COMPLETED (2026-01-13)
**Priority:** Medium
**Description:** Wire color selector in toolbar doesn't affect newly created wires - all wires are black.

**Solution Implemented:**
- Lifted `selectedWireColor` state to App.tsx
- Passed as props to both Toolbar and DiagramCanvas
- Updated `onConnect` to use selected wire color
- Now red/black/blue selection works correctly

---

## 🟡 High Priority Features

### Issue #4: Import Controllers from xLights
**Status:** ✅ COMPLETED (2026-01-13)
**Priority:** High
**Description:** Once parser works, add UI to import controllers from xLights file into diagram.

**Solution Implemented:**
- After connecting to xLights, green "Import X Controller(s)" button appears
- Automatically creates controller nodes with:
  - Name from XML (e.g., "Megatree", "Main", "AC Lights")
  - Type from Vendor + Model
  - Ports from `<network>` elements with universe numbers
  - Max pixels calculated from MaxChannels ÷ 3
- Positions nodes in 3-column grid layout automatically

---

### Issue #5: Node Deletion (GitHub Issue #3)
**Status:** ✅ COMPLETED (2026-01-13)
**Priority:** High
**Description:** Need ability to delete nodes from diagram.

**Solution Implemented:**
- Press Delete key when node selected to remove it
- Implemented onNodesDelete callback in DiagramCanvas
- Implemented onEdgesDelete callback for wire deletion
- Remove node and all connected wires automatically
- Supports deletion of all component types: controllers, receivers, differentials, ethernet switches, power supplies, labels, and wires
- No confirmation dialog (can be added later if needed)

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
**Status:** ✅ COMPLETED (2026-01-13)
**Priority:** Medium
**Description:** Track current pixel usage per port and warn when approaching max.

**Solution Implemented:**
- Receiver ports now show current/max pixel usage with color-coded warnings
- Red border when over budget (>100%)
- Orange border when near limit (>80%)
- Shows individual models under each port with pixel counts
- Displays available pixels remaining on each port

---

### GitHub Issue #16: Receiver Renaming with Hierarchy
**Status:** ✅ COMPLETED (2026-01-13)
**Priority:** High
**Description:** Enable users to edit and save custom names for receivers while retaining hierarchical identifier.

**Solution Implemented:**
- Added `customName` field to Receiver type for user-editable names
- Double-click on receiver name to edit inline
- Enter to save, Escape to cancel
- Displays customName if set, otherwise shows default generated name
- Added hierarchy subtitle showing "Differential > DIP Switch" path
- Changed port labels from A,B,C,D to 1,2,3,4 for more intuitive numbering
- Added `differentialConnection` field to track which differential connects to receiver
- Hierarchy helps identify connection topology at a glance

---

### Issue #16 (Backlog): Configurable Differential Port Count
**Status:** 🟢 To Do
**Priority:** Medium
**Description:** Allow users to configure how many differential ports their controller setup has.

**Current Behavior:**
- HinksPix differential count is hardcoded to 16 (4 boards × 4 ports)
- Works for this specific setup but not configurable

**Expected Behavior:**
- Add "Differential Count" field to controller properties
- Allow users to specify number of differential expansion boards
- Calculate total differential ports (boards × 4)
- Or allow direct entry of total differential port count
- Store this value in controller configuration
- Display correctly on HinksPix controller node

**Use Cases:**
- User has 4 differential boards = 16 differential ports (current setup)
- Different user might have 2 boards = 8 ports
- Another might have 5 boards = 20 ports
- Standalone differential controllers with different port counts

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

### Issue #17: Drag-and-Drop Model Management
**Status:** 🟢 To Do
**Priority:** High
**Description:** Enable drag-and-drop functionality for models to dynamically manage port assignments and pixel budgets.

**Current Behavior:**
- Models are displayed as text within receiver ports
- Models are statically assigned during import
- No ability to move models between ports
- No real-time budget updates when reorganizing

**Expected Behavior:**
- Models appear as separate draggable nodes/objects on canvas
- Drag models from one port to another
- Automatically update pixel budgets as models are moved
- Visual feedback when dragging (highlight target port, show if over budget)
- When dropping on port, models "stack" (pushed up/down to make room)
- Ability to reorder models within a port (drag up/down)
- Real-time calculation shows budget impact before releasing drag
- Undo/redo support for model moves

**Architecture Requirements:**
- Each model becomes its own React Flow node
- Models visually grouped/positioned near their assigned port
- Port nodes separate from receiver node (already implemented)
- Differential ports have individual handles (already implemented)
- Receiver ports have individual handles (already implemented)
- Wire connections from differential port → receiver port → model

**Use Cases:**
- Planning pixel layout before physical installation
- Experimenting with different model arrangements
- Balancing pixel load across ports
- Quickly reorganizing when adding/removing models
- Visual "what-if" scenarios for layout changes

**Implementation Phases:**
1. Phase 1: Create ModelNode component (draggable node type)
2. Phase 2: Add drop zones on receiver ports
3. Phase 3: Implement drag-and-drop with budget calculations
4. Phase 4: Add model stacking/reordering within ports
5. Phase 5: Add undo/redo and visual feedback

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

### Issue #15: Ethernet Cable Porting and Underground Runs
**Status:** 🔵 To Do
**Priority:** Low
**Description:** Track physical ethernet cable runs from house to yard for "day of install" visual mapping.

**Expected Behavior:**
- Add ethernet cable objects to represent physical runs
- Track conduit/underground paths
- Show cable entry/exit points (house → controllers → receivers)
- Label cables with length and routing notes
- Distinguish between: house network → switch → controllers, and controller → differential → receivers
- Color-code by cable type (Cat5e, Cat6, outdoor-rated, etc.)
- Help plan physical installation logistics

**Use Case:**
Creating a physical installation map showing:
- Where ethernet enters/exits buildings
- Underground conduit routes
- Cable lengths needed for shopping
- Installation sequence planning

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

### ✓ Issue #1: xLights XML Parser Working
Parser now correctly handles `<Networks><Controller><network>` format - **DONE** (2026-01-13)

### ✓ Issue #3: Wire Color Selection
Wire colors (red/black/blue) now work correctly - **DONE** (2026-01-13)

### ✓ Issue #4: Import Controllers from xLights
Auto-import controllers with proper names, types, and ports - **DONE** (2026-01-13)

### ✓ Issue #5: Node Deletion (GitHub Issue #3)
Delete key removes selected nodes and connected wires - **DONE** (2026-01-13)

### ✓ Issue #8: Port Pixel Tracking
Receiver ports show pixel budgets with color-coded warnings - **DONE** (2026-01-13)

### ✓ GitHub Issue #16: Receiver Renaming with Hierarchy
Double-click to rename receivers with hierarchy subtitle - **DONE** (2026-01-13)

---

## Next Steps

**Recommended Priority Order:**

1. ✅ ~~**Fix Issue #1** - Get xLights parser working~~ **COMPLETED**
2. ✅ ~~**Fix Issue #3** - Wire color selection~~ **COMPLETED**
3. ✅ ~~**Implement Issue #4** - Import from xLights~~ **COMPLETED**
4. ✅ ~~**Implement Issue #5** - Node deletion (basic functionality)~~ **COMPLETED**
5. **Implement Issue #2** - Property editing (needed for editing imported controllers)
6. **Fix Bug #1** - Node positioning (UX improvement)
7. **Implement Issue #6** - DIP switch UI (important for receivers)
8. Continue with medium/low priority items

---

**Last Updated:** 2026-01-13

## Summary of Today's Progress (2026-01-13)

✅ **Major accomplishments:**
1. Fixed xLights XML parser to handle lowercase `<network>` elements
2. Implemented wire color selection (red/black/blue)
3. Implemented automatic controller import from xLights with proper names, types, and port configurations
4. Fixed Issue #7: Improved HinksPix visualization with proper differential architecture
   - HinksPix shows "16 Differential Outputs" instead of 171 universe ports
   - Added Differential and Ethernet Switch components
   - Hardcoded differential count with backlog item for future configurability
5. Implemented Issue #8: Port pixel tracking with budget warnings
   - Receiver ports show current/max pixel usage (red/orange/green color coding)
   - Shows individual models per port with pixel counts
   - Displays available pixels remaining
6. Implemented automatic model import with spider web topology
   - Controller in center, differentials in circle, receivers in outer circle
   - Models automatically assigned to receiver ports with stacking support
   - Blue wires connecting everything (Ribbon, CAT5)
   - Updated receiver port budget from 512 to 1024 pixels (HinksPix v3)
7. Implemented Issue #5 (GitHub Issue #3): Component deletion
   - Delete key removes selected nodes
   - Automatic cleanup of connected wires
   - Works for all component types
8. Implemented GitHub Issue #16: Receiver renaming with hierarchy
   - Changed port labels from A,B,C,D to 1,2,3,4 for better usability
   - Added double-click to rename receivers inline
   - Displays hierarchy subtitle showing "Differential > DIP Switch" path
   - Added customName field for user-editable names
   - Links receivers to their connected differentials for topology tracking

🎯 **Next recommended tasks:**
- Issue #2: Property editing for nodes (controllers, other components)
- Issue #6: DIP switch configuration UI
- Bug #1: Node positioning improvements
