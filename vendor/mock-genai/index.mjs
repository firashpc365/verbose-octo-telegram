class MockModels {
  constructor() {
    this.generateContent = async (params) => {
      return { text: typeof params.contents === 'string' ? params.contents : (params.contents?.parts ? params.contents.parts.map(p => p.text || '').join('\n') : 'mock result') };
    };
    this.generateImages = async (params) => {
      return { generatedImages: [{ image: { imageBytes: 'mock-base64-image-bytes' } }] };
    };
  }
}

export class GoogleGenAI {
  constructor(opts) {
    this.options = opts;
    this.models = new MockModels();
  }
}

export const __genaiMock = {
  generateContent: async () => ({ text: 'mock' }),
  generateImages: async () => ({ generatedImages: [{ image: { imageBytes: 'mock' } }] }),
};
