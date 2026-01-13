import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Differential } from '../../types/diagram';
import { useDiagramStore } from '../../store/diagramStore';

interface DifferentialNodeData {
  differential: Differential;
}

export const DifferentialNode = memo(({ data }: NodeProps<DifferentialNodeData>) => {
  const { differential } = data;
  const { differentialPorts, receivers } = useDiagramStore();

  // Get the 4 DifferentialPort nodes for this board
  const boardPorts = differential.differentialPorts
    .map(id => differentialPorts.find(dp => dp.id === id))
    .filter(Boolean)
    .sort((a, b) => (a?.portNumber || 0) - (b?.portNumber || 0));

  return (
    <div
      style={{
        padding: '12px',
        border: '2px solid #805AD5',
        borderRadius: '8px',
        background: '#E9D8FD',
        width: '280px',
        minHeight: '180px',
        position: 'relative',
      }}
    >
      {/* Input connection from controller (top center) */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '-12px',
          transform: 'translateX(-50%)',
          width: '20px',
          height: '20px',
          border: '2px solid #805AD5',
          background: '#3182CE',
          borderRadius: '2px',
        }}
      >
        <Handle type="target" position={Position.Top} id="diff-board-input" style={{ opacity: 0 }} />
      </div>

      {/* Output connection (bottom center) */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '-12px',
          transform: 'translateX(-50%)',
          width: '20px',
          height: '20px',
          border: '2px solid #805AD5',
          background: 'white',
          borderRadius: '2px',
        }}
      >
        <Handle type="source" position={Position.Bottom} id="diff-board-output" style={{ opacity: 0 }} />
      </div>

      {/* Board title */}
      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#553C9A', fontSize: '14px', textAlign: 'center' }}>
        {differential.name}
      </div>

      {/* 4 Differential Ports */}
      <div style={{ fontSize: '11px', color: '#553C9A' }}>
        {boardPorts.map((port) => {
          if (!port) return null;

          // Calculate total pixels across all receivers on this port
          let totalPixels = 0;
          port.connectedReceivers.forEach(receiverId => {
            const receiver = receivers.find(r => r.id === receiverId);
            if (receiver) {
              receiver.ports.forEach(p => {
                totalPixels += p.currentPixels;
              });
            }
          });

          const totalMaxPixels = port.sharedPorts.reduce((sum, p) => sum + p.maxPixels, 0);
          const utilization = totalMaxPixels > 0 ? ((totalPixels / totalMaxPixels) * 100).toFixed(0) : '0';

          return (
            <div
              key={port.id}
              style={{
                padding: '4px 8px',
                margin: '4px 0',
                background: 'white',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid #D6BCFA',
              }}
            >
              <span style={{ fontWeight: 'bold', color: '#553C9A' }}>Port {port.portNumber}</span>
              <span style={{ fontSize: '10px', color: '#6B46C1' }}>
                {port.connectedReceivers.length} Rx • {utilization}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

DifferentialNode.displayName = 'DifferentialNode';
