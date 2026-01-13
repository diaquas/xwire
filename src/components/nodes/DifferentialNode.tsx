import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Differential } from '../../types/diagram';

interface DifferentialNodeData {
  differential: Differential;
}

export const DifferentialNode = memo(({ data }: NodeProps<DifferentialNodeData>) => {
  const { differential } = data;

  return (
    <div
      style={{
        padding: '10px',
        border: '2px solid #805AD5',
        borderRadius: '8px',
        background: '#F3E8FF',
        minWidth: '180px',
      }}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />

      <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#553C9A' }}>
        {differential.name}
      </div>
      <div style={{ fontSize: '10px', color: '#6B46C1', marginBottom: '8px' }}>
        Differential (Long Range)
      </div>

      {differential.ports.length > 0 && (
        <div style={{ fontSize: '10px' }}>
          {differential.ports.map((port) => (
            <div
              key={port.id}
              style={{
                padding: '3px 5px',
                margin: '2px 0',
                background: 'white',
                borderRadius: '3px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '9px',
              }}
            >
              <span>🔌 {port.name}</span>
              <span style={{ color: '#3182CE' }}>Ethernet</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

DifferentialNode.displayName = 'DifferentialNode';
