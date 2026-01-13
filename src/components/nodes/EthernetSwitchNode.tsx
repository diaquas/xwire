import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { EthernetSwitch } from '../../types/diagram';

interface EthernetSwitchNodeData {
  ethernetSwitch: EthernetSwitch;
}

export const EthernetSwitchNode = memo(({ data }: NodeProps<EthernetSwitchNodeData>) => {
  const { ethernetSwitch } = data;

  return (
    <div
      style={{
        padding: '10px',
        border: '2px solid #3182CE',
        borderRadius: '8px',
        background: '#BEE3F8',
        minWidth: '150px',
      }}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />

      <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#2C5282' }}>
        {ethernetSwitch.name}
      </div>
      <div style={{ fontSize: '10px', color: '#2C5282', marginBottom: '4px' }}>
        Ethernet Switch
      </div>
      <div
        style={{
          fontSize: '10px',
          padding: '4px',
          background: 'white',
          borderRadius: '4px',
          textAlign: 'center',
        }}
      >
        🔌 {ethernetSwitch.portCount} Ports
      </div>
    </div>
  );
});

EthernetSwitchNode.displayName = 'EthernetSwitchNode';
