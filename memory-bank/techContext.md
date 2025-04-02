# Technical Context: Local Scanner MCP Server

## Technologies Used

### Core Technologies

1. **Node.js**
   - Runtime environment for executing JavaScript code server-side
   - Provides access to file system and network capabilities
   - Enables asynchronous, event-driven programming

2. **TypeScript**
   - Superset of JavaScript with static typing
   - Enhances code quality and maintainability
   - Provides better tooling and developer experience
   - Compiled to JavaScript for execution

3. **Model Context Protocol (MCP)**
   - Standardized protocol for AI assistants to interact with external tools
   - Enables structured communication between AI and local environment
   - Provides schema validation for tool inputs and outputs

### Key Dependencies

1. **@modelcontextprotocol/sdk** (v1.8.0)
   - Official SDK for implementing MCP servers
   - Provides server, transport, and type definitions
   - Handles serialization/deserialization of MCP messages

2. **Puppeteer** (v21.5.2)
   - Headless browser automation library
   - Used for accessing localhost URLs
   - Captures screenshots, console logs, and errors
   - Enables interaction with web pages (clicking, typing)

3. **ESLint** (v8.54.0)
   - Static code analysis tool for JavaScript/TypeScript
   - Identifies problematic patterns
   - Enforces code style and best practices
   - Used for the lint_code tool

4. **Stylelint** (v15.11.0)
   - Linter for CSS files
   - Catches errors and enforces conventions
   - Used for the lint_code tool with CSS files

5. **html-validator** (v6.0.1)
   - HTML validation library
   - Checks HTML against W3C standards
   - Used for the validate_html tool

6. **axios** (v1.6.2)
   - Promise-based HTTP client
   - Used for making HTTP requests to external URLs
   - Handles response parsing

## Development Setup

### Project Structure

```
local-scanner-mcp/
├── build/                 # Compiled JavaScript output
├── src/                   # TypeScript source code
│   └── types/             # TypeScript type definitions
├── examples/              # Example usage and test files
├── package.json           # Project metadata and dependencies
├── tsconfig.json          # TypeScript configuration
└── build-script.js        # Custom build script
```

### Build Process

1. **TypeScript Compilation**
   - Configured in tsconfig.json
   - Outputs to build/ directory
   - Preserves directory structure

2. **Post-Build Processing**
   - build-script.js handles additional build steps
   - Sets executable permissions on the output file

3. **Build Command**
   - `npm run build` runs the complete build process
   - Defined in package.json scripts

### Running the Server

- **Direct Execution**: `node build/index.js`
- **NPM Script**: `npm start`
- **MCP Client Configuration**: Configured in MCP client settings

## Technical Constraints

### Security Constraints

1. **Localhost Restriction**
   - Tools that access URLs are restricted to localhost domains
   - Prevents access to external websites for security
   - URL validation enforced in input validators

2. **File System Access**
   - Limited to reading files for linting/validation
   - No file modification capabilities
   - Path validation to prevent directory traversal

### Performance Considerations

1. **Browser Automation**
   - Puppeteer operations are resource-intensive
   - Browser instances are created and destroyed for each request
   - Timeout parameters prevent hanging on problematic pages

2. **Linting Performance**
   - Linting large files can be computationally expensive
   - No built-in caching mechanism for repeated linting
   - Results are returned as JSON for efficient parsing

### Compatibility Requirements

1. **Node.js Version**
   - Requires Node.js 14.x or higher
   - Uses ES modules (import/export syntax)
   - Leverages modern JavaScript features

2. **MCP Protocol Compatibility**
   - Implements MCP specification
   - Compatible with MCP clients that follow the protocol
   - Provides standardized error responses

## Tool Usage Patterns

### scan_localhost

```javascript
// Basic usage
{
  "url": "http://localhost:3000"
}

// With custom wait time
{
  "url": "http://localhost:3000",
  "waitTime": 2000
}

// With page interactions
{
  "url": "http://localhost:3000",
  "actions": [
    { "type": "click", "selector": "#button-id" },
    { "type": "type", "selector": "#input-id", "text": "Hello World" },
    { "type": "wait", "time": 1000 }
  ]
}
```

### screenshot_localhost

```javascript
// Basic screenshot
{
  "url": "http://localhost:3000"
}

// Full page screenshot
{
  "url": "http://localhost:3000",
  "fullPage": true
}
```

### lint_code

```javascript
// Auto-detect language from extension
{
  "filePath": "/path/to/file.js"
}

// Explicitly specify language
{
  "filePath": "/path/to/file.js",
  "language": "javascript"
}
```

### validate_html

```javascript
// Validate HTML content
{
  "source": "<html><body><h1>Hello World</h1></body></html>"
}

// Validate HTML from URL
{
  "source": "http://localhost:3000",
  "isUrl": true
}
```

## Integration Patterns

### MCP Client Configuration

```json
{
  "mcpServers": {
    "local-scanner": {
      "command": "node",
      "args": ["/path/to/local-scanner-mcp/build/index.js"],
      "env": {}
    }
  }
}
```

### Example Usage Flow

1. Start a local web server
2. Configure MCP client to use local-scanner-mcp
3. Use AI assistant to request scanning of localhost URL
4. AI assistant receives and interprets results
5. AI provides insights based on scan results
