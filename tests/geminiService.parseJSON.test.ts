import { describe, it, expect } from 'vitest';
import { parseJSON } from '../services/geminiService';

describe('parseJSON()', () => {
  it('parses valid JSON string', () => {
    expect(parseJSON('{"a":1}')).toEqual({ a: 1 });
  });

  it('parses JSON wrapped in code block', () => {
    const text = '```json\n{ "name": "Test", "value": 123 }\n```';
    expect(parseJSON(text)).toEqual({ name: 'Test', value: 123 });
  });

  it('returns object for JSON inside text with noise', () => {
    const text = 'Here is the data: {"x": true, "y": [1,2,3]} and some text.';
    expect(parseJSON(text)).toEqual({ x: true, y: [1, 2, 3] });
  });

  it('safely returns {} on malformed JSON', () => {
    const text = 'not a json at all';
    expect(parseJSON(text)).toEqual({});
  });

  it('parses JSON array inside text', () => {
    const text = 'Items: ["one","two","three"]';
    expect(parseJSON(text)).toEqual(["one", "two", "three"]);
  });
});
