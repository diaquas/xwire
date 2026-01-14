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

  // Build full address path for top-left display
  const fullAddressPath = receiver.differentialPortNumber
    ? `${receiver.differentialPortNumber}:${receiverNumber}`
    : `${receiverNumber}`;

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
        padding: '8px',
        border: '2px solid #48BB78',
        borderRadius: '8px',
        background: '#C6F6D5',
        width: '340px',
        height: '120px',
        position: 'relative',
        overflow: 'visible', // Allow child nodes to extend beyond
      }}
    >
      {/* Input connection square (top center) */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '-12px',
          transform: 'translateX(-50%)',
          width: '20px',
          height: '20px',
          border: '2px solid #48BB78',
          background: '#3182CE',
          borderRadius: '2px',
        }}
      >
        <Handle type="target" position={Position.Top} id="receiver-input" style={{ opacity: 0 }} />
      </div>

      {/* Output connection squares (left side - for daisy chaining) */}
      <div
        style={{
          position: 'absolute',
          left: '-12px',
          top: '35%',
          transform: 'translateY(-50%)',
          width: '20px',
          height: '20px',
          border: '2px solid #48BB78',
          background: 'white',
          borderRadius: '2px',
        }}
      >
        <Handle type="source" position={Position.Left} id="receiver-output-1" style={{ opacity: 0 }} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: '-12px',
          top: '65%',
          transform: 'translateY(-50%)',
          width: '20px',
          height: '20px',
          border: '2px solid #48BB78',
          background: 'white',
          borderRadius: '2px',
        }}
      >
        <Handle type="source" position={Position.Left} id="receiver-output-2" style={{ opacity: 0 }} />
      </div>

      {/* Receiver number and address path in top-left */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#22543D',
        }}
      >
        {receiverNumber} <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#2F855A' }}>{fullAddressPath}</span>
      </div>

      {/* Receiver name - centered horizontally, positioned in upper portion */}
      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            position: 'absolute',
            top: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '70%',
            fontWeight: 'bold',
            color: '#22543D',
            border: '2px solid #48BB78',
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '20px',
            textAlign: 'center',
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontWeight: 'bold',
            color: '#22543D',
            cursor: 'pointer',
            fontSize: '20px',
            textAlign: 'center',
            width: '70%',
          }}
          onDoubleClick={handleDoubleClick}
          title="Double-click to rename"
        >
          {displayName}
        </div>
      )}
    </div>
  );
});

ReceiverNode.displayName = 'ReceiverNode';
