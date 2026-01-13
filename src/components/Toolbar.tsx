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
    getDiagramData,
    loadDiagram,
  } = useDiagramStore();

  const [xLightsNetworksPath, setXLightsNetworksPath] = useState('');
  const [xLightsRgbEffectsPath, setXLightsRgbEffectsPath] = useState('');
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
        { id: 'pA', name: 'Port A', maxPixels: 512, currentPixels: 0 },
        { id: 'pB', name: 'Port B', maxPixels: 512, currentPixels: 0 },
        { id: 'pC', name: 'Port C', maxPixels: 512, currentPixels: 0 },
        { id: 'pD', name: 'Port D', maxPixels: 512, currentPixels: 0 },
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

    let yPosition = 100;
    const xSpacing = 350;
    let xPosition = 100;

    availableControllers.forEach((xlController, index) => {
      // NOTE: Currently creating one "port" per universe from networks XML
      // This is temporary - universes are NOT the same as physical ports!
      // TODO: Once we have rgbeffects data, group universes by actual physical ports
      // For now, showing universes so user can see the data structure
      const ports = xlController.outputs.map((output: any, portIndex: number) => {
        const maxPixels = Math.floor(output.channels / 3); // RGB: 3 channels per pixel
        return {
          id: `u${output.number}`,
          name: `Universe ${output.number}`, // Temporarily showing universes
          maxPixels: maxPixels,
          currentPixels: 0,
          universe: output.number,
        };
      });

      const newController: Controller = {
        id: `controller-${Date.now()}-${index}`,
        name: xlController.name,
        type: xlController.type || 'Unknown',
        ports: ports,
        position: { x: xPosition, y: yPosition },
      };

      addController(newController);

      // Position next controller to the right
      xPosition += xSpacing;
      // Move to next row after 3 controllers
      if ((index + 1) % 3 === 0) {
        xPosition = 100;
        yPosition += 300;
      }
    });

    alert(`Imported ${availableControllers.length} controller(s) to diagram!`);
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
