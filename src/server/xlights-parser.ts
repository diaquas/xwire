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

    // xLights network file structure
    if (!xmlData.Networks?.Network?.[0]?.Controller) {
      console.warn('No controllers found in xLights network file');
      return controllers;
    }

    const controllersData = xmlData.Networks.Network[0].Controller;

    for (const ctrlData of controllersData) {
      const controller: XLightsController = {
        name: ctrlData.$.Name || 'Unknown',
        type: ctrlData.$.Type || 'Unknown',
        protocol: ctrlData.$.Protocol || 'ws2811',
        outputs: [],
      };

      // Parse outputs/ports
      if (ctrlData.Output) {
        for (const outputData of ctrlData.Output) {
          const attrs = outputData.$;
          const output: XLightsOutput = {
            number: parseInt(attrs.Output || attrs.Number || '0', 10),
            description: attrs.Description || '',
            nullPixels: parseInt(attrs.NullPixels || '0', 10),
            startChannel: parseInt(attrs.StartChannel || '0', 10),
            channels: parseInt(attrs.Channels || '0', 10),
            protocol: attrs.Protocol || controller.protocol,
          };
          controller.outputs.push(output);
        }
      }

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
