import { useEffect } from 'react';
import { DiagramCanvas } from './components/DiagramCanvas';
import { Toolbar } from './components/Toolbar';
import { useDiagramStore } from './store/diagramStore';

function App() {
  const { loadDiagram } = useDiagramStore();

  useEffect(() => {
    // Load saved diagram on mount
    fetch('http://localhost:3001/api/diagram')
      .then((res) => res.json())
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          loadDiagram(data);
        }
      })
      .catch((err) => console.error('Error loading diagram:', err));

    // Connect to xLights update stream
    const eventSource = new EventSource('http://localhost:3001/api/xlights/stream');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'update') {
        console.log('xLights controllers updated:', data.controllers);
        // TODO: Update diagram with new controller info
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
    };

    return () => {
      eventSource.close();
    };
  }, [loadDiagram]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Toolbar />
      <DiagramCanvas />
    </div>
  );
}

export default App;
