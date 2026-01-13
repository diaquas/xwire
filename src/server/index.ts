import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { FileWatcher } from './file-watcher.js';
import { XLightsParser } from './xlights-parser.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const fileWatcher = new FileWatcher();
const parser = new XLightsParser();

let currentControllers: any[] = [];

// WebSocket-like connections (we'll use Server-Sent Events for simplicity)
const clients: express.Response[] = [];

fileWatcher.on('update', (controllers) => {
  currentControllers = controllers;
  // Notify all connected clients
  clients.forEach((client) => {
    client.write(`data: ${JSON.stringify({ type: 'update', controllers })}\n\n`);
  });
});

fileWatcher.on('error', (error) => {
  console.error('File watcher error:', error);
});

// API Routes

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/xlights/watch', async (req, res) => {
  const { filePath } = req.body;

  if (!filePath) {
    return res.status(400).json({ error: 'filePath is required' });
  }

  try {
    // Check if file exists
    await fs.access(filePath);
    fileWatcher.watch(filePath);
    res.json({ success: true, message: 'Now watching xLights file' });
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

app.get('/api/xlights/controllers', (req, res) => {
  res.json(currentControllers);
});

app.post('/api/xlights/parse', async (req, res) => {
  const { filePath } = req.body;

  if (!filePath) {
    return res.status(400).json({ error: 'filePath is required' });
  }

  try {
    console.log('=== PARSING XLIGHTS FILE ===');
    console.log('File path:', filePath);
    const controllers = await parser.parseNetworkFile(filePath);
    console.log('Parsed controllers:', controllers.length);
    currentControllers = controllers;
    res.json(controllers);
  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({ error: 'Error parsing xLights file', details: String(error) });
  }
});

// Debug endpoint to see raw XML structure
app.post('/api/xlights/debug', async (req, res) => {
  const { filePath } = req.body;

  if (!filePath) {
    return res.status(400).json({ error: 'filePath is required' });
  }

  try {
    const xmlContent = await fs.readFile(filePath, 'utf-8');
    const { parseString } = await import('xml2js');

    parseString(xmlContent, (err: any, result: any) => {
      if (err) {
        return res.status(500).json({ error: 'XML parse error', details: String(err) });
      }

      console.log('=== RAW XML STRUCTURE ===');
      console.log(JSON.stringify(result, null, 2));

      res.json({
        structure: result,
        rootKeys: Object.keys(result),
        hasNetworks: !!result.Networks,
        hasController: result.Networks ? !!result.Networks.Controller : false,
        controllerCount: result.Networks?.Controller ? result.Networks.Controller.length : 0,
      });
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: 'Error reading file', details: String(error) });
  }
});

// Parse rgbeffects XML file
app.post('/api/xlights/parse-rgbeffects', async (req, res) => {
  const { filePath } = req.body;

  if (!filePath) {
    return res.status(400).json({ error: 'filePath is required' });
  }

  try {
    console.log('=== PARSING RGBEFFECTS FILE ===');
    console.log('File path:', filePath);
    const controllerInfo = await parser.parseRgbEffectsFile(filePath);
    console.log('Parsed controller info:', Object.keys(controllerInfo.controllers).length, 'controllers');
    res.json(controllerInfo);
  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({ error: 'Error parsing rgbeffects file', details: String(error) });
  }
});

// Debug endpoint for rgbeffects XML
app.post('/api/xlights/debug-rgbeffects', async (req, res) => {
  const { filePath } = req.body;

  if (!filePath) {
    return res.status(400).json({ error: 'filePath is required' });
  }

  try {
    const xmlContent = await fs.readFile(filePath, 'utf-8');
    const { parseString } = await import('xml2js');

    parseString(xmlContent, (err: any, result: any) => {
      if (err) {
        return res.status(500).json({ error: 'XML parse error', details: String(err) });
      }

      console.log('=== RAW RGBEFFECTS XML STRUCTURE ===');
      console.log('Root keys:', Object.keys(result));

      // Show first few models if they exist
      if (result.xrgb?.models?.[0]?.model) {
        const models = Array.isArray(result.xrgb.models[0].model)
          ? result.xrgb.models[0].model
          : [result.xrgb.models[0].model];
        console.log(`Found ${models.length} models`);
        console.log('First model sample:', JSON.stringify(models[0], null, 2));
      }

      res.json({
        structure: result,
        rootKeys: Object.keys(result),
        hasModels: !!result.xrgb?.models,
        modelCount: result.xrgb?.models?.[0]?.model ?
          (Array.isArray(result.xrgb.models[0].model) ? result.xrgb.models[0].model.length : 1) : 0,
      });
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: 'Error reading file', details: String(error) });
  }
});

// Server-Sent Events for real-time updates
app.get('/api/xlights/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  clients.push(res);

  // Send current controllers immediately
  res.write(`data: ${JSON.stringify({ type: 'update', controllers: currentControllers })}\n\n`);

  req.on('close', () => {
    const index = clients.indexOf(res);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
});

// Save/load diagram data
const DIAGRAM_DATA_FILE = path.join(process.cwd(), 'diagram-data.json');

app.get('/api/diagram', async (req, res) => {
  try {
    const data = await fs.readFile(DIAGRAM_DATA_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    // Return empty diagram if file doesn't exist
    res.json({
      controllers: [],
      receivers: [],
      powerSupplies: [],
      wires: [],
      labels: [],
    });
  }
});

app.post('/api/diagram', async (req, res) => {
  try {
    await fs.writeFile(DIAGRAM_DATA_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error saving diagram' });
  }
});

app.listen(PORT, () => {
  console.log(`xWire server running on http://localhost:${PORT}`);
});
