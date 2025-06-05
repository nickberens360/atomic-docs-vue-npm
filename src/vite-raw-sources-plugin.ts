// src/vite-raw-sources-plugin.ts
import fs from 'node:fs';
import path from 'node:path';
import { type Plugin, type ViteDevServer } from 'vite';
import { glob } from 'glob'; // Make sure to install glob: npm install --save-dev glob @types/glob

const VIRTUAL_MODULE_ID = 'virtual:raw-component-sources';
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;

export interface RawSourcesPluginOptions {
  componentsDir: string; // Absolute path to the components directory to watch
  basePathToRemove: string; // Absolute path to strip from the beginning of file paths to create keys
}

export function rawSourcesPlugin(options: RawSourcesPluginOptions): Plugin {
  const { componentsDir, basePathToRemove } = options;
  const sourcesCache: Record<string, string> = {};
  let serverInstance: ViteDevServer | null = null;

  // Helper to ensure consistent key generation
  function getCacheKey(filePath: string): string {
    const relativePath = path.relative(basePathToRemove, filePath);
    return relativePath.replace(/\\/g, '/'); // Normalize to forward slashes
  }

  async function updateSource(filePath: string) {
    try {
      const absoluteFilePath = path.resolve(filePath); // Ensure it's absolute
      const content = fs.readFileSync(absoluteFilePath, 'utf-8');
      const keyPath = getCacheKey(absoluteFilePath);
      sourcesCache[keyPath] = content;

      if (serverInstance) {
        const mod = serverInstance.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID);
        if (mod) {
          serverInstance.moduleGraph.invalidateModule(mod);
          serverInstance.ws.send({
            type: 'update',
            updates: [
              {
                type: 'js-update',
                path: mod.url,
                acceptedPath: mod.url,
                timestamp: Date.now(),
              },
            ],
          });
        }
      }
    } catch (e) {
      console.error(`[RawSourcesPlugin] Failed to read or process ${filePath}:`, e);
    }
  }

  async function initialScan() {
    const pattern = path.join(componentsDir, '**/*.vue').replace(/\\/g, '/');
    const files = await glob(pattern, { absolute: true }); // Ensure glob uses absolute paths for consistency
    for (const file of files) {
      await updateSource(file);
    }
  }

  return {
    name: 'vite-plugin-raw-sources',

    async buildStart() {
      await initialScan();
      // For build, ensure files are watched if needed by Vite's build --watch
      const pattern = path.join(componentsDir, '**/*.vue').replace(/\\/g, '/');
      const files = await glob(pattern, { absolute: true });
      files.forEach(file => this.addWatchFile(file));
    },

    configureServer(server: ViteDevServer) {
      serverInstance = server;

      const handleFileEvent = async (filePath: string) => {
        // Ensure filePath is absolute for comparison with componentsDir
        const absoluteFilePath = path.resolve(filePath);
        if (absoluteFilePath.startsWith(componentsDir) && absoluteFilePath.endsWith('.vue')) {
          await updateSource(absoluteFilePath);
        }
      };

      server.watcher.on('add', handleFileEvent);
      server.watcher.on('change', handleFileEvent);
      server.watcher.on('unlink', (filePath) => {
        const absoluteFilePath = path.resolve(filePath);
        if (absoluteFilePath.startsWith(componentsDir) && absoluteFilePath.endsWith('.vue')) {
          const keyPath = getCacheKey(absoluteFilePath);
          delete sourcesCache[keyPath];
          if (serverInstance) {
            const mod = serverInstance.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID);
            if (mod) {
              serverInstance.moduleGraph.invalidateModule(mod);
              serverInstance.ws.send({
                type: 'update',
                updates: [
                  {
                    type: 'js-update',
                    path: mod.url,
                    acceptedPath: mod.url,
                    timestamp: Date.now(),
                  },
                ],
              });
            }
          }
        }
      });
    },

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
      return null;
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        return `export const rawSourcesMap = ${JSON.stringify(sourcesCache)};`;
      }
      return null;
    },
  };
}