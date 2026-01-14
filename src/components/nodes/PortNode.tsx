import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export interface PortNodeData {
  portNumber: number;
  fullAddress: string;
  maxPixels: number;
  currentPixels: number;
  sharedMaxPixels?: number;
  sharedCurrentPixels?: number;
  models: Array<{ name: string; pixels: number }>;
  receiverId: string;
}

export const PortNode = memo(({ data }: NodeProps<PortNodeData>) => {
  const { portNumber, fullAddress, maxPixels, currentPixels, sharedMaxPixels, sharedCurrentPixels, models } = data;

  const remainingPixels = maxPixels - currentPixels;
  const percentUsed = maxPixels > 0 ? (currentPixels / maxPixels) * 100 : 0;

  // Use shared budget for color determination (if available)
  const budgetToCheck = sharedMaxPixels || maxPixels;
  const pixelsToCheck = sharedCurrentPixels || currentPixels;
  const sharedPercentUsed = budgetToCheck > 0 ? (pixelsToCheck / budgetToCheck) * 100 : 0;

  const isOverBudget = sharedPercentUsed > 100;
  const isNearLimit = sharedPercentUsed > 80 && sharedPercentUsed <= 100;

  // Determine port color
  const portColor = isOverBudget ? '#E53E3E' : isNearLimit ? '#DD6B20' : '#ECC94B';

  return (
    <div style={{ position: 'relative' }}>
      {/* Budget display above port circle */}
      <div
        style={{
          position: 'absolute',
          top: '-22px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '9px',
          fontWeight: 'bold',
          color: isOverBudget ? '#E53E3E' : isNearLimit ? '#DD6B20' : '#2F855A',
          whiteSpace: 'nowrap',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '2px 4px',
          borderRadius: '4px',
          border: '1px solid #E2E8F0',
          textAlign: 'center',
        }}
      >
        <div>{currentPixels}/{maxPixels}</div>
        {sharedMaxPixels && sharedMaxPixels !== maxPixels && (
          <div style={{ fontSize: '8px', color: isOverBudget ? '#E53E3E' : isNearLimit ? '#DD6B20' : '#718096', marginTop: '1px' }}>
            Total: {sharedCurrentPixels}/{sharedMaxPixels}
          </div>
        )}
      </div>

      {/* Port circle */}
      <div
        style={{
          padding: '6px',
          border: '2px solid #9AE6B4',
          borderRadius: '50%',
          background: portColor,
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Connection handle from receiver */}
        <Handle
          type="target"
          position={Position.Top}
          id="port-input"
          style={{
            background: '#48BB78',
            width: '6px',
            height: '6px',
            top: '-3px',
          }}
        />

        {/* Connection handle for models */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="port-output"
          style={{
            background: '#2D3748',
            width: '8px',
            height: '8px',
            bottom: '-4px',
          }}
        />

        {/* Port number */}
        <div
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#22543D',
          }}
        >
          {portNumber}
        </div>
      </div>

      {/* Tooltip on hover */}
      <div
        style={{
          position: 'absolute',
          bottom: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'white',
          border: '2px solid #9AE6B4',
          borderRadius: '4px',
          padding: '6px',
          minWidth: '140px',
          fontSize: '9px',
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 0.2s',
          zIndex: 1000,
        }}
        className="port-tooltip"
      >
        <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{fullAddress}</div>
        <div style={{
          color: '#2F855A',
          fontWeight: 'bold',
        }}>
          This Port: {currentPixels}/{maxPixels}px
        </div>
        {remainingPixels >= 0 && (
          <div style={{ fontSize: '8px', color: '#718096', marginTop: '1px' }}>
            {remainingPixels}px left
          </div>
        )}
        {sharedMaxPixels && sharedMaxPixels !== maxPixels && (
          <div style={{
            marginTop: '4px',
            paddingTop: '4px',
            borderTop: '1px solid #E2E8F0',
            color: isOverBudget ? '#E53E3E' : isNearLimit ? '#DD6B20' : '#2F855A',
            fontWeight: 'bold',
          }}>
            Chain Total: {sharedCurrentPixels}/{sharedMaxPixels}px
          </div>
        )}
        {models && models.length > 0 && (
          <div style={{ marginTop: '4px', borderTop: '1px solid #E2E8F0', paddingTop: '4px' }}>
            {models.map((model, idx) => (
              <div key={idx} style={{ fontSize: '8px' }}>
                • {model.name} ({model.pixels}px)
              </div>
            ))}
          </div>
        )}
      </div>

      <style>
        {`
          .port-tooltip:hover {
            opacity: 1 !important;
          }
        `}
      </style>
    </div>
  );
});

PortNode.displayName = 'PortNode';
