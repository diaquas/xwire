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
        minWidth: '220px',
        maxWidth: '300px',
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
            fontSize: '12px',
            color: 'white',
            marginBottom: '8px',
            background: '#2F855A',
            padding: '4px 8px',
            borderRadius: '4px',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          DIP Switch: {receiver.dipSwitch}
        </div>
      )}

      {receiver.ports.length > 0 && (
        <div style={{ fontSize: '10px' }}>
          {receiver.ports.map((port) => {
            const remainingPixels = port.maxPixels - port.currentPixels;
            const percentUsed = port.maxPixels > 0 ? (port.currentPixels / port.maxPixels) * 100 : 0;
            const isOverBudget = percentUsed > 100;
            const isNearLimit = percentUsed > 80 && percentUsed <= 100;

            return (
              <div
                key={port.id}
                style={{
                  padding: '4px',
                  margin: '3px 0',
                  background: 'white',
                  borderRadius: '4px',
                  border: isOverBudget ? '2px solid #E53E3E' : isNearLimit ? '2px solid #DD6B20' : '1px solid #E2E8F0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontWeight: 'bold' }}>
                  <span>{port.name}</span>
                  <span style={{ color: isOverBudget ? '#E53E3E' : isNearLimit ? '#DD6B20' : '#2F855A' }}>
                    {port.currentPixels}/{port.maxPixels}px
                  </span>
                </div>
                {port.models && port.models.length > 0 && (
                  <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>
                    {port.models.map((model, idx) => (
                      <div key={idx} style={{ paddingLeft: '4px', borderLeft: '2px solid #CBD5E0', marginBottom: '1px' }}>
                        • {model.name} ({model.pixels}px)
                      </div>
                    ))}
                  </div>
                )}
                {remainingPixels >= 0 && (
                  <div style={{ fontSize: '9px', color: '#718096', marginTop: '2px', fontStyle: 'italic' }}>
                    {remainingPixels}px available
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

ReceiverNode.displayName = 'ReceiverNode';
