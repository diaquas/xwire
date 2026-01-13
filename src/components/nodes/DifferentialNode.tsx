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
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="target" position={Position.Top} />

      <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#553C9A' }}>
        {differential.name}
      </div>
      <div style={{ fontSize: '10px', color: '#6B46C1', marginBottom: '8px' }}>
        Differential (Long Range)
      </div>

      {differential.ports.length > 0 && (
        <div style={{ fontSize: '10px' }}>
          {differential.ports.map((port, idx) => {
            // Calculate position for each port handle (evenly spaced)
            const portPosition = ((idx + 1) / (differential.ports.length + 1)) * 100;

            return (
              <div key={port.id}>
                {/* Individual handle for this specific port */}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={port.id}
                  style={{
                    top: `${portPosition}%`,
                    background: '#805AD5',
                    width: '12px',
                    height: '12px',
                    border: '2px solid #553C9A',
                  }}
                />

                {/* Port display */}
                <div
                  style={{
                    padding: '4px 6px',
                    margin: '4px 0',
                    background: 'white',
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '10px',
                    border: '1px solid #D6BCFA',
                  }}
                >
                  <span style={{ fontWeight: 'bold', color: '#553C9A' }}>🔌 {port.name}</span>
                  <span style={{ color: '#3182CE', fontSize: '8px' }}>CAT5</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

DifferentialNode.displayName = 'DifferentialNode';
