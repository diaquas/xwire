import { parseString } from 'xml2js';
import { promises as fs } from 'fs';
import { XLightsController, XLightsOutput } from '../types/diagram.js';

export class XLightsParser {
  async parseNetworkFile(filePath: string): Promise<XLightsController[]> {
    try {
      const xmlContent = await fs.readFile(filePath, 'utf-8');
      return await this.parseXML(xmlContent);
    } catch (error) {
      console.error('Error reading xLights network file:', error);
      throw error;
    }
  }

  async parseRgbEffectsFile(filePath: string): Promise<any> {
    try {
      const xmlContent = await fs.readFile(filePath, 'utf-8');
      return await this.parseRgbEffectsXML(xmlContent);
    } catch (error) {
      console.error('Error reading xLights rgbeffects file:', error);
      throw error;
    }
  }

  private parseRgbEffectsXML(xml: string): Promise<any> {
    return new Promise((resolve, reject) => {
      parseString(xml, (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          const controllerInfo = this.extractControllerInfo(result);
          resolve(controllerInfo);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  private extractControllerInfo(xmlData: any): any {
    console.log('Parsing rgbeffects XML structure...');

    const controllerInfo: any = {
      controllers: {},
      models: []
    };

    // Look for controller definitions
    // Typical structure: xlights_rgbeffects.xml has models with ControllerConnection attributes
    if (xmlData.xrgb?.models?.[0]?.model) {
      const models = Array.isArray(xmlData.xrgb.models[0].model)
        ? xmlData.xrgb.models[0].model
        : [xmlData.xrgb.models[0].model];

      for (const model of models) {
        const attrs = model.$ || {};
        if (attrs.ControllerConnection) {
          const modelInfo = {
            name: attrs.name || attrs.Name,
            controller: attrs.ControllerConnection,
            port: attrs.Port,
            startChannel: attrs.StartChannel,
            channels: attrs.parm1, // parm1 often contains channel count
          };
          controllerInfo.models.push(modelInfo);

          // Group by controller
          if (!controllerInfo.controllers[attrs.ControllerConnection]) {
            controllerInfo.controllers[attrs.ControllerConnection] = {
              ports: {}
            };
          }

          // Group by port
          if (attrs.Port) {
            if (!controllerInfo.controllers[attrs.ControllerConnection].ports[attrs.Port]) {
              controllerInfo.controllers[attrs.ControllerConnection].ports[attrs.Port] = [];
            }
            controllerInfo.controllers[attrs.ControllerConnection].ports[attrs.Port].push(modelInfo);
          }
        }
      }
    }

    console.log(`Found ${controllerInfo.models.length} models with controller connections`);
    console.log(`Controllers: ${Object.keys(controllerInfo.controllers).join(', ')}`);

    return controllerInfo;
  }

  private parseXML(xml: string): Promise<XLightsController[]> {
    return new Promise((resolve, reject) => {
      parseString(xml, (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          const controllers = this.extractControllers(result);
          resolve(controllers);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  private extractControllers(xmlData: any): XLightsController[] {
    const controllers: XLightsController[] = [];

    // Debug: Log the structure
    console.log('XML Root keys:', Object.keys(xmlData));

    // Try multiple possible xLights file structures
    let controllersData: any[] = [];

    // Format 1: Networks.Network[0].Controller
    if (xmlData.Networks?.Network?.[0]?.Controller) {
      controllersData = Array.isArray(xmlData.Networks.Network[0].Controller)
        ? xmlData.Networks.Network[0].Controller
        : [xmlData.Networks.Network[0].Controller];
      console.log('Found controllers in Networks.Network[0].Controller');
    }
    // Format 2: Networks.Controller (direct)
    else if (xmlData.Networks?.Controller) {
      controllersData = Array.isArray(xmlData.Networks.Controller)
        ? xmlData.Networks.Controller
        : [xmlData.Networks.Controller];
      console.log('Found controllers in Networks.Controller');
    }
    // Format 3: controllerconnection (xLights show directory file)
    else if (xmlData.controllerconnections?.controller) {
      controllersData = Array.isArray(xmlData.controllerconnections.controller)
        ? xmlData.controllerconnections.controller
        : [xmlData.controllerconnections.controller];
      console.log('Found controllers in controllerconnections.controller');
    }
    // Format 4: Direct Controller array
    else if (xmlData.Controller) {
      controllersData = Array.isArray(xmlData.Controller)
        ? xmlData.Controller
        : [xmlData.Controller];
      console.log('Found controllers in direct Controller');
    }

    if (controllersData.length === 0) {
      console.warn('No controllers found. XML structure:', JSON.stringify(xmlData, null, 2).substring(0, 500));
      return controllers;
    }

    console.log(`Found ${controllersData.length} controller(s)`);

    for (const ctrlData of controllersData) {
      const attrs = ctrlData.$ || {};

      const controller: XLightsController = {
        name: attrs.Name || attrs.name || 'Unknown',
        type: `${attrs.Vendor || attrs.vendor || ''} ${attrs.Model || attrs.model || ''}`.trim() || attrs.Type || attrs.type || 'Unknown',
        protocol: attrs.Protocol || attrs.protocol || 'ws2811',
        outputs: [],
      };

      // Parse outputs/ports - try multiple field names
      // Some xLights files use <Output>, some use <network> (lowercase)
      const outputsArray = ctrlData.Output || ctrlData.output || ctrlData.Outputs || ctrlData.network || [];

      if (outputsArray && outputsArray.length > 0) {
        for (let i = 0; i < outputsArray.length; i++) {
          const outputData = outputsArray[i];
          const outputAttrs = outputData.$ || outputData;

          // For <network> elements, BaudRate is the universe/port number, MaxChannels is the channel count
          const portNumber = parseInt(
            outputAttrs.Output ||
            outputAttrs.output ||
            outputAttrs.Number ||
            outputAttrs.number ||
            outputAttrs.BaudRate ||
            outputAttrs.baudRate ||
            (i + 1).toString(),
            10
          );

          const channels = parseInt(
            outputAttrs.Channels ||
            outputAttrs.channels ||
            outputAttrs.MaxChannels ||
            outputAttrs.maxChannels ||
            '0',
            10
          );

          const output: XLightsOutput = {
            number: portNumber,
            description: outputAttrs.Description || outputAttrs.description || `Universe ${portNumber}`,
            nullPixels: parseInt(outputAttrs.NullPixels || outputAttrs.nullPixels || '0', 10),
            startChannel: parseInt(outputAttrs.StartChannel || outputAttrs.startChannel || '0', 10),
            channels: channels,
            protocol: outputAttrs.Protocol || outputAttrs.protocol || outputAttrs.NetworkType || outputAttrs.networkType || controller.protocol,
          };
          controller.outputs.push(output);
        }
      }

      console.log(`Parsed controller: ${controller.name} (${controller.type}) with ${controller.outputs.length} outputs`);
      controllers.push(controller);
    }

    return controllers;
  }

  calculateMaxPixelsPerPort(output: XLightsOutput): number {
    // Most protocols use 3 channels per pixel (RGB)
    // Some use 4 (RGBW), but we'll default to 3
    const channelsPerPixel = 3;
    return Math.floor(output.channels / channelsPerPixel);
  }
}
