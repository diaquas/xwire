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
        minWidth: '220px',
        maxWidth: '300px',
      }}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />

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
          marginBottom: '8px',
          fontStyle: 'italic',
          borderBottom: '1px solid #9AE6B4',
          paddingBottom: '4px',
        }}
      >
        {hierarchyText}
      </div>

      {receiver.ports.length > 0 && (
        <div style={{ fontSize: '10px' }}>
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
                  <span title={`Address: ${fullAddress}`}>{port.name} ({fullAddress})</span>
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
