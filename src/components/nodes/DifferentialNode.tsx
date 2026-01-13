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
        padding: '16px',
        paddingBottom: '50px', // Extra space for connection squares at bottom
        border: '2px solid #805AD5',
        borderRadius: '8px',
        background: '#E9D8FD',
        width: '520px', // Wide layout
        minHeight: '120px',
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

      {/* Board title */}
      <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#553C9A', fontSize: '16px', textAlign: 'center' }}>
        {differential.name}
      </div>

      {/* 4 Differential Ports - horizontal layout with metadata above squares */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '24px',
      }}>
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
          const isOverCapacity = totalPixels > totalMaxPixels;
          const hasReceivers = port.connectedReceivers.length > 0;

          // Calculate port position within board (1-4)
          const portWithinBoard = ((port.portNumber - 1) % 4) + 1;
          const portHandleId = `port-${portWithinBoard}`;

          return (
            <div
              key={port.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {/* Metadata above square */}
              <div style={{ textAlign: 'center', minWidth: '90px' }}>
                {/* Port number */}
                <div style={{ fontWeight: 'bold', color: '#553C9A', fontSize: '11px', marginBottom: '2px' }}>
                  Port {port.portNumber}
                </div>

                {/* Pixel count */}
                <div style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: isOverCapacity ? '#C53030' : '#38A169',
                  marginBottom: '1px'
                }}>
                  {totalPixels}/{totalMaxPixels}
                </div>

                {/* Receiver count and utilization */}
                <div style={{ fontSize: '10px', color: '#6B46C1' }}>
                  {port.connectedReceivers.length} Rx • {utilization}%
                </div>
              </div>

              {/* Connection square - blue if connected, white if empty */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  border: `2px solid ${isOverCapacity ? '#FC8181' : '#805AD5'}`,
                  background: hasReceivers ? '#3182CE' : 'white',
                  borderRadius: '3px',
                  position: 'relative',
                }}
              >
                {/* Individual handle for this port */}
                <Handle
                  type="source"
                  position={Position.Bottom}
                  id={portHandleId}
                  style={{
                    opacity: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bottom: '-4px',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

DifferentialNode.displayName = 'DifferentialNode';
