import { describe, it, expect, vi } from 'vitest';

import * as geminiService from '../services/geminiService';

describe('mock behavior (ai vs mock_data)', () => {
  it('returns ai source by default', async () => {
    // spy and mock underlying generation to return a simple text
    vi.spyOn(geminiService, 'safeGenerateContent').mockResolvedValue({ text: 'result text' } as any);
    const { result, fullPrompt, source } = await geminiService.getAIServiceAssistance('description', { name: 'My Service' } as any, {}, []);
    expect(source).toBe('ai');
  });

  it('can simulate mock_data source (fallback) by overriding implementation', async () => {
    vi.spyOn(geminiService, 'getAIServiceAssistance').mockResolvedValue({ result: 'fallback', fullPrompt: 'fallback', source: 'mock_data' } as any);
    const res = await geminiService.getAIServiceAssistance('description', { name: 'My Service' } as any, {}, []);
    expect(res.source).toBe('mock_data');
  });
});
