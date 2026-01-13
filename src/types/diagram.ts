export type WireColor = 'red' | 'black' | 'blue';

export interface PortModel {
  name: string;
  pixels: number;
}

export interface Port {
  id: string;
  name: string;
  maxPixels: number;
  currentPixels: number;
  universe?: number; // xLights universe number (optional metadata)
  models?: PortModel[]; // Models connected to this port
}

export interface Controller {
  id: string;
  name: string;
  type: string;
  ports: Port[];
  position: { x: number; y: number };
  description?: string;
}

export interface Receiver {
  id: string;
  name: string;
  customName?: string; // User-editable custom name
  dipSwitch: string;
  differentialPortNumber?: number; // Which differential port (1-16) this receiver connects to
  ports: Port[];
  position: { x: number; y: number };
  controllerConnection?: string;
  differentialConnection?: string; // Which differential this receiver is connected to
}

export interface DifferentialPort {
  id: string;
  name: string;
  portNumber: number; // 1-16 for HinksPix PRO V3
  controllerConnection?: string; // Which controller this differential port belongs to
  sharedPorts: Port[]; // 4 shared pixel ports (budget shared across all daisy-chained receivers)
  connectedReceivers: string[]; // IDs of receivers connected to this differential port
  position: { x: number; y: number };
}

export interface Differential {
  id: string;
  name: string;
  controllerConnection?: string; // Which controller this differential belongs to
  boardNumber: number; // 1-4 for HinksPix PRO V3 (4 boards total)
  differentialPorts: string[]; // IDs of the 4 DifferentialPort nodes in this board
  position: { x: number; y: number };
}

export interface EthernetSwitch {
  id: string;
  name: string;
  portCount: number;
  position: { x: number; y: number };
}

export interface PowerSupply {
  id: string;
  name: string;
  voltage: number;
  amperage: number;
  position: { x: number; y: number };
}

export interface Wire {
  id: string;
  color: WireColor;
  from: {
    nodeId: string;
    portId?: string;
  };
  to: {
    nodeId: string;
    portId?: string;
  };
  label?: string;
}

export interface DiagramData {
  controllers: Controller[];
  receivers: Receiver[];
  differentials: Differential[];
  differentialPorts: DifferentialPort[];
  ethernetSwitches: EthernetSwitch[];
  powerSupplies: PowerSupply[];
  wires: Wire[];
  labels: Label[];
}

export interface Label {
  id: string;
  text: string;
  position: { x: number; y: number };
  width?: number;
  height?: number;
  style?: 'default' | 'divider';
}

export interface XLightsController {
  name: string;
  type: string;
  protocol: string;
  outputs: XLightsOutput[];
}

export interface XLightsOutput {
  number: number;
  description?: string;
  nullPixels: number;
  startChannel: number;
  channels: number;
  protocol: string;
}
