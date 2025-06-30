// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { generateDocsManifest } = require('./src/scripts/generate-docs-manifest');

const app = express();
app.use(cors());
app.use(express.json());

// Function to load config from atomic-docs.config.js if it exists
function loadConfigFile() {
  const configPath = path.join(process.cwd(), 'atomic-docs.config.js');

  if (fs.existsSync(configPath)) {
    try {
      console.log(`Loading configuration from ${configPath}`);
      // Use require to load the JS config file
      const config = require(configPath);
      // Handle both CommonJS and ES module exports
      return config.default || config;
    } catch (error) {
      console.error(`Error loading config file: ${error.message}`);
      return {};
    }
  }

  return {};
}

// Endpoint to get configuration
app.get('/api/atomic-docs/config', (req, res) => {
  const config = loadConfigFile();
  res.json(config);
});

// Endpoint to generate manifest on demand
app.post('/api/atomic-docs/generate-manifest', async (req, res) => {
  try {
    await generateDocsManifest();
    res.json({ success: true, message: 'Manifest generated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint to get the manifest content
app.get('/api/atomic-docs/manifest', (req, res) => {
  try {
    const config = loadConfigFile();
    const manifestPath = path.join(
      process.cwd(),
      config.output || 'src/atomic-docs-manifest.ts'
    );

    if (fs.existsSync(manifestPath)) {
      const content = fs.readFileSync(manifestPath, 'utf8');
      res.json({ success: true, content });
    } else {
      res.status(404).json({
        success: false,
        message: 'Manifest file not found. Generate it first.'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint to get the manifest modules directly
app.get('/api/atomic-docs/manifest-modules', (req, res) => {
  try {
    const config = loadConfigFile();
    const manifestPath = path.join(
      process.cwd(),
      config.output || 'src/atomic-docs-manifest.ts'
    );

    if (fs.existsSync(manifestPath)) {
      // We can't directly require the TS file, so we need to use a workaround
      // In a real implementation, you might want to use ts-node or similar

      // For now, we'll parse the file content to extract the modules
      const content = fs.readFileSync(manifestPath, 'utf8');

      // Extract component modules
      const componentModulesMatch = content.match(/export const componentModules[^{]*{([^}]*)}/s);
      const componentModules = componentModulesMatch ? parseModules(componentModulesMatch[1]) : {};

      // Extract example modules
      const exampleModulesMatch = content.match(/export const exampleModules[^{]*{([^}]*)}/s);
      const exampleModules = exampleModulesMatch ? parseModules(exampleModulesMatch[1]) : {};

      // Extract raw component source modules
      const rawComponentSourceModulesMatch = content.match(/export const rawComponentSourceModules[^{]*{([^}]*)}/s);
      const rawComponentSourceModules = rawComponentSourceModulesMatch ? parseModules(rawComponentSourceModulesMatch[1]) : {};

      res.json({
        success: true,
        modules: {
          componentModules,
          exampleModules,
          rawComponentSourceModules
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Manifest file not found. Generate it first.'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper function to parse modules from the manifest file
function parseModules(modulesString) {
  const modules = {};
  const lines = modulesString.split('\n');

  for (const line of lines) {
    const match = line.match(/\s*acc\[['"]([^'"]+)['"]\]\s*=\s*([^;]+)/);
    if (match) {
      const key = match[1];
      const value = match[2].trim();
      modules[key] = value;
    }
  }

  return modules;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Atomic Docs server running on port ${PORT}`);
});

module.exports = app;
