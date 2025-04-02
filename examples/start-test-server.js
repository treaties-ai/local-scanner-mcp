#!/usr/bin/env node
import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the test HTML file
const TEST_HTML_PATH = path.join(__dirname, 'test.html');

// Start a simple HTTP server to serve the test HTML file
const server = http.createServer(async (req, res) => {
  if (req.url === '/' || req.url === '/index.html' || req.url === '/test.html') {
    try {
      const data = await fs.readFile(TEST_HTML_PATH);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    } catch (err) {
      res.writeHead(500);
      res.end('Error loading test.html');
    }
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Start the server on port 8080
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to stop the server.');
});
