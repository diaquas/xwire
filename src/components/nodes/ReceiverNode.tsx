import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Receiver } from '../../types/diagram';
import { useDiagramStore } from '../../store/diagramStore';

interface ReceiverNodeData {
  receiver: Receiver;
}

export const ReceiverNode = memo(({ data }: NodeProps<ReceiverNodeData>) => {
  const { receiver } = data;
  const { updateReceiver, differentials } = useDiagramStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(receiver.customName || '');

  // Parse receiver number from dipSwitch (e.g., "0000" -> 0, "0001" -> 1)
  const receiverNumber = parseInt(receiver.dipSwitch, 10) || 0;

  // Build hierarchy subtitle: "Differential Port X > Receiver Y"
  const hierarchyText = receiver.differentialPortNumber
    ? `Differential Port ${receiver.differentialPortNumber} > Receiver ${receiverNumber}`
    : `Receiver ${receiverNumber}`;

  const displayName = receiver.customName || receiver.name;

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(receiver.customName || '');
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (editValue.trim() !== '') {
      updateReceiver(receiver.id, { customName: editValue.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <div
      style={{
        padding: '10px',
        border: '2px solid #48BB78',
        borderRadius: '8px',
        background: '#C6F6D5',
        minWidth: '380px',
        maxWidth: '500px',
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Left} id="receiver-input" />
      <Handle type="target" position={Position.Top} id="receiver-input-top" />

      {/* Receiver name - editable on double-click */}
      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            width: '100%',
            fontWeight: 'bold',
            marginBottom: '4px',
            color: '#22543D',
            border: '2px solid #48BB78',
            borderRadius: '4px',
            padding: '2px 4px',
            fontSize: '14px',
          }}
        />
      ) : (
        <div
          style={{
            fontWeight: 'bold',
            marginBottom: '2px',
            color: '#22543D',
            cursor: 'pointer',
            fontSize: '14px',
          }}
          onDoubleClick={handleDoubleClick}
          title="Double-click to rename"
        >
          {displayName}
        </div>
      )}

      {/* Hierarchy subtitle */}
      <div
        style={{
          fontSize: '10px',
          color: '#2F855A',
          marginBottom: '12px',
          fontStyle: 'italic',
          borderBottom: '2px solid #9AE6B4',
          paddingBottom: '8px',
        }}
      >
        {hierarchyText}
      </div>

      {/* Ports section header */}
      <div
        style={{
          fontSize: '9px',
          color: '#2F855A',
          marginBottom: '6px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        Ports
      </div>

      {receiver.ports.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', fontSize: '10px', flexWrap: 'wrap' }}>
          {receiver.ports.map((port, portIdx) => {
            const remainingPixels = port.maxPixels - port.currentPixels;
            const percentUsed = port.maxPixels > 0 ? (port.currentPixels / port.maxPixels) * 100 : 0;
            const isOverBudget = percentUsed > 100;
            const isNearLimit = percentUsed > 80 && percentUsed <= 100;

            // Build full address: DifferentialPort:Receiver:Port (e.g., "1:0:1")
            const portNumber = portIdx + 1;
            const fullAddress = receiver.differentialPortNumber
              ? `${receiver.differentialPortNumber}:${receiverNumber}:${portNumber}`
              : `${receiverNumber}:${portNumber}`;

            // Calculate handle position for this port (evenly spaced at bottom)
            const handlePosition = ((portIdx + 1) / (receiver.ports.length + 1)) * 100;

            return (
              <div
                key={port.id}
                style={{
                  padding: '6px',
                  background: 'white',
                  borderRadius: '4px',
                  border: isOverBudget ? '2px solid #E53E3E' : isNearLimit ? '2px solid #DD6B20' : '1px solid #E2E8F0',
                  minWidth: '85px',
                  flex: '1 1 auto',
                  position: 'relative',
                }}
              >
                {/* Individual handle for this specific port */}
                <Handle
                  type="source"
                  position={Position.Bottom}
                  id={port.id}
                  style={{
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: isOverBudget ? '#E53E3E' : isNearLimit ? '#DD6B20' : '#48BB78',
                    width: '10px',
                    height: '10px',
                    border: '2px solid #22543D',
                    bottom: '-5px',
                  }}
                />
                <div style={{ fontWeight: 'bold', marginBottom: '4px', textAlign: 'center', fontSize: '11px' }}>
                  <div title={`Address: ${fullAddress}`}>{portNumber}</div>
                  <div style={{ fontSize: '9px', fontWeight: 'normal', color: '#666' }}>({fullAddress})</div>
                </div>
                <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                  <span style={{
                    color: isOverBudget ? '#E53E3E' : isNearLimit ? '#DD6B20' : '#2F855A',
                    fontWeight: 'bold',
                    fontSize: '10px'
                  }}>
                    {port.currentPixels}/{port.maxPixels}px
                  </span>
                </div>
                {port.models && port.models.length > 0 && (
                  <div style={{ fontSize: '8px', color: '#666', borderTop: '1px solid #E2E8F0', paddingTop: '4px' }}>
                    {port.models.map((model, idx) => (
                      <div key={idx} style={{ marginBottom: '2px', textAlign: 'center' }}>
                        {model.name}
                        <div style={{ fontSize: '7px', color: '#999' }}>({model.pixels}px)</div>
                      </div>
                    ))}
                  </div>
                )}
                {remainingPixels >= 0 && (
                  <div style={{ fontSize: '8px', color: '#718096', marginTop: '4px', fontStyle: 'italic', textAlign: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '2px' }}>
                    {remainingPixels}px left
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
