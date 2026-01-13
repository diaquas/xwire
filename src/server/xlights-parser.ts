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

    // xLights rgbeffects.xml structure: models have Controller attribute (not ControllerConnection)
    if (xmlData.xrgb?.models?.[0]?.model) {
      const models = Array.isArray(xmlData.xrgb.models[0].model)
        ? xmlData.xrgb.models[0].model
        : [xmlData.xrgb.models[0].model];

      for (const model of models) {
        const attrs = model.$ || {};
        const controllerName = attrs.Controller;

        // Skip models without a controller or with "No Controller"
        if (!controllerName || controllerName === 'No Controller') {
          continue;
        }

        // Parse pixel count - different model types store this differently
        let pixelCount = 0;
        const displayAs = attrs.DisplayAs || '';

        // For most models, parm2 is pixel count
        // But for some types (like Poly Line), we need to look at other params
        if (attrs.parm2) {
          pixelCount = parseInt(attrs.parm2, 10);
        } else if (attrs.parm1) {
          pixelCount = parseInt(attrs.parm1, 10);
        }

        // Fallback: calculate from string count and pixels per string
        if (!pixelCount && attrs.parm1 && attrs.parm3) {
          const stringCount = parseInt(attrs.parm1, 10) || 0;
          const pixelsPerString = parseInt(attrs.parm3, 10) || 0;
          pixelCount = stringCount * pixelsPerString;
        }

        const modelInfo = {
          name: attrs.name || attrs.Name,
          controller: controllerName,
          startChannel: parseInt(attrs.StartChannel || '0', 10),
          pixelCount: pixelCount,
          displayAs: displayAs,
          protocol: model.ControllerConnection?.[0]?.$?.Protocol || 'ws2811',
        };

        controllerInfo.models.push(modelInfo);

        // Group by controller
        if (!controllerInfo.controllers[controllerName]) {
          controllerInfo.controllers[controllerName] = {
            models: [],
            channelRanges: []
          };
        }

        controllerInfo.controllers[controllerName].models.push(modelInfo);
      }

      // Calculate channel ranges for each controller
      for (const ctrlName in controllerInfo.controllers) {
        const ctrl = controllerInfo.controllers[ctrlName];
        ctrl.models.sort((a: any, b: any) => a.startChannel - b.startChannel);

        if (ctrl.models.length > 0) {
          const minChannel = ctrl.models[0].startChannel;
          const lastModel = ctrl.models[ctrl.models.length - 1];
          const maxChannel = lastModel.startChannel + (lastModel.pixelCount * 3); // RGB = 3 channels
          ctrl.channelRanges = [minChannel, maxChannel];
          ctrl.totalModels = ctrl.models.length;
        }
      }
    }

    console.log(`Found ${controllerInfo.models.length} models with controller connections`);
    console.log(`Controllers: ${Object.keys(controllerInfo.controllers).join(', ')}`);

    // Log summary for each controller
    for (const ctrlName in controllerInfo.controllers) {
      const ctrl = controllerInfo.controllers[ctrlName];
      console.log(`  ${ctrlName}: ${ctrl.totalModels} models, channels ${ctrl.channelRanges[0]}-${ctrl.channelRanges[1]}`);

      // Debug: Show first 3 models for each controller
      const sampleModels = ctrl.models.slice(0, 3);
      sampleModels.forEach((m: any) => {
        console.log(`    - ${m.name}: ch ${m.startChannel}, ${m.pixelCount} pixels (${m.displayAs})`);
      });
    }

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
