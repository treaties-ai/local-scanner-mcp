#!/usr/bin/env node
/**
 * This is an example script that demonstrates how to use the Local Scanner MCP Server.
 * It shows how to start a simple HTTP server to serve the test.html file and then
 * use the MCP server to scan the page, take screenshots, and validate the HTML.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Path to the test HTML file
const TEST_HTML_PATH = path.join(__dirname, 'test.html');

// Start a simple HTTP server to serve the test HTML file
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html' || req.url === '/test.html') {
    fs.readFile(TEST_HTML_PATH, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading test.html');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Start the server on port 8080
const PORT = 8080;
server.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  
  try {
    // Wait a moment for the server to start
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Example 1: Scan the localhost URL
    console.log('\n--- Example 1: Scan localhost URL ---');
    console.log('Running: mcp-client local-scanner scan_localhost {"url": "http://localhost:8080"}');
    console.log('This would capture console logs and check for runtime errors.');
    
    // Example 2: Take a screenshot
    console.log('\n--- Example 2: Take a screenshot ---');
    console.log('Running: mcp-client local-scanner screenshot_localhost {"url": "http://localhost:8080", "fullPage": true}');
    console.log('This would take a full-page screenshot of the test page.');
    
    // Example 3: Validate HTML
    console.log('\n--- Example 3: Validate HTML ---');
    console.log('Running: mcp-client local-scanner validate_html {"source": "http://localhost:8080", "isUrl": true}');
    console.log('This would validate the HTML of the test page for standards compliance.');
    
    // Example 4: Perform actions on the page
    console.log('\n--- Example 4: Perform actions ---');
    console.log(`Running: mcp-client local-scanner scan_localhost {
  "url": "http://localhost:8080",
  "actions": [
    { "type": "click", "selector": "#log-info" },
    { "type": "wait", "time": 500 },
    { "type": "click", "selector": "#log-warn" },
    { "type": "wait", "time": 500 },
    { "type": "click", "selector": "#log-error" }
  ]
}`);
    console.log('This would click the buttons and capture the console logs.');
    
    // Example 5: Fill out a form
    console.log('\n--- Example 5: Fill out a form ---');
    console.log(`Running: mcp-client local-scanner scan_localhost {
  "url": "http://localhost:8080",
  "actions": [
    { "type": "type", "selector": "#username", "text": "testuser" },
    { "type": "type", "selector": "#password", "text": "password123" },
    { "type": "click", "selector": "#submit-button" }
  ]
}`);
    console.log('This would fill out the form and submit it.');
    
    console.log('\nNote: These are example commands. To actually run them, you would need an MCP client.');
    console.log('Press Ctrl+C to stop the server.');
  } catch (error) {
    console.error('Error:', error);
    server.close();
    process.exit(1);
  }
});
