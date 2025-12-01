import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/geminiService', async () => {
  const actual = await vi.importActual('../services/geminiService');
  return {
    ...actual,
    generateCustomImage: vi.fn()
  };
});

import { ImageGenerator } from '../components/features/ImageGenerator';
import { generateCustomImage, QuotaExceededError } from '../services/geminiService';

describe('ImageGenerator AI fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls onAIFallback(true) when generateCustomImage throws QuotaExceededError', async () => {
    (generateCustomImage as any).mockRejectedValue(new QuotaExceededError('rate limit', 60));

    const onClose = vi.fn();
    const setError = vi.fn();
    const onLogAIInteraction = vi.fn();
    const onAIFallback = vi.fn();

    render(<ImageGenerator onClose={onClose} setError={setError} onLogAIInteraction={onLogAIInteraction as any} onAIFallback={onAIFallback} />);

    // Generate button text 'Generate Image'
    const generateBtn = screen.getByText(/Generate Image/i);
    fireEvent.click(generateBtn);

    await waitFor(() => expect(onAIFallback).toHaveBeenCalledWith(true));
  });
});
