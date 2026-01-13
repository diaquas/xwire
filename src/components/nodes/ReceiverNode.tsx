import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Receiver } from '../../types/diagram';

interface ReceiverNodeData {
  receiver: Receiver;
}

export const ReceiverNode = memo(({ data }: NodeProps<ReceiverNodeData>) => {
  const { receiver } = data;

  return (
    <div
      style={{
        padding: '10px',
        border: '2px solid #48BB78',
        borderRadius: '8px',
        background: '#C6F6D5',
        minWidth: '180px',
      }}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />

      <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#22543D' }}>
        {receiver.name}
      </div>

      {receiver.dipSwitch && (
        <div
          style={{
            fontSize: '11px',
            color: '#2F855A',
            marginBottom: '8px',
            fontStyle: 'italic',
          }}
        >
          DIP: {receiver.dipSwitch}
        </div>
      )}

      {receiver.ports.length > 0 && (
        <div style={{ fontSize: '11px' }}>
          {receiver.ports.map((port) => (
            <div
              key={port.id}
              style={{
                padding: '3px',
                margin: '2px 0',
                background: 'white',
                borderRadius: '3px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>{port.name}:</span>
              <span>{port.currentPixels || 0}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

ReceiverNode.displayName = 'ReceiverNode';
