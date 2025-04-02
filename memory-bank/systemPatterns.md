# System Patterns: Local Scanner MCP Server

## System Architecture

The Local Scanner MCP Server follows a modular architecture designed around the Model Context Protocol (MCP). The system is structured to provide a clear separation of concerns while maintaining extensibility for future tools.

```
┌─────────────────────────────────────────────────────────┐
│                  Local Scanner MCP Server                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │    Server   │    │    Tool     │    │   Handler   │  │
│  │   Setup     │◄───┤  Registry   │◄───┤  Functions  │  │
│  └─────────────┘    └─────────────┘    └─────────────┘  │
│         │                  ▲                  ▲         │
│         ▼                  │                  │         │
│  ┌─────────────┐           │                  │         │
│  │     MCP     │           │                  │         │
│  │  Transport  │           │                  │         │
│  └─────────────┘           │                  │         │
│         │                  │                  │         │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          ▼                  │                  │
┌─────────────────┐          │                  │
│  MCP Client     │          │                  │
│  (AI Assistant) │          │                  │
└─────────────────┘          │                  │
          │                  │                  │
          ▼                  │                  │
┌─────────────────┐ ┌────────────────┐ ┌────────────────┐
│   Localhost     │ │   Local Code   │ │  External      │
│   Web Apps      │ │   Files        │ │  Dependencies  │
└─────────────────┘ └────────────────┘ └────────────────┘
```

### Key Components

1. **Server Setup**
   - Initializes the MCP server with metadata
   - Configures capabilities and error handling
   - Manages server lifecycle (startup, shutdown)

2. **Tool Registry**
   - Defines available tools and their schemas
   - Registers tools with the MCP server
   - Routes tool requests to appropriate handlers

3. **Handler Functions**
   - Implements the logic for each tool
   - Validates input parameters
   - Interacts with external dependencies
   - Formats and returns results

4. **MCP Transport**
   - Handles communication via stdio
   - Serializes/deserializes MCP messages
   - Maintains the connection with MCP clients

## Design Patterns

### 1. Command Pattern

The server implements the Command pattern through its tool handlers. Each tool (scan_localhost, screenshot_localhost, etc.) represents a command that encapsulates a specific action and its parameters.

```typescript
// Tool registry using Command pattern
this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'scan_localhost',
      description: '...',
      inputSchema: { ... }
    },
    // Other tools...
  ]
}));

// Command routing
this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case 'scan_localhost':
      return this.handleScanLocalhost(request.params.arguments);
    // Other command handlers...
  }
});
```

### 2. Validator Pattern

Input validation is implemented using type predicates that validate the structure of incoming parameters before processing.

```typescript
// Validator pattern with TypeScript type predicates
const isValidScanLocalhostArgs = (
  args: any
): args is { 
  url: string; 
  waitTime?: number;
  actions?: Array<...>;
} => {
  // Validation logic
  return typeof args === 'object' && 
         args !== null && 
         typeof args.url === 'string' && 
         // Additional validation...
};
```

### 3. Facade Pattern

The server acts as a facade, providing a simplified interface to complex subsystems like Puppeteer (for browser automation), ESLint (for code linting), and HTML validation.

```typescript
// Facade pattern example with Puppeteer
private async handleScreenshotLocalhost(args: unknown) {
  // Validation...
  
  // Simplified facade for browser automation
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });
  const screenshot = await page.screenshot({ ... });
  await browser.close();
  
  // Return formatted result
  return { ... };
}
```

### 4. Strategy Pattern

The server uses different strategies for handling different types of code analysis based on file type.

```typescript
// Strategy pattern for different linting approaches
if (language === 'css') {
  // CSS linting strategy
  const result = await stylelint.lint({ ... });
  // Process result...
} else {
  // JavaScript/TypeScript linting strategy
  const eslint = new ESLint(eslintOptions);
  const results = await eslint.lintText(fileContent, { ... });
  // Process result...
}
```

## Critical Implementation Paths

### 1. Localhost URL Scanning

```
Request → Validate URL → Launch Browser → Navigate to URL → 
Collect Console Logs → Perform Actions → Capture Screenshot → 
Close Browser → Format Response
```

### 2. Code Linting

```
Request → Validate File Path → Read File → Determine Language → 
Select Linting Strategy → Run Linter → Format Results
```

### 3. HTML Validation

```
Request → Determine Source Type (URL/Content) → 
Fetch Content (if URL) → Validate HTML → Format Results
```

## Component Relationships

- **Server** depends on **MCP SDK** for protocol implementation
- **Tool Handlers** depend on external libraries:
  - **Puppeteer** for browser automation
  - **ESLint** for JavaScript/TypeScript linting
  - **Stylelint** for CSS linting
  - **html-validator** for HTML validation
- **Input Validators** ensure data integrity before processing
- **Error Handlers** provide consistent error reporting

## Technical Decisions

1. **Use of Puppeteer**
   - Chosen for its comprehensive browser automation capabilities
   - Enables headless browser operations for screenshots and console logging
   - Provides a stable API for browser interaction

2. **Standard Linting Tools**
   - ESLint for JavaScript/TypeScript (industry standard)
   - Stylelint for CSS (widely adopted)
   - HTML validator for standards compliance

3. **Stdio Transport**
   - Simple, reliable communication channel
   - Compatible with various MCP clients
   - Low overhead for local operation

4. **TypeScript Implementation**
   - Strong typing for better code quality
   - Type predicates for runtime validation
   - Enhanced developer experience and maintainability
