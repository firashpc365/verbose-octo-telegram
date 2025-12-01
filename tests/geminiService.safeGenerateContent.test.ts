import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @google/genai before importing module under test.
vi.mock('@google/genai', () => {
  // A shared mock that tests can modify.
  const genMock: any = {
    generateContent: vi.fn()
  };
  return {
    GoogleGenAI: class {
      models: any;
      constructor() {
        this.models = genMock;
      }
    },
    __genaiMock: genMock
  };
});

import { safeGenerateContent, QuotaExceededError } from '../services/geminiService';
import { __genaiMock } from '@google/genai';

describe('safeGenerateContent', () => {
  beforeEach(() => {
    __genaiMock.generateContent.mockReset();
  });

  it('resolves with the API response on success', async () => {
    __genaiMock.generateContent.mockResolvedValue({ text: 'ok' });
    const res = await safeGenerateContent({});
    expect(res.text).toBe('ok');
  });

  it('throws QuotaExceededError on 429 error', async () => {
    __genaiMock.generateContent.mockRejectedValue({ status: 429, message: 'rate limit' });
    await expect(safeGenerateContent({})).rejects.toBeInstanceOf(QuotaExceededError);
  });
});
