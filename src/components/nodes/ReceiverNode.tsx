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
        padding: '12px',
        border: '2px solid #48BB78',
        borderRadius: '8px',
        background: '#C6F6D5',
        minWidth: '200px',
        maxWidth: '250px',
        position: 'relative',
      }}
    >
      {/* Input connection square (left side) */}
      <div
        style={{
          position: 'absolute',
          left: '-12px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '20px',
          height: '20px',
          border: '2px solid #48BB78',
          background: '#3182CE',
          borderRadius: '2px',
        }}
      >
        <Handle type="target" position={Position.Left} id="receiver-input" style={{ opacity: 0 }} />
      </div>

      {/* Output connection squares (right side) */}
      <div
        style={{
          position: 'absolute',
          right: '-12px',
          top: '35%',
          transform: 'translateY(-50%)',
          width: '20px',
          height: '20px',
          border: '2px solid #48BB78',
          background: 'white',
          borderRadius: '2px',
        }}
      >
        <Handle type="source" position={Position.Right} id="receiver-output-1" style={{ opacity: 0 }} />
      </div>

      <div
        style={{
          position: 'absolute',
          right: '-12px',
          top: '65%',
          transform: 'translateY(-50%)',
          width: '20px',
          height: '20px',
          border: '2px solid #48BB78',
          background: 'white',
          borderRadius: '2px',
        }}
      >
        <Handle type="source" position={Position.Right} id="receiver-output-2" style={{ opacity: 0 }} />
      </div>

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
          textAlign: 'center',
        }}
      >
        {hierarchyText}
      </div>

      {/* Receiver number display */}
      <div
        style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#22543D',
          textAlign: 'center',
          marginTop: '8px',
        }}
      >
        {receiverNumber}
      </div>

      {/* Port count indicator */}
      <div
        style={{
          fontSize: '10px',
          color: '#2F855A',
          textAlign: 'center',
          marginTop: '8px',
        }}
      >
        {receiver.ports.length} Ports
      </div>
    </div>
  );
});

ReceiverNode.displayName = 'ReceiverNode';
