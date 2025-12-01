// Minimal local mock for @google/genai used for offline builds / CI
class MockModels {
  constructor() {
    this.generateContent = async (params) => {
      // return a minimal structure similar to the GenAI SDK
      return { text: typeof params.contents === 'string' ? params.contents : (params.contents?.parts ? params.contents.parts.map(p => p.text || '').join('\n') : 'mock result') };
    };
    this.generateImages = async (params) => {
      return { generatedImages: [{ image: { imageBytes: 'mock-base64-image-bytes' } }] };
    };
  }
}

class GoogleGenAI {
  constructor(opts) {
    this.options = opts;
    this.models = new MockModels();
  }
}

const __genaiMock = {
  generateContent: async () => ({ text: 'mock' }),
  generateImages: async () => ({ generatedImages: [{ image: { imageBytes: 'mock' } }] }),
};

module.exports = { GoogleGenAI, __genaiMock };
