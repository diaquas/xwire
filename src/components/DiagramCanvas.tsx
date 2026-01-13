import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { ControllerNode } from './nodes/ControllerNode';
import { ReceiverNode } from './nodes/ReceiverNode';
import { PowerSupplyNode } from './nodes/PowerSupplyNode';
import { LabelNode } from './nodes/LabelNode';
import { useDiagramStore } from '../store/diagramStore';
import { WireColor } from '../types/diagram';

const nodeTypes = {
  controller: ControllerNode,
  receiver: ReceiverNode,
  powerSupply: PowerSupplyNode,
  label: LabelNode,
};

const getWireColor = (color: WireColor): string => {
  switch (color) {
    case 'red':
      return '#E53E3E';
    case 'black':
      return '#2D3748';
    case 'blue':
      return '#3182CE';
    default:
      return '#718096';
  }
};

export const DiagramCanvas = () => {
  const { controllers, receivers, powerSupplies, labels, wires, addWire } =
    useDiagramStore();

  // Convert our data to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = [];

    controllers.forEach((controller) => {
      nodes.push({
        id: controller.id,
        type: 'controller',
        position: controller.position,
        data: { controller },
      });
    });

    receivers.forEach((receiver) => {
      nodes.push({
        id: receiver.id,
        type: 'receiver',
        position: receiver.position,
        data: { receiver },
      });
    });

    powerSupplies.forEach((powerSupply) => {
      nodes.push({
        id: powerSupply.id,
        type: 'powerSupply',
        position: powerSupply.position,
        data: { powerSupply },
      });
    });

    labels.forEach((label) => {
      nodes.push({
        id: label.id,
        type: 'label',
        position: label.position,
        data: { label },
        draggable: true,
      });
    });

    return nodes;
  }, [controllers, receivers, powerSupplies, labels]);

  // Convert wires to React Flow edges
  const initialEdges: Edge[] = useMemo(() => {
    return wires.map((wire) => ({
      id: wire.id,
      source: wire.from.nodeId,
      target: wire.to.nodeId,
      sourceHandle: wire.from.portId,
      targetHandle: wire.to.portId,
      label: wire.label,
      style: {
        stroke: getWireColor(wire.color),
        strokeWidth: 3,
      },
      type: 'smoothstep',
    }));
  }, [wires]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => {
      const newWire = {
        id: `wire-${Date.now()}`,
        color: 'black' as WireColor,
        from: {
          nodeId: connection.source!,
          portId: connection.sourceHandle || undefined,
        },
        to: {
          nodeId: connection.target!,
          portId: connection.targetHandle || undefined,
        },
      };

      addWire(newWire);

      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: newWire.id,
            style: {
              stroke: getWireColor('black'),
              strokeWidth: 3,
            },
            type: 'smoothstep',
          },
          eds
        )
      );
    },
    [addWire, setEdges]
  );

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};
