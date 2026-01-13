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
  ports: Port[];
  position: { x: number; y: number };
  controllerConnection?: string;
  differentialConnection?: string; // Which differential this receiver is connected to
}

export interface Differential {
  id: string;
  name: string;
  controllerConnection?: string; // Which controller this differential belongs to
  ports: Port[]; // 4 ethernet ports (CAT5 outputs to receivers)
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
