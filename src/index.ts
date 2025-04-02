#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import puppeteer from 'puppeteer';
import { ESLint } from 'eslint';
import stylelint from 'stylelint';
import htmlValidator from 'html-validator';
import axios from 'axios';

// Validate input parameters
const isValidScanLocalhostArgs = (
  args: any
): args is { 
  url: string; 
  waitTime?: number;
  actions?: Array<{
    type: 'click' | 'type' | 'wait';
    selector?: string;
    text?: string;
    time?: number;
  }>;
} =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.url === 'string' &&
  (args.url.startsWith('http://localhost') || args.url.startsWith('https://localhost')) &&
  (args.waitTime === undefined || typeof args.waitTime === 'number') &&
  (args.actions === undefined || Array.isArray(args.actions));

const isValidScreenshotLocalhostArgs = (
  args: any
): args is { 
  url: string; 
  fullPage?: boolean;
  waitTime?: number;
} =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.url === 'string' &&
  (args.url.startsWith('http://localhost') || args.url.startsWith('https://localhost')) &&
  (args.fullPage === undefined || typeof args.fullPage === 'boolean') &&
  (args.waitTime === undefined || typeof args.waitTime === 'number');

const isValidLintCodeArgs = (
  args: any
): args is {
  filePath: string;
  language?: 'javascript' | 'typescript' | 'css';
} =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.filePath === 'string' &&
  (args.language === undefined || 
   args.language === 'javascript' || 
   args.language === 'typescript' || 
   args.language === 'css');

const isValidValidateHtmlArgs = (
  args: any
): args is {
  source: string;
  isUrl?: boolean;
} =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.source === 'string' &&
  (args.isUrl === undefined || typeof args.isUrl === 'boolean');

class LocalScannerServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'local-scanner-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error: any) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    // Define the tools our MCP server provides
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'scan_localhost',
          description: 'Access a localhost URL, capture console logs, and check for runtime errors',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'Localhost URL to scan (must start with http://localhost or https://localhost)',
              },
              waitTime: {
                type: 'number',
                description: 'Time to wait in milliseconds after page load (default: 1000)',
              },
              actions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'string',
                      enum: ['click', 'type', 'wait'],
                      description: 'Type of action to perform',
                    },
                    selector: {
                      type: 'string',
                      description: 'CSS selector for click or type actions',
                    },
                    text: {
                      type: 'string',
                      description: 'Text to type for type actions',
                    },
                    time: {
                      type: 'number',
                      description: 'Time to wait in milliseconds for wait actions',
                    },
                  },
                  required: ['type'],
                },
                description: 'List of actions to perform on the page',
              },
            },
            required: ['url'],
          },
        },
        {
          name: 'screenshot_localhost',
          description: 'Take a screenshot of a localhost URL',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'Localhost URL to screenshot (must start with http://localhost or https://localhost)',
              },
              fullPage: {
                type: 'boolean',
                description: 'Whether to take a full page screenshot (default: false)',
              },
              waitTime: {
                type: 'number',
                description: 'Time to wait in milliseconds after page load (default: 1000)',
              },
            },
            required: ['url'],
          },
        },
        {
          name: 'lint_code',
          description: 'Lint JavaScript, TypeScript, or CSS code files',
          inputSchema: {
            type: 'object',
            properties: {
              filePath: {
                type: 'string',
                description: 'Path to the file to lint',
              },
              language: {
                type: 'string',
                enum: ['javascript', 'typescript', 'css'],
                description: 'Language of the file (default: auto-detect from file extension)',
              },
            },
            required: ['filePath'],
          },
        },
        {
          name: 'validate_html',
          description: 'Validate HTML content or URL for standards compliance',
          inputSchema: {
            type: 'object',
            properties: {
              source: {
                type: 'string',
                description: 'HTML content or URL to validate',
              },
              isUrl: {
                type: 'boolean',
                description: 'Whether the source is a URL (default: false)',
              },
            },
            required: ['source'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      switch (request.params.name) {
        case 'scan_localhost':
          return this.handleScanLocalhost(request.params.arguments);
        case 'screenshot_localhost':
          return this.handleScreenshotLocalhost(request.params.arguments);
        case 'lint_code':
          return this.handleLintCode(request.params.arguments);
        case 'validate_html':
          return this.handleValidateHtml(request.params.arguments);
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
  }

  // Handle the scan_localhost tool
  private async handleScanLocalhost(args: unknown) {
    if (!isValidScanLocalhostArgs(args)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Invalid scan_localhost arguments'
      );
    }

    const url = args.url;
    const waitTime = args.waitTime || 1000;
    const actions = args.actions || [];

    try {
      // Launch a headless browser
      const browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();
      
      // Collect console logs
      const logs: Array<{ type: string; message: string }> = [];
      page.on('console', (msg: any) => {
        logs.push({
          type: msg.type(),
          message: msg.text(),
        });
      });

      // Collect errors
      const errors: Array<string> = [];
      page.on('pageerror', (err: Error) => {
        errors.push(err.message);
      });

      // Navigate to the URL
      await page.goto(url, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(waitTime);

      // Perform actions if specified
      for (const action of actions) {
        switch (action.type) {
          case 'click':
            if (action.selector) {
              await page.click(action.selector);
            }
            break;
          case 'type':
            if (action.selector && action.text) {
              await page.type(action.selector, action.text);
            }
            break;
          case 'wait':
            await page.waitForTimeout(action.time || 1000);
            break;
        }
      }

      // Take a screenshot
      const screenshotBuffer = await page.screenshot({ encoding: 'binary' });
      const screenshotBase64 = screenshotBuffer.toString('base64');

      // Close the browser
      await browser.close();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              url,
              logs,
              errors,
              screenshot: `data:image/png;base64,${screenshotBase64}`,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error scanning localhost: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  // Handle the screenshot_localhost tool
  private async handleScreenshotLocalhost(args: unknown) {
    if (!isValidScreenshotLocalhostArgs(args)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Invalid screenshot_localhost arguments'
      );
    }

    const url = args.url;
    const fullPage = args.fullPage || false;
    const waitTime = args.waitTime || 1000;

    try {
      // Launch a headless browser
      const browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();

      // Navigate to the URL
      await page.goto(url, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(waitTime);

      // Take a screenshot
      const screenshotBuffer = await page.screenshot({ 
        encoding: 'binary',
        fullPage,
      });
      const screenshotBase64 = screenshotBuffer.toString('base64');

      // Close the browser
      await browser.close();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              url,
              screenshot: `data:image/png;base64,${screenshotBase64}`,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error taking screenshot: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  // Handle the lint_code tool
  private async handleLintCode(args: unknown) {
    if (!isValidLintCodeArgs(args)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Invalid lint_code arguments'
      );
    }

    const filePath = args.filePath;
    const fileExt = path.extname(filePath).toLowerCase();
    
    // Auto-detect language if not specified
    let language = args.language;
    if (!language) {
      if (fileExt === '.js') {
        language = 'javascript';
      } else if (fileExt === '.ts' || fileExt === '.tsx') {
        language = 'typescript';
      } else if (fileExt === '.css') {
        language = 'css';
      } else {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Cannot determine language for file extension: ${fileExt}`
        );
      }
    }

    try {
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (error) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `File not found: ${filePath}`
        );
      }

      // Read file content
      const fileContent = await fs.readFile(filePath, 'utf-8');

      if (language === 'css') {
        // Lint CSS with stylelint
        const result = await stylelint.lint({
          code: fileContent,
          config: {
            rules: {
              'color-no-invalid-hex': true,
              'font-family-no-duplicate-names': true,
              'function-calc-no-unspaced-operator': true,
              'unit-no-unknown': true,
              'block-no-empty': true,
              'selector-pseudo-class-no-unknown': true,
              'selector-pseudo-element-no-unknown': true,
              'selector-type-no-unknown': true,
              'media-feature-name-no-unknown': true,
              'at-rule-no-unknown': true,
              'comment-no-empty': true,
              'no-duplicate-selectors': true,
              'no-empty-source': true,
              'no-extra-semicolons': true,
              'no-invalid-double-slash-comments': true,
              'declaration-block-no-duplicate-properties': true,
            },
          },
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                filePath,
                language,
                warnings: result.results[0]?.warnings || [],
                errored: result.errored,
              }, null, 2),
            },
          ],
        };
      } else {
        // Lint JavaScript/TypeScript with ESLint
        const eslintOptions: { overrideConfigFile?: string } = {};
        
        // Use TypeScript-specific config for TypeScript files
        if (language === 'typescript') {
          const tsConfigPath = path.join(path.dirname(filePath), '.eslintrc-typescript.json');
          try {
            await fs.access(tsConfigPath);
            eslintOptions.overrideConfigFile = tsConfigPath;
          } catch (error) {
            // TypeScript config not found, continue with default
          }
        }
        
        const eslint = new ESLint(eslintOptions);

        const results = await eslint.lintText(fileContent, {
          filePath,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                filePath,
                language,
                results: results[0]?.messages || [],
                errorCount: results[0]?.errorCount || 0,
                warningCount: results[0]?.warningCount || 0,
              }, null, 2),
            },
          ],
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error linting code: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  // Handle the validate_html tool
  private async handleValidateHtml(args: unknown) {
    if (!isValidValidateHtmlArgs(args)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Invalid validate_html arguments'
      );
    }

    const source = args.source;
    const isUrl = args.isUrl || false;

    try {
      let html: string;
      
      if (isUrl) {
        // If source is a URL, fetch the HTML content
        if (source.startsWith('http://localhost') || source.startsWith('https://localhost')) {
          // For localhost URLs, use puppeteer to get the rendered HTML
          const browser = await puppeteer.launch({ headless: 'new' });
          const page = await browser.newPage();
          await page.goto(source, { waitUntil: 'networkidle0' });
          html = await page.content();
          await browser.close();
        } else {
          // For external URLs, use axios
          const response = await axios.get(source);
          html = response.data;
        }
      } else {
        // Check if source is a file path
        if (source.includes('/') || source.includes('\\')) {
          try {
            await fs.access(source);
            html = await fs.readFile(source, 'utf-8');
          } catch (error) {
            // If not a file, treat as HTML content
            html = source;
          }
        } else {
          // Treat as HTML content
          html = source;
        }
      }

      // Validate HTML
      const result = await htmlValidator({
        data: html,
        format: 'json',
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              source,
              isUrl,
              valid: result.valid,
              messages: result.messages,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error validating HTML: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  // Start the MCP server
  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Local Scanner MCP server running on stdio');
  }
}

// Create and run the server
const server = new LocalScannerServer();
server.run().catch(console.error);
