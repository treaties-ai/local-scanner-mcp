# Local Scanner MCP Server

A Model Context Protocol (MCP) server for scanning local code and localhost URLs. This server provides tools for validating code, capturing screenshots, and analyzing web pages running on localhost.

## Overview

The Local Scanner MCP Server extends AI assistants' capabilities to interact with locally running web applications and code files. It bridges the gap between AI and local development environments, enabling AI assistants to:

- Test and debug locally running web applications
- Capture screenshots for visual verification
- Lint code files to ensure quality and standards compliance
- Validate HTML for accessibility and standards compliance

This server is particularly useful for developers working with AI assistants like Cline (VSCode) or Cascade (WindSurf) who want to leverage AI capabilities for local development tasks.

## Features

The server provides the following tools:

### 1. scan_localhost

Access a localhost URL, capture console logs, and check for runtime errors.

**Parameters:**
- `url` (required): Localhost URL to scan (must start with http://localhost or https://localhost)
- `waitTime` (optional): Time to wait in milliseconds after page load (default: 1000)
- `actions` (optional): List of actions to perform on the page, such as:
  - Click: `{ "type": "click", "selector": "#button-id" }`
  - Type: `{ "type": "type", "selector": "#input-id", "text": "Hello World" }`
  - Wait: `{ "type": "wait", "time": 2000 }`

**Example:**
```json
{
  "url": "http://localhost:3000",
  "waitTime": 2000,
  "actions": [
    { "type": "click", "selector": "#login-button" },
    { "type": "type", "selector": "#username", "text": "testuser" },
    { "type": "type", "selector": "#password", "text": "password" },
    { "type": "click", "selector": "#submit-button" },
    { "type": "wait", "time": 1000 }
  ]
}
```

### 2. screenshot_localhost

Take a screenshot of a localhost URL.

**Parameters:**
- `url` (required): Localhost URL to screenshot (must start with http://localhost or https://localhost)
- `fullPage` (optional): Whether to take a full page screenshot (default: false)
- `waitTime` (optional): Time to wait in milliseconds after page load (default: 1000)

**Example:**
```json
{
  "url": "http://localhost:3000/dashboard",
  "fullPage": true,
  "waitTime": 2000
}
```

### 3. lint_code

Lint JavaScript, TypeScript, or CSS code files.

**Parameters:**
- `filePath` (required): Path to the file to lint
- `language` (optional): Language of the file (default: auto-detect from file extension)
  - Options: "javascript", "typescript", "css"

**Example:**
```json
{
  "filePath": "/path/to/your/file.js",
  "language": "javascript"
}
```

### 4. validate_html

Validate HTML content or URL for standards compliance.

**Parameters:**
- `source` (required): HTML content or URL to validate
- `isUrl` (optional): Whether the source is a URL (default: false)

**Example:**
```json
{
  "source": "<html><head><title>Test</title></head><body><h1>Hello World</h1></body></html>",
  "isUrl": false
}
```

Or for a URL:
```json
{
  "source": "http://localhost:3000",
  "isUrl": true
}
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/treaties-ai/local-scanner-mcp.git
   cd local-scanner-mcp
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Build the project:
   ```
   npm run build
   ```
4. Start the server:
   ```
   npm start
   ```

## Usage with MCP Clients

This server implements the Model Context Protocol (MCP) and can be used with any MCP client. 

### For VSCode/Cline

Edit the MCP settings file at `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "local-scanner": {
      "command": "node",
      "args": ["/Users/your_username/Documents/Cline/MCP/local-scanner-mcp/build/index.js"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### For WindSurf/Cascade

Edit the WindSurf configuration file at `~/Library/Application Support/WindSurf/windsurf_config.json`:

```json
{
  "mcpServers": {
    "local-scanner": {
      "command": "node",
      "args": ["/Users/your_username/Documents/WindSurf/MCP/local-scanner-mcp/build/index.js"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

Replace `your_username` with your actual username in both configurations.

## Development

To add new tools or enhance existing ones:

1. Add validation functions for new tool arguments
2. Update the tool list in the `setupToolHandlers` method
3. Implement handler functions for the new tools
4. Update the request handler to handle the new tools
5. Build and test the server

## License

MIT
