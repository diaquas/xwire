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
        minHeight: '200px', // Taller to fit receiver port breakdown
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

      {/* Board title - positioned at top */}
      <div style={{
        fontWeight: 'bold',
        color: '#553C9A',
        fontSize: '16px',
        textAlign: 'center',
        marginBottom: '8px',
      }}>
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
          // AND breakdown by receiver port number
          let totalPixels = 0;
          const portBreakdown: { [portNum: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0 };

          port.connectedReceivers.forEach(receiverId => {
            const receiver = receivers.find(r => r.id === receiverId);
            if (receiver) {
              receiver.ports.forEach(p => {
                totalPixels += p.currentPixels;
                if (p.portNumber >= 1 && p.portNumber <= 4) {
                  portBreakdown[p.portNumber] += p.currentPixels;
                }
              });
            }
          });

          const totalMaxPixels = port.sharedPorts.reduce((sum, p) => sum + p.maxPixels, 0);
          const perPortMax = 1024; // Each receiver port has 1024 max
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
                gap: '4px',
              }}
            >
              {/* Metadata above square */}
              <div style={{ textAlign: 'center', minWidth: '100px' }}>
                {/* Port number */}
                <div style={{ fontWeight: 'bold', color: '#553C9A', fontSize: '12px', marginBottom: '2px' }}>
                  Port {port.portNumber}
                </div>

                {/* Total pixel count */}
                <div style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: isOverCapacity ? '#C53030' : '#38A169',
                  marginBottom: '2px'
                }}>
                  {totalPixels}/{totalMaxPixels}
                </div>

                {/* Receiver count and utilization */}
                <div style={{ fontSize: '10px', color: '#6B46C1', marginBottom: '4px' }}>
                  {port.connectedReceivers.length} Rx • {utilization}%
                </div>

                {/* Receiver port breakdown - only show if there are receivers */}
                {hasReceivers && (
                  <div style={{
                    fontSize: '9px',
                    color: '#4A5568',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1px 8px',
                    background: '#F7FAFC',
                    borderRadius: '3px',
                    padding: '3px 4px',
                    border: '1px solid #E2E8F0',
                  }}>
                    {[1, 2, 3, 4].map(pNum => {
                      const pixels = portBreakdown[pNum];
                      const isPortOver = pixels > perPortMax;
                      return (
                        <div
                          key={pNum}
                          style={{
                            color: isPortOver ? '#C53030' : '#4A5568',
                            fontWeight: isPortOver ? 'bold' : 'normal',
                          }}
                        >
                          P{pNum}: {pixels}
                        </div>
                      );
                    })}
                  </div>
                )}
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
