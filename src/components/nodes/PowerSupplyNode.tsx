import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { PowerSupply } from '../../types/diagram';

interface PowerSupplyNodeData {
  powerSupply: PowerSupply;
}

export const PowerSupplyNode = memo(({ data }: NodeProps<PowerSupplyNodeData>) => {
  const { powerSupply } = data;

  return (
    <div
      style={{
        padding: '10px',
        border: '2px solid #ED8936',
        borderRadius: '8px',
        background: '#FEEBC8',
        minWidth: '150px',
      }}
    >
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Left} />

      <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#7C2D12' }}>
        {powerSupply.name}
      </div>
      <div style={{ fontSize: '12px', color: '#9C4221' }}>
        {powerSupply.voltage}V / {powerSupply.amperage}A
      </div>
    </div>
  );
});

PowerSupplyNode.displayName = 'PowerSupplyNode';
