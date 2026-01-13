import { useCallback, useMemo, useEffect } from 'react';
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
import { DifferentialNode } from './nodes/DifferentialNode';
import { EthernetSwitchNode } from './nodes/EthernetSwitchNode';
import { PowerSupplyNode } from './nodes/PowerSupplyNode';
import { LabelNode } from './nodes/LabelNode';
import { useDiagramStore } from '../store/diagramStore';
import { WireColor } from '../types/diagram';

const nodeTypes = {
  controller: ControllerNode,
  receiver: ReceiverNode,
  differential: DifferentialNode,
  ethernetSwitch: EthernetSwitchNode,
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

interface DiagramCanvasProps {
  selectedWireColor: WireColor;
}

export const DiagramCanvas = ({ selectedWireColor }: DiagramCanvasProps) => {
  const {
    controllers,
    receivers,
    differentials,
    ethernetSwitches,
    powerSupplies,
    labels,
    wires,
    addWire,
    updateController,
    updateReceiver,
    updateDifferential,
    updateEthernetSwitch,
    updatePowerSupply,
    updateLabel,
    removeController,
    removeReceiver,
    removeDifferential,
    removeEthernetSwitch,
    removePowerSupply,
    removeLabel,
    removeWire,
  } = useDiagramStore();

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

    differentials.forEach((differential) => {
      nodes.push({
        id: differential.id,
        type: 'differential',
        position: differential.position,
        data: { differential },
      });
    });

    ethernetSwitches.forEach((ethernetSwitch) => {
      nodes.push({
        id: ethernetSwitch.id,
        type: 'ethernetSwitch',
        position: ethernetSwitch.position,
        data: { ethernetSwitch },
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
  }, [controllers, receivers, differentials, ethernetSwitches, powerSupplies, labels]);

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

  // Sync nodes when store changes
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Sync edges when store changes
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const newWire = {
        id: `wire-${Date.now()}`,
        color: selectedWireColor,
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
              stroke: getWireColor(selectedWireColor),
              strokeWidth: 3,
            },
            type: 'smoothstep',
          },
          eds
        )
      );
    },
    [addWire, setEdges, selectedWireColor]
  );

  // Update store when nodes are dragged
  const onNodeDragStop = useCallback(
    (_event: any, node: Node) => {
      const nodeType = node.type;
      const position = node.position;

      if (nodeType === 'controller') {
        updateController(node.id, { position });
      } else if (nodeType === 'receiver') {
        updateReceiver(node.id, { position });
      } else if (nodeType === 'differential') {
        updateDifferential(node.id, { position });
      } else if (nodeType === 'ethernetSwitch') {
        updateEthernetSwitch(node.id, { position });
      } else if (nodeType === 'powerSupply') {
        updatePowerSupply(node.id, { position });
      } else if (nodeType === 'label') {
        updateLabel(node.id, { position });
      }
    },
    [updateController, updateReceiver, updateDifferential, updateEthernetSwitch, updatePowerSupply, updateLabel]
  );

  // Handle node deletion (triggered by Delete key or programmatic deletion)
  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      deleted.forEach((node) => {
        const nodeType = node.type;

        if (nodeType === 'controller') {
          removeController(node.id);
        } else if (nodeType === 'receiver') {
          removeReceiver(node.id);
        } else if (nodeType === 'differential') {
          removeDifferential(node.id);
        } else if (nodeType === 'ethernetSwitch') {
          removeEthernetSwitch(node.id);
        } else if (nodeType === 'powerSupply') {
          removePowerSupply(node.id);
        } else if (nodeType === 'label') {
          removeLabel(node.id);
        }
      });
    },
    [removeController, removeReceiver, removeDifferential, removeEthernetSwitch, removePowerSupply, removeLabel]
  );

  // Handle edge/wire deletion
  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      deleted.forEach((edge) => {
        removeWire(edge.id);
      });
    },
    [removeWire]
  );

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        deleteKeyCode="Delete"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};
