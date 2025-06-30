// Test script to verify the config file loading functionality
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create a temporary config file
const configContent = `
module.exports = {
  output: 'src/test-output/atomic-docs-manifest.ts',
  componentsDir: 'src/test-components',
  examplesDir: 'src/test-examples',
  pluginComponentsBaseName: 'test-components',
  pluginExamplesBaseName: 'test-examples'
};
`;

// Path to the config file
const configPath = path.join(process.cwd(), 'atomic-docs.config.js');

// Create the config file
fs.writeFileSync(configPath, configContent);

console.log('Created test config file at:', configPath);
console.log('Config content:', configContent);

try {
  // Run the generate-docs-manifest script
  console.log('Running generate-docs-manifest script...');
  const output = execSync('node src/scripts/generate-docs-manifest.js', { encoding: 'utf8' });
  console.log('Script output:', output);

  // Verify the script used the config file
  if (output.includes('Loading configuration from')) {
    console.log('✅ Config file was successfully loaded');
  } else {
    console.error('❌ Config file was not loaded');
  }

  // Check if the output directory was created according to the config
  const outputDir = path.join(process.cwd(), 'src/test-output');
  if (fs.existsSync(outputDir)) {
    console.log('✅ Output directory was created according to config');
  } else {
    console.error('❌ Output directory was not created');
  }

  // Check if the manifest file was created
  const manifestPath = path.join(outputDir, 'atomic-docs-manifest.ts');
  if (fs.existsSync(manifestPath)) {
    console.log('✅ Manifest file was created at the configured path');
  } else {
    console.error('❌ Manifest file was not created');
  }
} catch (error) {
  console.error('Error running script:', error.message);
} finally {
  // Clean up - remove the test config file
  fs.unlinkSync(configPath);
  console.log('Removed test config file');

  // Clean up - remove the test output directory if it exists
  const outputDir = path.join(process.cwd(), 'src/test-output');
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
    console.log('Removed test output directory');
  }
}