import { useState } from 'react';
import { useDiagramStore } from '../store/diagramStore';
import { Controller, Receiver, Differential, EthernetSwitch, PowerSupply, Label, WireColor } from '../types/diagram';

interface ToolbarProps {
  selectedWireColor: WireColor;
  onWireColorChange: (color: WireColor) => void;
  autoSnapEnabled: boolean;
  onAutoSnapChange: (enabled: boolean) => void;
}

export const Toolbar = ({ selectedWireColor, onWireColorChange, autoSnapEnabled, onAutoSnapChange }: ToolbarProps) => {
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
  const [selectedControllers, setSelectedControllers] = useState<Set<string>>(new Set());
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
        console.log('Diagram saved successfully!');
      }
    } catch (error) {
      console.error('Error saving diagram:', error);
    }
  };

  const handleLoadDiagram = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/diagram');
      const data = await response.json();
      loadDiagram(data);
      console.log('Diagram loaded successfully!');
    } catch (error) {
      console.error('Error loading diagram:', error);
    }
  };

  const handleConnectXLights = async () => {
    if (!xLightsNetworksPath) {
      console.error('Please enter the path to your xlights_networks.xml file');
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
        console.error('Failed to parse xLights networks file');
        return;
      }

      const controllers = await parseResponse.json();
      console.log('Parsed controllers:', controllers);

      if (controllers.length === 0) {
        console.error('No controllers found in xLights networks file');
        return;
      }

      setAvailableControllers(controllers);

      // Select all controllers by default
      setSelectedControllers(new Set(controllers.map((c: any) => c.name)));

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
        console.log(`Connected to xLights! Found ${controllers.length} controller(s)${portInfoMsg}.`);
      }
    } catch (error) {
      console.error('Error connecting to xLights:', error);
    }
  };

  const toggleControllerSelection = (controllerName: string) => {
    const newSelection = new Set(selectedControllers);
    if (newSelection.has(controllerName)) {
      newSelection.delete(controllerName);
    } else {
      newSelection.add(controllerName);
    }
    setSelectedControllers(newSelection);
  };

  const handleImportControllers = () => {
    if (availableControllers.length === 0) {
      console.error('No controllers available to import');
      return;
    }

    if (selectedControllers.size === 0) {
      console.error('Please select at least one controller to import');
      return;
    }

    if (!controllerPortInfo || !controllerPortInfo.models || controllerPortInfo.models.length === 0) {
      console.error('No model data available from rgbeffects file. Please ensure both xlights_networks.xml and xlights_rgbeffects.xml are loaded.');
      return;
    }

    // Layout configuration for spider web topology
    const centerX = 1500;
    const centerY = 1000;
    const differentialRadius = 400; // Distance from controller to differentials
    const receiverRadius = 1000; // Distance from controller to receivers

    // Filter to only selected controllers
    const controllersToImport = availableControllers.filter(c => selectedControllers.has(c.name));

    controllersToImport.forEach((xlController, ctrlIndex) => {
      const controllerId = `controller-${Date.now()}-${ctrlIndex}`;
      const isHinksPix = xlController.type.toLowerCase().includes('hinkspix');

      // Get models for this controller from rgbeffects data
      const controllerModels = controllerPortInfo.models.filter(
        (m: any) => m.controller === xlController.name
      );

      console.log(`Importing ${xlController.name}: ${controllerModels.length} models found`);
      console.log('Sample model data:', controllerModels.slice(0, 3));

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

        // Group receivers by universe for daisy-chaining
        // Each universe maps to a differential port
        console.log(`\n=== DAISY CHAIN DEBUG ===`);
        console.log(`Total receivers created: ${receiversData.length}`);
        console.log('Receiver names:', receiversData.map((r: any) => r.name));

        const receiversByPort: { [key: number]: any[] } = {};
        receiversData.forEach((receiverData: any, idx: number) => {
          // Use the universe number to determine the differential port
          // Map universe to differential port (1-16, cycling if needed)
          const universe = receiverData.universe || 1;
          const differentialPortNumber = ((universe - 1) % 16) + 1;

          console.log(`  Receiver ${idx} (${receiverData.name}) [Universe ${universe}] → Port ${differentialPortNumber}`);

          if (!receiversByPort[differentialPortNumber]) {
            receiversByPort[differentialPortNumber] = [];
          }
          receiversByPort[differentialPortNumber].push(receiverData);
        });

        console.log('\nReceivers per port:');
        Object.keys(receiversByPort).sort((a, b) => parseInt(a) - parseInt(b)).forEach(port => {
          console.log(`  Port ${port}: ${receiversByPort[parseInt(port)].length} receiver(s)`);
        });
        console.log('======================\n');

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

        console.log(`Imported ${xlController.name} with ${receiversData.length} receiver(s) and ${controllerModels.length} model(s)!`);
      } else {
        // Non-HinksPix controller: simple layout
        console.log(`Imported ${xlController.name}`);
      }
    });
  };

  // Helper function to group models into receivers using xLights port assignments
// Logic: Every 4 consecutive xLights ports = 1 receiver group
// If a group has SmartRemote 2 models, create an additional daisy-chained receiver
const createReceiversFromModels = (models: any[]) => {
  if (models.length === 0) return [];

  // Filter out models without valid start channels
  const validModels = models.filter(m => m.startChannel !== null && m.startChannel > 0);

  if (validModels.length === 0) {
    console.warn('No models with valid start channels found');
    return [];
  }

  console.log(`\n=== RECEIVER GROUPING (4 Ports Per Receiver) ===`);
  console.log(`Total models: ${validModels.length}`);

  // Group models by xLights port number
  const modelsByPort: { [port: number]: any[] } = {};
  validModels.forEach(model => {
    if (model.port !== null && model.port !== undefined) {
      if (!modelsByPort[model.port]) {
        modelsByPort[model.port] = [];
      }
      modelsByPort[model.port].push(model);
    }
  });

  const usedPorts = Object.keys(modelsByPort).map(p => parseInt(p)).sort((a, b) => a - b);
  const maxPort = Math.max(...usedPorts);

  console.log(`xLights ports in use: ${usedPorts.length} (from port ${usedPorts[0]} to ${maxPort})`);

  // Group ports into receiver groups (every 4 ports = 1 group)
  // Ports 1-4 = Group 1, Ports 5-8 = Group 2, etc.
  const receiverGroupCount = Math.ceil(maxPort / 4);

  console.log(`\nGrouping into ${receiverGroupCount} receiver groups (4 ports each):\n`);

  const receivers: any[] = [];
  const maxPixelsPerPort = 1024;

  for (let groupIdx = 0; groupIdx < receiverGroupCount; groupIdx++) {
    const groupStartPort = groupIdx * 4 + 1;
    const groupEndPort = groupStartPort + 3;

    // Check which ports in this group have models
    const portsInGroup = [];
    let hasSmartRemote1 = false;
    let hasSmartRemote2 = false;

    for (let port = groupStartPort; port <= groupEndPort; port++) {
      if (modelsByPort[port]) {
        portsInGroup.push(port);

        // Check SmartRemote values
        modelsByPort[port].forEach(model => {
          if (model.smartRemote === 1) hasSmartRemote1 = true;
          if (model.smartRemote === 2) hasSmartRemote2 = true;
        });
      }
    }

    // Skip groups with no models
    if (portsInGroup.length === 0) continue;

    console.log(`Group ${groupIdx + 1} (Ports ${groupStartPort}-${groupEndPort}): ${portsInGroup.length} ports used`);
    console.log(`  SmartRemote 1: ${hasSmartRemote1 ? 'Yes' : 'No'}, SmartRemote 2: ${hasSmartRemote2 ? 'Yes' : 'No'}`);

    // Create receivers for this group
    const smartRemotes = [];
    if (hasSmartRemote1) smartRemotes.push(1);
    if (hasSmartRemote2) smartRemotes.push(2);

    smartRemotes.forEach(smartRemote => {
      const receiverNumber = receivers.length + 1;

      // Get first model for universe calculation
      let firstModel = null;
      for (let port = groupStartPort; port <= groupEndPort && !firstModel; port++) {
        if (modelsByPort[port]) {
          const modelsInPort = modelsByPort[port].filter(m => m.smartRemote === smartRemote);
          if (modelsInPort.length > 0) {
            firstModel = modelsInPort[0];
          }
        }
      }

      const universe = firstModel ? Math.floor((firstModel.startChannel - 1) / 510) + 1 : 1;

      const receiver: any = {
        name: `Receiver ${receiverNumber}`,
        dipSwitch: String(receivers.length).padStart(4, '0'),
        universe: universe,
        xlPortStart: groupStartPort,
        xlPortEnd: groupEndPort,
        smartRemote: smartRemote,
        ports: [
          { id: `p1-${receiverNumber}`, name: 'Port 1', maxPixels: maxPixelsPerPort, currentPixels: 0, models: [], xlPort: groupStartPort },
          { id: `p2-${receiverNumber}`, name: 'Port 2', maxPixels: maxPixelsPerPort, currentPixels: 0, models: [], xlPort: groupStartPort + 1 },
          { id: `p3-${receiverNumber}`, name: 'Port 3', maxPixels: maxPixelsPerPort, currentPixels: 0, models: [], xlPort: groupStartPort + 2 },
          { id: `p4-${receiverNumber}`, name: 'Port 4', maxPixels: maxPixelsPerPort, currentPixels: 0, models: [], xlPort: groupStartPort + 3 },
        ],
      };

      // Distribute models into the 4 ports based on their xLights port number
      for (let portIdx = 0; portIdx < 4; portIdx++) {
        const xlPort = groupStartPort + portIdx;
        const receiverPort = receiver.ports[portIdx];

        if (modelsByPort[xlPort]) {
          const modelsForThisReceiver = modelsByPort[xlPort]
            .filter(m => m.smartRemote === smartRemote)
            .sort((a, b) => a.startChannel - b.startChannel);

          modelsForThisReceiver.forEach(model => {
            receiverPort.models.push({
              name: model.name,
              pixels: model.pixelCount || 0,
            });
            receiverPort.currentPixels += model.pixelCount || 0;
          });
        }
      }

      console.log(`  → Receiver ${receiverNumber} (SmartRemote ${smartRemote}):`);
      receiver.ports.forEach((port: any, pIdx: number) => {
        if (port.models.length > 0) {
          const utilization = ((port.currentPixels / maxPixelsPerPort) * 100).toFixed(1);
          console.log(`      Port ${pIdx + 1} (xL Port ${port.xlPort}): ${port.models.length} models, ${port.currentPixels}px (${utilization}% full)`);
        }
      });

      receivers.push(receiver);
    });

    console.log(`  Created ${smartRemotes.length} receiver(s) for this group\n`);
  }

  console.log(`\nTotal receivers created: ${receivers.length}`);
  console.log('======================\n');

  return receivers;
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
      <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>xWire Toolbar</h3>

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
          Model Settings
        </h4>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '11px',
            cursor: 'pointer',
            padding: '4px 0',
          }}
        >
          <input
            type="checkbox"
            checked={autoSnapEnabled}
            onChange={(e) => onAutoSnapChange(e.target.checked)}
            style={{ marginRight: '6px', cursor: 'pointer' }}
          />
          Auto-snap models when dragging
        </label>
        <div style={{ fontSize: '9px', marginTop: '2px', color: '#666', paddingLeft: '20px' }}>
          Automatically align models in same port
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
          {isConnected && availableControllers.length > 0 && (
            <>
              <div style={{
                marginTop: '8px',
                marginBottom: '4px',
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#333',
              }}>
                Select Controllers to Import:
              </div>
              <div style={{
                maxHeight: '150px',
                overflowY: 'auto',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '6px',
                background: '#fafafa',
              }}>
                {availableControllers.map((controller) => (
                  <label
                    key={controller.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px 0',
                      fontSize: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedControllers.has(controller.name)}
                      onChange={() => toggleControllerSelection(controller.name)}
                      style={{ marginRight: '6px', cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: selectedControllers.has(controller.name) ? 'bold' : 'normal' }}>
                      {controller.name} ({controller.type})
                    </span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleImportControllers}
                style={{
                  ...buttonStyle,
                  background: selectedControllers.size > 0 ? '#48BB78' : '#ccc',
                  color: 'white',
                  fontWeight: 'bold',
                  marginTop: '8px',
                  cursor: selectedControllers.size > 0 ? 'pointer' : 'not-allowed',
                }}
                disabled={selectedControllers.size === 0}
              >
                Import {selectedControllers.size} Controller(s)
              </button>
            </>
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
