import { create } from 'zustand';
import { Controller, Receiver, PowerSupply, Wire, Label, DiagramData } from '../types/diagram';

interface DiagramStore {
  controllers: Controller[];
  receivers: Receiver[];
  powerSupplies: PowerSupply[];
  wires: Wire[];
  labels: Label[];

  // Actions
  addController: (controller: Controller) => void;
  updateController: (id: string, updates: Partial<Controller>) => void;
  removeController: (id: string) => void;

  addReceiver: (receiver: Receiver) => void;
  updateReceiver: (id: string, updates: Partial<Receiver>) => void;
  removeReceiver: (id: string) => void;

  addPowerSupply: (powerSupply: PowerSupply) => void;
  updatePowerSupply: (id: string, updates: Partial<PowerSupply>) => void;
  removePowerSupply: (id: string) => void;

  addWire: (wire: Wire) => void;
  updateWire: (id: string, updates: Partial<Wire>) => void;
  removeWire: (id: string) => void;

  addLabel: (label: Label) => void;
  updateLabel: (id: string, updates: Partial<Label>) => void;
  removeLabel: (id: string) => void;

  loadDiagram: (data: DiagramData) => void;
  getDiagramData: () => DiagramData;
}

export const useDiagramStore = create<DiagramStore>((set, get) => ({
  controllers: [],
  receivers: [],
  powerSupplies: [],
  wires: [],
  labels: [],

  addController: (controller) =>
    set((state) => ({ controllers: [...state.controllers, controller] })),

  updateController: (id, updates) =>
    set((state) => ({
      controllers: state.controllers.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  removeController: (id) =>
    set((state) => ({
      controllers: state.controllers.filter((c) => c.id !== id),
      wires: state.wires.filter((w) => w.from.nodeId !== id && w.to.nodeId !== id),
    })),

  addReceiver: (receiver) =>
    set((state) => ({ receivers: [...state.receivers, receiver] })),

  updateReceiver: (id, updates) =>
    set((state) => ({
      receivers: state.receivers.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  removeReceiver: (id) =>
    set((state) => ({
      receivers: state.receivers.filter((r) => r.id !== id),
      wires: state.wires.filter((w) => w.from.nodeId !== id && w.to.nodeId !== id),
    })),

  addPowerSupply: (powerSupply) =>
    set((state) => ({ powerSupplies: [...state.powerSupplies, powerSupply] })),

  updatePowerSupply: (id, updates) =>
    set((state) => ({
      powerSupplies: state.powerSupplies.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  removePowerSupply: (id) =>
    set((state) => ({
      powerSupplies: state.powerSupplies.filter((p) => p.id !== id),
      wires: state.wires.filter((w) => w.from.nodeId !== id && w.to.nodeId !== id),
    })),

  addWire: (wire) =>
    set((state) => ({ wires: [...state.wires, wire] })),

  updateWire: (id, updates) =>
    set((state) => ({
      wires: state.wires.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    })),

  removeWire: (id) =>
    set((state) => ({ wires: state.wires.filter((w) => w.id !== id) })),

  addLabel: (label) =>
    set((state) => ({ labels: [...state.labels, label] })),

  updateLabel: (id, updates) =>
    set((state) => ({
      labels: state.labels.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    })),

  removeLabel: (id) =>
    set((state) => ({ labels: state.labels.filter((l) => l.id !== id) })),

  loadDiagram: (data) =>
    set({
      controllers: data.controllers || [],
      receivers: data.receivers || [],
      powerSupplies: data.powerSupplies || [],
      wires: data.wires || [],
      labels: data.labels || [],
    }),

  getDiagramData: () => {
    const state = get();
    return {
      controllers: state.controllers,
      receivers: state.receivers,
      powerSupplies: state.powerSupplies,
      wires: state.wires,
      labels: state.labels,
    };
  },
}));
