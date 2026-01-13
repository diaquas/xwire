import { useState } from 'react';
import { useDiagramStore } from '../store/diagramStore';
import { Controller, Receiver, PowerSupply, Label, WireColor } from '../types/diagram';

export const Toolbar = () => {
  const {
    addController,
    addReceiver,
    addPowerSupply,
    addLabel,
    getDiagramData,
    loadDiagram,
  } = useDiagramStore();

  const [xLightsPath, setXLightsPath] = useState('');
  const [selectedWireColor, setSelectedWireColor] = useState<WireColor>('black');

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
      ],
      position: { x: 100, y: 300 },
    };
    addReceiver(newReceiver);
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
    if (!xLightsPath) {
      alert('Please enter the path to your xLights network XML file');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/xlights/watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: xLightsPath }),
      });

      if (response.ok) {
        alert('Connected to xLights! Changes will auto-update.');
      } else {
        alert('Failed to connect to xLights file');
      }
    } catch (error) {
      console.error('Error connecting to xLights:', error);
      alert('Failed to connect to xLights');
    }
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
            onClick={() => setSelectedWireColor('red')}
            style={{
              ...colorButtonStyle,
              background: '#E53E3E',
              border: selectedWireColor === 'red' ? '3px solid #000' : '1px solid #ccc',
            }}
            title="Power"
          />
          <button
            onClick={() => setSelectedWireColor('black')}
            style={{
              ...colorButtonStyle,
              background: '#2D3748',
              border: selectedWireColor === 'black' ? '3px solid #000' : '1px solid #ccc',
            }}
            title="Data"
          />
          <button
            onClick={() => setSelectedWireColor('blue')}
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
        <input
          type="text"
          value={xLightsPath}
          onChange={(e) => setXLightsPath(e.target.value)}
          placeholder="/path/to/xlights_networks.xml"
          style={{
            width: '100%',
            padding: '5px',
            fontSize: '11px',
            marginBottom: '5px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
        <button onClick={handleConnectXLights} style={buttonStyle}>
          Connect to xLights
        </button>
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
