import { useState } from 'react';
import { useDiagramStore } from '../store/diagramStore';
import { Controller, Receiver, Differential, EthernetSwitch, PowerSupply, Label, WireColor } from '../types/diagram';

interface ToolbarProps {
  selectedWireColor: WireColor;
  onWireColorChange: (color: WireColor) => void;
}

export const Toolbar = ({ selectedWireColor, onWireColorChange }: ToolbarProps) => {
  const {
    addController,
    addReceiver,
    addDifferential,
    addEthernetSwitch,
    addPowerSupply,
    addLabel,
    addWire,
    getDiagramData,
    loadDiagram,
  } = useDiagramStore();

  const [xLightsNetworksPath, setXLightsNetworksPath] = useState('C:\\Holiday Lighting\\2026\\Test Layout\\xlights_networks.xml');
  const [xLightsRgbEffectsPath, setXLightsRgbEffectsPath] = useState('C:\\Holiday Lighting\\2026\\Test Layout\\xlights_rgbeffects.xml');
  const [isConnected, setIsConnected] = useState(false);
  const [availableControllers, setAvailableControllers] = useState<any[]>([]);
  const [controllerPortInfo, setControllerPortInfo] = useState<any>(null);

  const handleAddController = () => {
    const newController: Controller = {
      id: `controller-${Date.now()}`,
      name: 'New Controller',
      type: 'F16V4',
      ports: [
        { id: 'p1', name: 'Port 1', maxPixels: 1024, currentPixels: 0 },
        { id: 'p2', name: 'Port 2', maxPixels: 1024, currentPixels: 0 },
        { id: 'p3', name: 'Port 3', maxPixels: 1024, currentPixels: 0 },
        { id: 'p4', name: 'Port 4', maxPixels: 1024, currentPixels: 0 },
      ],
      position: { x: 100, y: 100 },
    };
    addController(newController);
  };

  const handleAddReceiver = () => {
    const newReceiver: Receiver = {
      id: `receiver-${Date.now()}`,
      name: 'New Receiver',
      dipSwitch: '0000',
      ports: [
        { id: 'p1', name: 'Port 1', maxPixels: 1024, currentPixels: 0 },
        { id: 'p2', name: 'Port 2', maxPixels: 1024, currentPixels: 0 },
        { id: 'p3', name: 'Port 3', maxPixels: 1024, currentPixels: 0 },
        { id: 'p4', name: 'Port 4', maxPixels: 1024, currentPixels: 0 },
      ],
      position: { x: 100, y: 300 },
    };
    addReceiver(newReceiver);
  };

  const handleAddDifferential = () => {
    const newDifferential: Differential = {
      id: `differential-${Date.now()}`,
      name: 'Differential',
      ports: [
        { id: 'e1', name: 'E1', maxPixels: 0, currentPixels: 0 },
        { id: 'e2', name: 'E2', maxPixels: 0, currentPixels: 0 },
        { id: 'e3', name: 'E3', maxPixels: 0, currentPixels: 0 },
        { id: 'e4', name: 'E4', maxPixels: 0, currentPixels: 0 },
      ],
      position: { x: 400, y: 100 },
    };
    addDifferential(newDifferential);
  };

  const handleAddEthernetSwitch = () => {
    const newSwitch: EthernetSwitch = {
      id: `switch-${Date.now()}`,
      name: 'Ethernet Switch',
      portCount: 8,
      position: { x: 100, y: 500 },
    };
    addEthernetSwitch(newSwitch);
  };

  const handleAddPowerSupply = () => {
    const newPowerSupply: PowerSupply = {
      id: `psu-${Date.now()}`,
      name: 'Power Supply',
      voltage: 5,
      amperage: 30,
      position: { x: 100, y: 50 },
    };
    addPowerSupply(newPowerSupply);
  };

  const handleAddLabel = () => {
    const newLabel: Label = {
      id: `label-${Date.now()}`,
      text: 'New Label',
      position: { x: 100, y: 500 },
      style: 'default',
    };
    addLabel(newLabel);
  };

  const handleAddDivider = () => {
    const newLabel: Label = {
      id: `divider-${Date.now()}`,
      text: 'Section',
      position: { x: 100, y: 500 },
      style: 'divider',
      width: 600,
    };
    addLabel(newLabel);
  };

  const handleSaveDiagram = async () => {
    const data = getDiagramData();
    try {
      const response = await fetch('http://localhost:3001/api/diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        alert('Diagram saved successfully!');
      }
    } catch (error) {
      console.error('Error saving diagram:', error);
      alert('Failed to save diagram');
    }
  };

  const handleLoadDiagram = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/diagram');
      const data = await response.json();
      loadDiagram(data);
      alert('Diagram loaded successfully!');
    } catch (error) {
      console.error('Error loading diagram:', error);
      alert('Failed to load diagram');
    }
  };

  const handleConnectXLights = async () => {
    if (!xLightsNetworksPath) {
      alert('Please enter the path to your xlights_networks.xml file');
      return;
    }

    try {
      // Parse networks file to get controller universe definitions
      const parseResponse = await fetch('http://localhost:3001/api/xlights/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: xLightsNetworksPath }),
      });

      if (!parseResponse.ok) {
        alert('Failed to parse xLights networks file');
        return;
      }

      const controllers = await parseResponse.json();
      console.log('Parsed controllers:', controllers);

      if (controllers.length === 0) {
        alert('No controllers found in xLights networks file');
        return;
      }

      setAvailableControllers(controllers);

      // If rgbeffects file path provided, parse it too for port mapping
      let portInfo = null;
      if (xLightsRgbEffectsPath) {
        try {
          const rgbResponse = await fetch('http://localhost:3001/api/xlights/parse-rgbeffects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath: xLightsRgbEffectsPath }),
          });

          if (rgbResponse.ok) {
            portInfo = await rgbResponse.json();
            setControllerPortInfo(portInfo);
            console.log('Parsed port info:', portInfo);
          }
        } catch (error) {
          console.error('Error parsing rgbeffects:', error);
          // Continue anyway with just networks data
        }
      }

      setIsConnected(true);

      // Watch for changes
      const watchResponse = await fetch('http://localhost:3001/api/xlights/watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: xLightsNetworksPath }),
      });

      if (watchResponse.ok) {
        const portInfoMsg = portInfo ? ` with port mapping from ${Object.keys(portInfo.controllers).length} controller(s)` : '';
        alert(`Connected to xLights! Found ${controllers.length} controller(s)${portInfoMsg}.`);
      }
    } catch (error) {
      console.error('Error connecting to xLights:', error);
      alert('Failed to connect to xLights');
    }
  };

  const handleImportControllers = () => {
    if (availableControllers.length === 0) {
      alert('No controllers available to import');
      return;
    }

    if (!controllerPortInfo || !controllerPortInfo.models || controllerPortInfo.models.length === 0) {
      alert('No model data available from rgbeffects file. Please ensure both xlights_networks.xml and xlights_rgbeffects.xml are loaded.');
      return;
    }

    // Layout configuration for spider web topology
    const centerX = 1500;
    const centerY = 1000;
    const differentialRadius = 400; // Distance from controller to differentials
    const receiverRadius = 1000; // Distance from controller to receivers

    availableControllers.forEach((xlController, ctrlIndex) => {
      const controllerId = `controller-${Date.now()}-${ctrlIndex}`;
      const isHinksPix = xlController.type.toLowerCase().includes('hinkspix');

      // Get models for this controller from rgbeffects data
      const controllerModels = controllerPortInfo.models.filter(
        (m: any) => m.controller === xlController.name
      );

      console.log(`Importing ${xlController.name}: ${controllerModels.length} models found`);

      // Create controller node (HinksPix has no physical pixel ports)
      const ports = isHinksPix ? [] : xlController.outputs.map((output: any) => {
        const maxPixels = Math.floor(output.channels / 3);
        return {
          id: `u${output.number}`,
          name: `Universe ${output.number}`,
          maxPixels: maxPixels,
          currentPixels: 0,
          universe: output.number,
        };
      });

      const controller: Controller = {
        id: controllerId,
        name: xlController.name,
        type: xlController.type || 'Unknown',
        ports: ports,
        position: { x: centerX, y: centerY },
      };

      addController(controller);

      if (isHinksPix && controllerModels.length > 0) {
        // HinksPix setup: Create differentials and receivers with models
        const differentialCount = 4; // 4 differential boards

        // Group models by universe to create logical receiver groups
        // Each receiver handles 4 ports (A, B, C, D), each port can have multiple models
        const receiversData = createReceiversFromModels(controllerModels);

        // Create differential boards in a circle around the controller
        const differentials: any[] = [];
        for (let i = 0; i < differentialCount; i++) {
          const angle = (i / differentialCount) * 2 * Math.PI;
          const diffX = centerX + differentialRadius * Math.cos(angle);
          const diffY = centerY + differentialRadius * Math.sin(angle);

          const diffId = `differential-${Date.now()}-${i}`;
          const differential: Differential = {
            id: diffId,
            name: `Differential ${i + 1}`,
            controllerConnection: controllerId,
            ports: [
              { id: `e1-${i}`, name: 'E1', maxPixels: 0, currentPixels: 0 },
              { id: `e2-${i}`, name: 'E2', maxPixels: 0, currentPixels: 0 },
              { id: `e3-${i}`, name: 'E3', maxPixels: 0, currentPixels: 0 },
              { id: `e4-${i}`, name: 'E4', maxPixels: 0, currentPixels: 0 },
            ],
            position: { x: diffX, y: diffY },
          };

          addDifferential(differential);
          differentials.push(differential);

          // Create blue wire from controller to differential
          addWire({
            id: `wire-ctrl-diff-${Date.now()}-${i}`,
            color: 'blue',
            from: { nodeId: controllerId },
            to: { nodeId: diffId },
            label: 'Ribbon',
          });
        }

        // Group receivers by differential port for daisy-chaining
        const receiversByPort: { [key: number]: any[] } = {};
        receiversData.forEach((receiverData: any, idx: number) => {
          // Calculate differential port number (1-16, cycling through 16 ports)
          const differentialPortNumber = (idx % 16) + 1;

          if (!receiversByPort[differentialPortNumber]) {
            receiversByPort[differentialPortNumber] = [];
          }
          receiversByPort[differentialPortNumber].push(receiverData);
        });

        // Process each differential port's daisy chain
        Object.keys(receiversByPort).forEach((portNumStr) => {
          const differentialPortNumber = parseInt(portNumStr, 10);
          const receiversInChain = receiversByPort[differentialPortNumber];

          // Determine which differential and port
          const diffIndex = Math.floor((differentialPortNumber - 1) / 4);
          const portIndex = (differentialPortNumber - 1) % 4;
          const differential = differentials[diffIndex];
          const diffPortId = differential.ports[portIndex].id;

          // Calculate base position for this daisy chain (spread around circle)
          const chainAngle = ((differentialPortNumber - 1) / 16) * 2 * Math.PI;
          const baseX = centerX + receiverRadius * Math.cos(chainAngle);
          const baseY = centerY + receiverRadius * Math.sin(chainAngle);

          // Track receiver IDs in this chain for wiring
          const chainReceiverIds: string[] = [];

          // Position receivers in a line radiating outward from the differential port
          receiversInChain.forEach((receiverData: any, chainIdx: number) => {
            const receiverNumber = chainIdx; // 0, 1, 2, ... in the daisy chain

            // Offset each subsequent receiver further out in the chain (increased spacing for ports)
            const chainOffset = chainIdx * 350; // 350px spacing for receiver + ports
            const recX = baseX + chainOffset * Math.cos(chainAngle);
            const recY = baseY + chainOffset * Math.sin(chainAngle);

            const timestamp = Date.now();
            const receiverId = `receiver-${timestamp}-${differentialPortNumber}-${chainIdx}`;
            chainReceiverIds.push(receiverId);

            const receiver: Receiver = {
              id: receiverId,
              name: receiverData.name,
              dipSwitch: String(receiverNumber).padStart(4, '0'), // "0000", "0001", "0002", etc.
              differentialPortNumber: differentialPortNumber,
              ports: receiverData.ports,
              position: { x: recX, y: recY },
              controllerConnection: controllerId,
              differentialConnection: differential.id,
            };

            addReceiver(receiver);

            // Port nodes are automatically created by DiagramCanvas based on receiver.ports

            if (chainIdx === 0) {
              // First receiver in chain: connect from differential port
              addWire({
                id: `wire-diff-rec-${timestamp}-${differentialPortNumber}-${chainIdx}`,
                color: 'blue',
                from: { nodeId: differential.id, portId: diffPortId },
                to: { nodeId: receiverId, portId: 'receiver-input' },
                label: 'CAT5',
              });
            } else {
              // Subsequent receivers: connect from previous receiver in chain
              const prevReceiverId = chainReceiverIds[chainIdx - 1];
              // Use output-1 for first daisy chain output
              addWire({
                id: `wire-chain-${timestamp}-${differentialPortNumber}-${chainIdx}`,
                color: 'blue',
                from: { nodeId: prevReceiverId, portId: 'receiver-output-1' },
                to: { nodeId: receiverId, portId: 'receiver-input' },
                label: `Daisy ${receiverNumber}`,
              });
            }
          });
        });

        alert(`Imported ${xlController.name} with ${receiversData.length} receiver(s) and ${controllerModels.length} model(s)!`);
      } else {
        // Non-HinksPix controller: simple layout
        alert(`Imported ${xlController.name}`);
      }
    });
  };

  // Helper function to group models into receivers
  const createReceiversFromModels = (models: any[]) => {
    if (models.length === 0) return [];

    // Sort models by start channel
    const sortedModels = [...models].sort((a, b) => a.startChannel - b.startChannel);

    // Group models into receivers (every ~4 universe range = 1 receiver with 4 ports)
    // Each port can handle 1024 pixels (HinksPix v3)
    const receivers: any[] = [];
    const portsPerReceiver = 4;
    const maxPixelsPerPort = 1024;

    // Create a receiver for each logical grouping of models
    // We'll distribute models across ports based on their pixel counts
    let currentReceiver: any = null;
    let currentPortIndex = 0;
    let receiverIndex = 0;

    const startNewReceiver = () => {
      receiverIndex++;
      currentPortIndex = 0;
      currentReceiver = {
        name: `Receiver ${receiverIndex}`,
        dipSwitch: String(receiverIndex - 1).padStart(4, '0'),
        ports: [
          { id: `p1-${receiverIndex}`, name: 'Port 1', maxPixels: maxPixelsPerPort, currentPixels: 0, models: [] },
          { id: `p2-${receiverIndex}`, name: 'Port 2', maxPixels: maxPixelsPerPort, currentPixels: 0, models: [] },
          { id: `p3-${receiverIndex}`, name: 'Port 3', maxPixels: maxPixelsPerPort, currentPixels: 0, models: [] },
          { id: `p4-${receiverIndex}`, name: 'Port 4', maxPixels: maxPixelsPerPort, currentPixels: 0, models: [] },
        ],
      };
      receivers.push(currentReceiver);
    };

    startNewReceiver();

    // Distribute models across receiver ports
    for (const model of sortedModels) {
      const pixelCount = model.pixelCount || 0;

      if (!currentReceiver) {
        startNewReceiver();
      }

      // Try to add model to current port
      let placed = false;
      for (let attempts = 0; attempts < portsPerReceiver && !placed; attempts++) {
        const port = currentReceiver.ports[currentPortIndex];
        const remainingSpace = port.maxPixels - port.currentPixels;

        if (pixelCount <= remainingSpace) {
          // Model fits on current port
          port.models.push({
            name: model.name,
            pixels: pixelCount,
          });
          port.currentPixels += pixelCount;
          placed = true;
        } else {
          // Move to next port
          currentPortIndex++;
          if (currentPortIndex >= portsPerReceiver) {
            // Start a new receiver
            startNewReceiver();
          }
        }
      }

      if (!placed) {
        // Model doesn't fit anywhere, create new receiver
        startNewReceiver();
        const port = currentReceiver.ports[0];
        port.models.push({
          name: model.name,
          pixels: pixelCount,
        });
        port.currentPixels += pixelCount;
        currentPortIndex = 0;
      }
    }

    // Filter out receivers with no models
    return receivers.filter(r => r.ports.some((p: any) => p.models.length > 0));
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1000,
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '300px',
      }}
    >
      <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>xDiagram Toolbar</h3>

      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ fontSize: '12px', margin: '0 0 5px 0', color: '#666' }}>
          Add Components
        </h4>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          <button onClick={handleAddController} style={buttonStyle}>
            + Controller
          </button>
          <button onClick={handleAddReceiver} style={buttonStyle}>
            + Receiver
          </button>
          <button onClick={handleAddDifferential} style={buttonStyle}>
            + Differential
          </button>
          <button onClick={handleAddEthernetSwitch} style={buttonStyle}>
            + Ethernet Switch
          </button>
          <button onClick={handleAddPowerSupply} style={buttonStyle}>
            + Power Supply
          </button>
          <button onClick={handleAddLabel} style={buttonStyle}>
            + Label
          </button>
          <button onClick={handleAddDivider} style={buttonStyle}>
            + Divider
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ fontSize: '12px', margin: '0 0 5px 0', color: '#666' }}>
          Wire Color
        </h4>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={() => onWireColorChange('red')}
            style={{
              ...colorButtonStyle,
              background: '#E53E3E',
              border: selectedWireColor === 'red' ? '3px solid #000' : '1px solid #ccc',
            }}
            title="Power"
          />
          <button
            onClick={() => onWireColorChange('black')}
            style={{
              ...colorButtonStyle,
              background: '#2D3748',
              border: selectedWireColor === 'black' ? '3px solid #000' : '1px solid #ccc',
            }}
            title="Data"
          />
          <button
            onClick={() => onWireColorChange('blue')}
            style={{
              ...colorButtonStyle,
              background: '#3182CE',
              border: selectedWireColor === 'blue' ? '3px solid #000' : '1px solid #ccc',
            }}
            title="Network"
          />
        </div>
        <div style={{ fontSize: '10px', marginTop: '5px', color: '#666' }}>
          Red=Power, Black=Data, Blue=Network
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ fontSize: '12px', margin: '0 0 5px 0', color: '#666' }}>
          xLights Integration
        </h4>
        <div style={{ fontSize: '10px', marginBottom: '5px', color: '#666' }}>
          Networks XML (required):
        </div>
        <input
          type="text"
          value={xLightsNetworksPath}
          onChange={(e) => setXLightsNetworksPath(e.target.value)}
          placeholder="C:\Users\...\xlights_networks.xml"
          style={{
            width: '100%',
            padding: '5px',
            fontSize: '10px',
            marginBottom: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
        <div style={{ fontSize: '10px', marginBottom: '5px', color: '#666' }}>
          RGB Effects XML (optional, for port mapping):
        </div>
        <input
          type="text"
          value={xLightsRgbEffectsPath}
          onChange={(e) => setXLightsRgbEffectsPath(e.target.value)}
          placeholder="C:\Users\...\xlights_rgbeffects.xml"
          style={{
            width: '100%',
            padding: '5px',
            fontSize: '10px',
            marginBottom: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
        <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
          <button onClick={handleConnectXLights} style={buttonStyle}>
            Connect to xLights
          </button>
          {isConnected && (
            <button
              onClick={handleImportControllers}
              style={{
                ...buttonStyle,
                background: '#48BB78',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              Import {availableControllers.length} Controller(s)
            </button>
          )}
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '12px', margin: '0 0 5px 0', color: '#666' }}>
          Save/Load
        </h4>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button onClick={handleSaveDiagram} style={buttonStyle}>
            Save
          </button>
          <button onClick={handleLoadDiagram} style={buttonStyle}>
            Load
          </button>
        </div>
      </div>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: '11px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  background: '#f7f7f7',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const colorButtonStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'all 0.2s',
};
