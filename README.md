# xWire - xLights Wiring Diagram Tool

A visual wiring diagram tool that integrates with xLights to help plan and document your Christmas light show wiring. Create interactive diagrams with controllers, receivers, power supplies, and color-coded wires.

## Features

- **Drag-and-Drop Interface**: Miro-like canvas for easy diagram creation
- **xLights Integration**: Auto-updates from xLights controller XML files
- **Color-Coded Wires**:
  - Red = Power
  - Black = Data
  - Blue = Network
- **Controller Management**:
  - Track max pixels per port
  - Monitor current pixel usage
  - Display controller types and configurations
- **Receiver Tracking**:
  - Multiple receivers per controller
  - DIP switch settings display
  - Port assignments
- **Power Supply Tracking**: Voltage and amperage specifications
- **Auto-Update**: File watcher monitors xLights XML changes
- **Save/Load**: Persist your diagram layouts

## Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

This will start:
- Frontend on http://localhost:3000
- Backend API on http://localhost:3001

## Usage

### 1. Create Your Diagram

Use the toolbar to add components:
- **Controllers**: Main light controllers (F16V4, etc.)
- **Receivers**: Differential receivers with DIP switches
- **Power Supplies**: Power distribution units
- **Labels**: Text annotations
- **Dividers**: Section separators

### 2. Connect Components with Wires

- Click and drag from any node's connection point (handle) to another
- Wires are automatically created
- Select wire color before connecting:
  - Red for power connections
  - Black for data connections
  - Blue for network connections

### 3. Connect to xLights

1. In xLights, export your controller configuration
2. Locate the `xlights_networks.xml` file (usually in your show directory)
3. In xWire toolbar, enter the path to this file
4. Click "Connect to xLights"
5. xWire will now auto-update when you change configurations in xLights

### 4. Save Your Work

- Click "Save" to persist your diagram
- Click "Load" to restore a saved diagram
- Diagram data is stored in `diagram-data.json`

## xLights Integration

xWire parses your xLights network configuration to extract:

- Controller names and types
- Output ports and their configurations
- Maximum pixels per port (calculated from channels)
- Protocol information
- Start channels

When you modify your xLights setup, xWire automatically detects changes and can update the diagram with new controller information.

## Project Structure

```
xwire/
├── src/
│   ├── components/
│   │   ├── nodes/           # Custom node components
│   │   ├── DiagramCanvas.tsx
│   │   └── Toolbar.tsx
│   ├── server/
│   │   ├── index.ts         # Express server
│   │   ├── xlights-parser.ts
│   │   └── file-watcher.ts
│   ├── store/
│   │   └── diagramStore.ts  # Zustand state management
│   ├── types/
│   │   └── diagram.ts       # TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── README.md
```

## Key Components

### Controller Node
Displays:
- Controller name and type
- Multiple ports with pixel counts
- Current usage vs. max capacity

### Receiver Node
Displays:
- Receiver name
- DIP switch setting
- Port assignments (A, B, C, etc.)
- Pixel counts per port

### Power Supply Node
Displays:
- Power supply name
- Voltage and amperage ratings

## Development

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only the frontend
- `npm run dev:backend` - Start only the backend
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Diagram**: React Flow
- **State Management**: Zustand
- **Backend**: Node.js + Express
- **XML Parsing**: xml2js
- **File Watching**: Chokidar

## Tips for Planning Your Wiring

1. **Start with Power**: Add power supplies first and use red wires
2. **Add Controllers**: Place your main controllers strategically
3. **Connect Receivers**: Add receivers and set their DIP switches
4. **Track Pixels**: Monitor max pixels per port to avoid overloading
5. **Use Dividers**: Separate sections (e.g., "Front Yard", "Sidewalk", "Roof")
6. **Color Code**: Stick to the wire color convention for clarity

## Future Enhancements

- [ ] Export diagrams as PNG/PDF
- [ ] More accurate component shapes (to scale)
- [ ] Automatic layout suggestions
- [ ] Wire length calculations
- [ ] Bill of materials generation
- [ ] Multi-page diagrams
- [ ] Collaboration features

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT
