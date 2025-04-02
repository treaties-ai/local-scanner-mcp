#!/usr/bin/env node
/**
 * This is an example script that demonstrates how to use the Local Scanner MCP Server
 * for linting code and validating HTML.
 */

console.log('Local Scanner MCP Server - Validation Examples');
console.log('==============================================');
console.log('');
console.log('This script demonstrates how to use the lint_code and validate_html tools');
console.log('with the test files in the examples directory.');
console.log('');

// Example 1: Lint JavaScript
console.log('--- Example 1: Lint JavaScript ---');
console.log('Command:');
console.log('mcp-client local-scanner lint_code {"filePath": "examples/test-script.js"}');
console.log('');
console.log('This would lint the JavaScript file and report issues such as:');
console.log('- Unused variables (unusedVar, neverCalled function)');
console.log('- Missing semicolons');
console.log('- Use of == instead of ===');
console.log('- Unreachable code');
console.log('- Global variable declaration without var/let/const');
console.log('');

// Example 2: Lint CSS
console.log('--- Example 2: Lint CSS ---');
console.log('Command:');
console.log('mcp-client local-scanner lint_code {"filePath": "examples/test-styles.css", "language": "css"}');
console.log('');
console.log('This would lint the CSS file and report issues such as:');
console.log('- Invalid hex color (#XYZ)');
console.log('- Duplicate properties (margin)');
console.log('- Empty blocks (.empty-block)');
console.log('- Unknown units (50pixels)');
console.log('- Missing semicolons');
console.log('- Unknown pseudo-classes (:unknown-pseudo-class)');
console.log('- Duplicate selectors (.duplicate-selector)');
console.log('');

// Example 3: Lint TypeScript
console.log('--- Example 3: Lint TypeScript ---');
console.log('Command:');
console.log('mcp-client local-scanner lint_code {"filePath": "examples/test-typescript.ts", "language": "typescript"}');
console.log('');
console.log('This would lint the TypeScript file and report issues such as:');
console.log('- Missing return type annotations');
console.log('- Unused parameters (age in greet function)');
console.log('- Use of any type');
console.log('- Unused variables (unusedVariable)');
console.log('- Missing semicolons');
console.log('- Missing type annotations');
console.log('');

// Example 4: Validate HTML
console.log('--- Example 4: Validate HTML ---');
console.log('Command:');
console.log('mcp-client local-scanner validate_html {"source": "examples/test-invalid.html"}');
console.log('');
console.log('This would validate the HTML file and report issues such as:');
console.log('- Missing lang attribute on html element');
console.log('- Missing charset meta tag');
console.log('- Obsolete tags (center, font)');
console.log('- Missing alt attribute on img element');
console.log('- Unclosed tags');
console.log('- Mismatched tags');
console.log('- Duplicate IDs');
console.log('- Invalid attributes');
console.log('- Missing required attributes');
console.log('- Nested forms (not allowed)');
console.log('- Invalid nesting of elements');
console.log('');

console.log('Note: These are example commands. To actually run them, you would need an MCP client.');
