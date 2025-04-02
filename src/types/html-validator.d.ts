declare module 'html-validator' {
  interface ValidatorOptions {
    url?: string;
    data?: string;
    format?: 'json' | 'text' | 'html';
    validator?: string;
    isLocal?: boolean;
    isFragment?: boolean;
  }

  interface ValidationResult {
    messages: Array<{
      type: string;
      lastLine: number;
      lastColumn: number;
      firstColumn: number;
      message: string;
      extract: string;
      hiliteStart: number;
      hiliteLength: number;
    }>;
    valid: boolean;
  }

  function validator(options: ValidatorOptions): Promise<ValidationResult>;
  
  export default validator;
}
