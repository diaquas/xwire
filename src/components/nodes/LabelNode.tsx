import { memo } from 'react';
import { NodeProps } from 'reactflow';
import { Label } from '../../types/diagram';

interface LabelNodeData {
  label: Label;
}

export const LabelNode = memo(({ data }: NodeProps<LabelNodeData>) => {
  const { label } = data;

  const isDivider = label.style === 'divider';

  return (
    <div
      style={{
        padding: isDivider ? '8px 20px' : '8px',
        background: isDivider ? '#A0AEC0' : 'transparent',
        border: isDivider ? 'none' : '1px dashed #CBD5E0',
        borderRadius: isDivider ? '4px' : '0',
        minWidth: isDivider ? '300px' : '100px',
        textAlign: 'center',
        fontWeight: isDivider ? 'bold' : 'normal',
        color: isDivider ? 'white' : '#2D3748',
        fontSize: isDivider ? '14px' : '12px',
      }}
    >
      {label.text}
    </div>
  );
});

LabelNode.displayName = 'LabelNode';
