import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export interface PortNodeData {
  portNumber: number;
  fullAddress: string;
  maxPixels: number;
  currentPixels: number;
  models: Array<{ name: string; pixels: number }>;
  receiverId: string;
}

export const PortNode = memo(({ data }: NodeProps<PortNodeData>) => {
  const { portNumber, fullAddress, maxPixels, currentPixels, models } = data;

  const remainingPixels = maxPixels - currentPixels;
  const percentUsed = maxPixels > 0 ? (currentPixels / maxPixels) * 100 : 0;
  const isOverBudget = percentUsed > 100;
  const isNearLimit = percentUsed > 80 && percentUsed <= 100;

  // Determine port color
  const portColor = isOverBudget ? '#E53E3E' : isNearLimit ? '#DD6B20' : '#ECC94B';

  return (
    <div
      style={{
        padding: '8px',
        border: '2px solid #9AE6B4',
        borderRadius: '50%',
        background: portColor,
        width: '60px',
        height: '60px',
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
          width: '8px',
          height: '8px',
          top: '-4px',
        }}
      />

      {/* Connection handle for models */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="port-output"
        style={{
          background: '#2D3748',
          width: '10px',
          height: '10px',
          bottom: '-5px',
        }}
      />

      {/* Port number */}
      <div
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#22543D',
        }}
      >
        {portNumber}
      </div>

      {/* Tooltip on hover */}
      <div
        style={{
          position: 'absolute',
          bottom: '-80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'white',
          border: '2px solid #9AE6B4',
          borderRadius: '4px',
          padding: '6px',
          minWidth: '120px',
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
          color: isOverBudget ? '#E53E3E' : isNearLimit ? '#DD6B20' : '#2F855A',
          fontWeight: 'bold',
        }}>
          {currentPixels}/{maxPixels}px
        </div>
        {remainingPixels >= 0 && (
          <div style={{ fontSize: '8px', color: '#718096', marginTop: '2px' }}>
            {remainingPixels}px left
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
