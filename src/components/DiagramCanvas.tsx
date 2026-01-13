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
import { DifferentialPortNode } from './nodes/DifferentialPortNode';
import { EthernetSwitchNode } from './nodes/EthernetSwitchNode';
import { PowerSupplyNode } from './nodes/PowerSupplyNode';
import { LabelNode } from './nodes/LabelNode';
import { PortNode } from './nodes/PortNode';
import { ModelNode } from './nodes/ModelNode';
import { useDiagramStore } from '../store/diagramStore';
import { WireColor } from '../types/diagram';

const nodeTypes = {
  controller: ControllerNode,
  receiver: ReceiverNode,
  differential: DifferentialNode,
  differentialPort: DifferentialPortNode,
  ethernetSwitch: EthernetSwitchNode,
  powerSupply: PowerSupplyNode,
  label: LabelNode,
  port: PortNode,
  model: ModelNode,
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
  autoSnapEnabled: boolean;
}

export const DiagramCanvas = ({ selectedWireColor, autoSnapEnabled }: DiagramCanvasProps) => {
  const {
    controllers,
    receivers,
    differentials,
    differentialPorts,
    ethernetSwitches,
    powerSupplies,
    labels,
    wires,
    addWire,
    updateController,
    updateReceiver,
    updateDifferential,
    updateDifferentialPort,
    updateEthernetSwitch,
    updatePowerSupply,
    updateLabel,
    removeController,
    removeReceiver,
    removeDifferential,
    removeDifferentialPort,
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
        style: { width: 340, height: 120 }, // Smaller receiver box
      });

      // Dynamic horizontal positioning: calculate widths for each port column
      const modelWidth = 130; // Approximate width of a model box
      const portColumnPadding = 20; // Padding between port columns

      // First pass: calculate horizontal offset for each port based on previous ports' content
      let currentXOffset = 0;
      const portXOffsets: number[] = [];

      receiver.ports.forEach((port, portIdx) => {
        portXOffsets.push(currentXOffset);

        // Calculate width needed for this port's models
        const modelCount = (port.models || []).length;
        if (modelCount > 0) {
          // If there are models, this port needs space for model width + padding
          currentXOffset += modelWidth + portColumnPadding;
        } else {
          // If no models, just add minimal spacing for the port circle
          currentXOffset += 70; // Space for port circle
        }
      });

      // Create port nodes as children of receiver
      receiver.ports.forEach((port, portIdx) => {
        const receiverNumber = parseInt(receiver.dipSwitch, 10) || 0;
        const portNumber = portIdx + 1;
        const fullAddress = receiver.differentialPortNumber
          ? `${receiver.differentialPortNumber}:${receiverNumber}:${portNumber}`
          : `${receiverNumber}:${portNumber}`;

        // Position ports to overlap bottom edge of receiver
        const portX = 30 + portIdx * 70; // Start at 30px from left, 70px spacing
        const portY = 95; // Overlaps bottom edge (receiver height is 120px)

        const portId = `${receiver.id}-port-${portIdx}`;

        nodes.push({
          id: portId,
          type: 'port',
          position: { x: portX, y: portY }, // Relative to parent
          parentNode: receiver.id, // Make this a child of the receiver
          extent: 'parent', // Constrain to parent bounds
          draggable: false, // Ports can't be dragged independently
          data: {
            portNumber,
            fullAddress,
            maxPixels: port.maxPixels,
            currentPixels: port.currentPixels,
            models: port.models || [],
            receiverId: receiver.id,
          },
        });

        // Create model nodes as independent nodes (not children of receiver)
        if (port.models && port.models.length > 0) {
          port.models.forEach((model, modelIdx) => {
            // Position models using dynamic horizontal offsets
            const horizontalOffset = portXOffsets[portIdx]; // Dynamic offset based on previous ports
            const absoluteModelX = receiver.position.x + horizontalOffset + 10; // Aligned with port column
            const absoluteModelY = receiver.position.y + 200 + modelIdx * 90; // Below receiver, stacked vertically with more spacing

            const modelId = `${receiver.id}-port-${portIdx}-model-${modelIdx}`;

            nodes.push({
              id: modelId,
              type: 'model',
              position: { x: absoluteModelX, y: absoluteModelY }, // Absolute canvas position
              draggable: true, // Models can be moved independently
              data: {
                name: model.name,
                pixels: model.pixels,
                portId: portId,
                modelIndex: modelIdx,
              },
            });
          });
        }
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

    // DifferentialPorts are data-only now, not rendered (Differential boards are rendered instead)
    // differentialPorts.forEach((differentialPort) => {
    //   nodes.push({
    //     id: differentialPort.id,
    //     type: 'differentialPort',
    //     position: differentialPort.position,
    //     data: { differentialPort },
    //   });
    // });

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
  }, [controllers, receivers, differentials, differentialPorts, ethernetSwitches, powerSupplies, labels]);

  // Convert wires to React Flow edges
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];

    // Add regular wires from store
    wires.forEach((wire) => {
      edges.push({
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
      });
    });

    // Add black wires connecting ports to models
    receivers.forEach((receiver) => {
      receiver.ports.forEach((port, portIdx) => {
        const portId = `${receiver.id}-port-${portIdx}`;

        if (port.models && port.models.length > 0) {
          port.models.forEach((model, modelIdx) => {
            const modelId = `${receiver.id}-port-${portIdx}-model-${modelIdx}`;

            if (modelIdx === 0) {
              // Wire from port to first model
              edges.push({
                id: `wire-port-model-${portId}-${modelId}`,
                source: portId,
                target: modelId,
                sourceHandle: 'port-output',
                targetHandle: 'model-input',
                style: {
                  stroke: '#2D3748', // Black
                  strokeWidth: 2,
                },
                type: 'smoothstep',
              });
            } else {
              // Wire from previous model to this model
              const prevModelId = `${receiver.id}-port-${portIdx}-model-${modelIdx - 1}`;
              edges.push({
                id: `wire-model-model-${prevModelId}-${modelId}`,
                source: prevModelId,
                target: modelId,
                sourceHandle: 'model-output',
                targetHandle: 'model-input',
                style: {
                  stroke: '#2D3748', // Black
                  strokeWidth: 2,
                },
                type: 'smoothstep',
              });
            }
          });
        }
      });
    });

    return edges;
  }, [wires, receivers]);

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
      } else if (nodeType === 'differentialPort') {
        updateDifferentialPort(node.id, { position });
      } else if (nodeType === 'ethernetSwitch') {
        updateEthernetSwitch(node.id, { position });
      } else if (nodeType === 'powerSupply') {
        updatePowerSupply(node.id, { position });
      } else if (nodeType === 'label') {
        updateLabel(node.id, { position });
      } else if (nodeType === 'model' && autoSnapEnabled) {
        // Auto-snap models in the same port
        const draggedPortId = node.data?.portId;

        if (draggedPortId) {
          // Find all model nodes that belong to the same port
          const modelsInPort = nodes.filter(
            (n) => n.type === 'model' && n.data?.portId === draggedPortId
          );

          if (modelsInPort.length > 1) {
            // Sort models by their current Y position
            const sortedModels = [...modelsInPort].sort((a, b) => a.position.y - b.position.y);

            // Find the index of the dragged model in sorted list
            const draggedIndex = sortedModels.findIndex((n) => n.id === node.id);

            // Reposition all models with 55px vertical spacing
            const spacing = 55;
            const updates: any[] = [];

            sortedModels.forEach((model, idx) => {
              // Calculate new Y position relative to dragged model's position
              const offsetFromDragged = idx - draggedIndex;
              const newY = position.y + offsetFromDragged * spacing;

              // Keep X position aligned with dragged model
              const newX = position.x;

              updates.push({
                id: model.id,
                position: { x: newX, y: newY },
              });
            });

            // Update all model positions at once
            setNodes((nds) =>
              nds.map((n) => {
                const update = updates.find((u) => u.id === n.id);
                return update ? { ...n, position: update.position } : n;
              })
            );
          }
        }
      }
    },
    [
      updateController,
      updateReceiver,
      updateDifferential,
      updateDifferentialPort,
      updateEthernetSwitch,
      updatePowerSupply,
      updateLabel,
      autoSnapEnabled,
      nodes,
      setNodes,
    ]
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
        } else if (nodeType === 'differentialPort') {
          removeDifferentialPort(node.id);
        } else if (nodeType === 'ethernetSwitch') {
          removeEthernetSwitch(node.id);
        } else if (nodeType === 'powerSupply') {
          removePowerSupply(node.id);
        } else if (nodeType === 'label') {
          removeLabel(node.id);
        }
      });
    },
    [removeController, removeReceiver, removeDifferential, removeDifferentialPort, removeEthernetSwitch, removePowerSupply, removeLabel]
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
        fitViewOptions={{ padding: 0.2, maxZoom: 0.8 }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        deleteKeyCode="Delete"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};
