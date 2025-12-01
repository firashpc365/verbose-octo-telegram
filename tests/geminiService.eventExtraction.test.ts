import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@google/genai', () => {
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

import { createEventFromInput } from '../services/geminiService';
import { __genaiMock } from '@google/genai';

describe('createEventFromInput', () => {
  beforeEach(() => {
    __genaiMock.generateContent.mockReset();
  });

  it('parses event data JSON returned by GenAI and returns eventData', async () => {
    const json = JSON.stringify({ name: 'Test Event', clientName: 'Acme Ltd', date: '2025-12-01', location: 'Riyadh', guestCount: 100, cost_tracker: [] });
    __genaiMock.generateContent.mockResolvedValue({ text: json });

    const { eventData } = await createEventFromInput({ text: 'Request: 100 guests, Riyadh, Dec 1', files: [] }, [], false);
    expect(eventData).toBeTruthy();
    expect(eventData.name).toBe('Test Event');
    expect(eventData.clientName).toBe('Acme Ltd');
  });
});
