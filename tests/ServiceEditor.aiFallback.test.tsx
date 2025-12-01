import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use the actual module but stub getAIServiceAssistance to throw QuotaExceededError
vi.mock('../services/geminiService', async () => {
  const actual = await vi.importActual('../services/geminiService');
  return {
    ...actual,
    getAIServiceAssistance: vi.fn()
  };
});

import { ServiceEditor } from '../components/ServiceEditor';
import type { ServiceItem } from '../../types';
import { getAIServiceAssistance, QuotaExceededError } from '../services/geminiService';
import { DEFAULT_APP_STATE } from '../constants';

describe('ServiceEditor AI fallback behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls onAIFallback(true) when QuotaExceededError occurs', async () => {
    const sampleService: ServiceItem = {
      id: 'svc-1',
      name: 'Test Service',
      description: '',
      category: 'Catering',
      basePrice: 100,
      status: 'Active',
      createdAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString()
    };

    // Make the mocked function throw QuotaExceededError
    (getAIServiceAssistance as any).mockRejectedValue(new QuotaExceededError('rate limit', 60));

    const onClose = vi.fn();
    const onSave = vi.fn();
    const setError = vi.fn();
    const onLogAIInteraction = vi.fn();
    const onAIFallback = vi.fn();

    render(
      <ServiceEditor
        service={sampleService}
        allServices={[]}
        onClose={onClose}
        onSave={onSave}
        setError={setError}
        onLogAIInteraction={onLogAIInteraction}
        settings={DEFAULT_APP_STATE.settings}
        onAIFallback={onAIFallback}
      />
    );

    // The category suggest button has title="Suggest Category"
    const categoryBtn = screen.getByTitle('Suggest Category');
    fireEvent.click(categoryBtn);

    // Wait a tick for promise catch
    await new Promise(r => setTimeout(r, 20));

    expect(onAIFallback).toHaveBeenCalled();
    expect(onAIFallback).toHaveBeenCalledWith(true);
  });
});
