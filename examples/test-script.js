// This is a test script with some intentional issues for linting

function testFunction() {
  // Unused variable
  var unusedVar = 'This variable is never used';
  
  // Using var instead of const or let
  var count = 10;
  
  // Missing semicolon
  console.log('Count is', count)
  
  // Equality comparison without type checking
  if (count == '10') {
    console.log('Count is 10');
  }
  
  // Unreachable code
  return;
  console.log('This will never be executed');
}

// Unused function
function neverCalled() {
  console.log('This function is never called');
}

// Global variable
globalVar = 'This is a global variable';

// Calling the function
testFunction();
