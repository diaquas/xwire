import chokidar from 'chokidar';
import { EventEmitter } from 'events';
import { XLightsParser } from './xlights-parser.js';

export class FileWatcher extends EventEmitter {
  private watcher: chokidar.FSWatcher | null = null;
  private parser: XLightsParser;
  private watchedPath: string | null = null;

  constructor() {
    super();
    this.parser = new XLightsParser();
  }

  watch(filePath: string): void {
    if (this.watcher) {
      this.watcher.close();
    }

    this.watchedPath = filePath;

    this.watcher = chokidar.watch(filePath, {
      persistent: true,
      ignoreInitial: false,
    });

    this.watcher
      .on('add', () => this.handleFileChange())
      .on('change', () => this.handleFileChange())
      .on('error', (error) => {
        console.error('File watcher error:', error);
        this.emit('error', error);
      });

    console.log(`Watching xLights file: ${filePath}`);
  }

  private async handleFileChange(): Promise<void> {
    if (!this.watchedPath) return;

    try {
      console.log('xLights file changed, parsing...');
      const controllers = await this.parser.parseNetworkFile(this.watchedPath);
      this.emit('update', controllers);
    } catch (error) {
      console.error('Error parsing xLights file:', error);
      this.emit('error', error);
    }
  }

  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }
}
