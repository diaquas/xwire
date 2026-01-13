import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Controller } from '../../types/diagram';

interface ControllerNodeData {
  controller: Controller;
}

export const ControllerNode = memo(({ data }: NodeProps<ControllerNodeData>) => {
  const { controller } = data;

  return (
    <div
      style={{
        padding: '10px',
        border: '2px solid #4A90E2',
        borderRadius: '8px',
        background: '#E8F4FD',
        minWidth: '200px',
      }}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />

      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#2C5282' }}>
        {controller.name}
      </div>
      <div style={{ fontSize: '12px', color: '#4A5568', marginBottom: '8px' }}>
        {controller.type}
      </div>

      {controller.ports.length > 0 && (
        <div style={{ fontSize: '11px' }}>
          {controller.ports.map((port) => (
            <div
              key={port.id}
              style={{
                padding: '4px',
                margin: '2px 0',
                background: 'white',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>{port.name}:</span>
              <span style={{ fontWeight: 'bold' }}>
                {port.currentPixels}/{port.maxPixels}px
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

ControllerNode.displayName = 'ControllerNode';
