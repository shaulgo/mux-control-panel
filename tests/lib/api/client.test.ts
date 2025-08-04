import {
  buildSearchParams,
  clientResultToError,
  safeFetch,
} from '@/lib/api/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('safeFetch', () => {
    const testSchema = z.union([
      z.object({ ok: z.literal(true), data: z.string() }),
      z.object({
        ok: z.literal(false),
        error: z.object({ code: z.string(), message: z.string() }),
      }),
    ]);

    it('should handle successful API responses', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ ok: true, data: 'success' }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await safeFetch('/api/test', {
        method: 'GET',
        responseSchema: testSchema,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toBe('success');
      }
    });

    it('should handle API error responses', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          ok: false,
          error: { code: 'NOT_FOUND', message: 'Resource not found' },
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await safeFetch('/api/test', {
        method: 'GET',
        responseSchema: testSchema,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('API_ERROR');
        if (result.error.type === 'API_ERROR') {
          expect(result.error.code).toBe('NOT_FOUND');
          expect(result.error.message).toBe('Resource not found');
        }
      }
    });

    it('should handle HTTP errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValue({
          ok: false,
          error: { code: 'NOT_FOUND', message: 'Not found' },
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await safeFetch('/api/test', {
        method: 'GET',
        responseSchema: testSchema,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        // When response has valid JSON with API error structure, it becomes API_ERROR
        expect(result.error.type).toBe('API_ERROR');
        if (result.error.type === 'API_ERROR') {
          expect(result.error.code).toBe('NOT_FOUND');
        }
      }
    });

    it('should handle invalid JSON responses', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await safeFetch('/api/test', {
        method: 'GET',
        responseSchema: testSchema,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('HTTP_ERROR');
        expect(result.error.message).toContain('Invalid JSON response');
      }
    });

    it('should handle validation errors', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ invalid: 'structure' }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await safeFetch('/api/test', {
        method: 'GET',
        responseSchema: testSchema,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toContain('Invalid response format');
      }
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await safeFetch('/api/test', {
        method: 'GET',
        responseSchema: testSchema,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('NETWORK_ERROR');
        expect(result.error.message).toBe('Network error');
      }
    });

    it('should include request headers', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ ok: true, data: 'success' }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await safeFetch('/api/test', {
        method: 'POST',
        headers: { 'Custom-Header': 'value' },
        responseSchema: testSchema,
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Custom-Header': 'value',
        },
      });
    });
  });

  describe('buildSearchParams', () => {
    it('should build search params from object', () => {
      const params = {
        page: 1,
        limit: 25,
        search: 'test query',
        enabled: true,
      };

      const result = buildSearchParams(params);
      const urlParams = new URLSearchParams(result);

      expect(urlParams.get('page')).toBe('1');
      expect(urlParams.get('limit')).toBe('25');
      expect(urlParams.get('search')).toBe('test query');
      expect(urlParams.get('enabled')).toBe('true');
    });

    it('should skip undefined values', () => {
      const params = {
        page: 1,
        limit: undefined,
        search: 'test',
      };

      const result = buildSearchParams(params);
      const urlParams = new URLSearchParams(result);

      expect(urlParams.get('page')).toBe('1');
      expect(urlParams.get('limit')).toBeNull();
      expect(urlParams.get('search')).toBe('test');
    });

    it('should handle empty object', () => {
      const result = buildSearchParams({});
      expect(result).toBe('');
    });
  });

  describe('clientResultToError', () => {
    it('should convert API_ERROR to Error', () => {
      const clientResult = {
        ok: false as const,
        error: {
          type: 'API_ERROR' as const,
          code: 'NOT_FOUND',
          message: 'Resource not found',
        },
      };

      const error = clientResultToError(clientResult);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('NOT_FOUND: Resource not found');
    });

    it('should convert HTTP_ERROR to Error', () => {
      const clientResult = {
        ok: false as const,
        error: {
          type: 'HTTP_ERROR' as const,
          status: 500,
          message: 'Internal server error',
        },
      };

      const error = clientResultToError(clientResult);
      expect(error.message).toBe('HTTP 500: Internal server error');
    });

    it('should convert VALIDATION_ERROR to Error', () => {
      const clientResult = {
        ok: false as const,
        error: {
          type: 'VALIDATION_ERROR' as const,
          message: 'Invalid input',
        },
      };

      const error = clientResultToError(clientResult);
      expect(error.message).toBe('Validation Error: Invalid input');
    });

    it('should convert NETWORK_ERROR to Error', () => {
      const clientResult = {
        ok: false as const,
        error: {
          type: 'NETWORK_ERROR' as const,
          message: 'Connection failed',
        },
      };

      const error = clientResultToError(clientResult);
      expect(error.message).toBe('Network Error: Connection failed');
    });

    it('should throw when called with successful result', () => {
      const successResult = { ok: true as const, data: 'success' };

      expect(() => {
        clientResultToError(successResult);
      }).toThrow('Cannot convert successful result to error');
    });
  });
});

describe('Property-based tests for API client', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should maintain type safety across different data types', async () => {
    const stringSchema = z.union([
      z.object({ ok: z.literal(true), data: z.string() }),
      z.object({
        ok: z.literal(false),
        error: z.object({ code: z.string(), message: z.string() }),
      }),
    ]);

    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ ok: true, data: 'test' }),
    };
    mockFetch.mockResolvedValue(mockResponse);

    const result = await safeFetch('/api/test', {
      method: 'GET',
      responseSchema: stringSchema,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toBe('test');
    }
  });

  it('should handle various error scenarios consistently', async () => {
    const schema = z.union([
      z.object({ ok: z.literal(true), data: z.string() }),
      z.object({
        ok: z.literal(false),
        error: z.object({ code: z.string(), message: z.string() }),
      }),
    ]);

    const errorScenarios = [
      {
        name: 'API Error',
        response: {
          ok: true,
          json: () =>
            Promise.resolve({
              ok: false,
              error: { code: 'ERROR', message: 'Test error' },
            }),
        },
        expectedType: 'API_ERROR',
      },
      {
        name: 'HTTP Error with API structure',
        response: {
          ok: false,
          status: 400,
          json: () =>
            Promise.resolve({
              ok: false,
              error: { code: 'BAD_REQUEST', message: 'Bad request' },
            }),
        },
        expectedType: 'API_ERROR', // This becomes API_ERROR because JSON parsing succeeds and structure is valid
      },
      {
        name: 'JSON Parse Error',
        response: {
          ok: true,
          status: 200,
          json: () => Promise.reject(new Error('Parse error')),
        },
        expectedType: 'HTTP_ERROR',
      },
    ];

    for (const scenario of errorScenarios) {
      mockFetch.mockResolvedValue(scenario.response);

      const result = await safeFetch('/api/test', {
        method: 'GET',
        responseSchema: schema,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe(scenario.expectedType);
      }
    }
  });

  it('should preserve query parameter types', () => {
    const testCases = [
      {
        input: { str: 'hello', num: 42, bool: true },
        expected: 'str=hello&num=42&bool=true',
      },
      {
        input: { empty: '', zero: 0, falsy: false },
        expected: 'empty=&zero=0&falsy=false',
      },
      { input: { undef: undefined }, expected: '' },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = buildSearchParams(input);
      expect(result).toBe(expected);
    });
  });
});
