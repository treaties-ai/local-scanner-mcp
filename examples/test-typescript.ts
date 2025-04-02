// This is a test TypeScript file with some intentional issues for linting

// Missing return type
function calculateSum(a: number, b: number) {
  return a + b;
}

// Unused parameter
function greet(name: string, age: number): string {
  return `Hello, ${name}!`;
}

// Any type usage
let someVariable: any = 'This could be anything';

// Implicit any in array
const mixedArray = ['string', 123, true];

// Unused variable
const unusedVariable: string = 'This is never used';

// Missing semicolon
const missingTerminator = 'Missing semicolon'

// Interface with optional properties
interface User {
  name: string;
  email: string;
  age?: number;
  address?: {
    street: string;
    city: string;
    zipCode: string;
  };
}

// Using the interface with missing type annotations
const user = {
  name: 'John Doe',
  email: 'john@example.com'
};

// Function call with correct usage
const sum = calculateSum(5, 10);
console.log(`The sum is: ${sum}`);

// Function call with unused result
greet('Alice', 30);
