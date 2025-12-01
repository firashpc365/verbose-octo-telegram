declare module '@google/genai' {
  export class GoogleGenAI {
    constructor(options?: any);
    models: any;
    operations?: any;
  }
  export type GenerateContentResponse = any;
  export default GoogleGenAI;
}

declare module '@google/genai/web' {
  export * from '@google/genai';
}
