import {
  assetListResponseSchema,
  assetQuerySchema,
  createAssetSchema,
  directUploadSchema,
  uploadResponseSchema,
  uploadUrlsSchema,
  usageQuerySchema,
  usageResponseSchema,
} from '@/lib/validations/upload';
import { describe, expect, it } from 'vitest';

describe('Upload Validation Schemas', () => {
  describe('uploadUrlsSchema', () => {
    it('should validate single URL', () => {
      const input = { urls: 'https://example.com/video.mp4' };
      const result = uploadUrlsSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.urls).toEqual(['https://example.com/video.mp4']);
      }
    });

    it('should validate multiple URLs', () => {
      const input = {
        urls: `https://example.com/video1.mp4
               https://example.com/video2.mp4
               https://example.com/video3.mp4`,
      };
      const result = uploadUrlsSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.urls).toHaveLength(3);
        expect(result.data.urls[0]).toBe('https://example.com/video1.mp4');
      }
    });

    it('should reject invalid URLs', () => {
      const input = { urls: 'not-a-url' };
      const result = uploadUrlsSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject empty string', () => {
      const input = { urls: '' };
      const result = uploadUrlsSchema.safeParse(input);

      expect(result.success).toBe(false);
    });

    it('should reject too many URLs', () => {
      const urls = Array.from(
        { length: 11 },
        (_, i) => `https://example.com/video${i}.mp4`
      ).join('\n');
      const input = { urls };
      const result = uploadUrlsSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });

  describe('createAssetSchema', () => {
    it('should validate minimal asset creation', () => {
      const input = { input: 'https://example.com/video.mp4' };
      const result = createAssetSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('should validate asset creation with all options', () => {
      const input = {
        input: 'https://example.com/video.mp4',
        playback_policy: ['public', 'signed'],
        mp4_support: 'standard',
        passthrough: 'custom-data',
      };
      const result = createAssetSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('should reject invalid playback policy', () => {
      const input = {
        input: 'https://example.com/video.mp4',
        playback_policy: ['invalid'],
      };
      const result = createAssetSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });

  describe('directUploadSchema', () => {
    it('should validate empty direct upload request', () => {
      const input = {};
      const result = directUploadSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('should validate direct upload with settings', () => {
      const input = {
        cors_origin: 'https://myapp.com',
        new_asset_settings: {
          playback_policy: ['public'],
          encoding_tier: 'smart',
          max_resolution_tier: '1080p',
          normalize_audio: false,
        },
      };
      const result = directUploadSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it('should apply defaults', () => {
      const input = { new_asset_settings: {} };
      const result = directUploadSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.new_asset_settings?.playback_policy).toEqual([
          'public',
        ]);
        expect(result.data.new_asset_settings?.encoding_tier).toBe('smart');
        expect(result.data.new_asset_settings?.normalize_audio).toBe(true);
      }
    });
  });

  describe('Query parameter schemas', () => {
    describe('assetQuerySchema', () => {
      it('should apply defaults', () => {
        const result = assetQuerySchema.safeParse({});

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.page).toBe(1);
          expect(result.data.limit).toBe(25);
        }
      });

      it('should validate custom values', () => {
        const input = { page: '2', limit: '50', search: 'test' };
        const result = assetQuerySchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.page).toBe(2);
          expect(result.data.limit).toBe(50);
          expect(result.data.search).toBe('test');
        }
      });

      it('should enforce limits', () => {
        const input = { page: '0', limit: '200' };
        const result = assetQuerySchema.safeParse(input);

        expect(result.success).toBe(false);
      });
    });

    describe('usageQuerySchema', () => {
      it('should default period to 30', () => {
        const result = usageQuerySchema.safeParse({});

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.period).toBe(30);
        }
      });

      it('should enforce period limits', () => {
        const tooLow = usageQuerySchema.safeParse({ period: '0' });
        const tooHigh = usageQuerySchema.safeParse({ period: '400' });

        expect(tooLow.success).toBe(false);
        expect(tooHigh.success).toBe(false);
      });
    });
  });

  describe('Response schemas', () => {
    describe('assetListResponseSchema', () => {
      it('should validate successful asset list response', () => {
        const response = {
          ok: true,
          data: {
            data: [
              {
                id: 'asset-123',
                status: 'ready',
                created_at: '2023-01-01T00:00:00Z',
                duration: 120,
                playback_ids: [{ id: 'playback-123', policy: 'public' }],
              },
            ],
            pagination: {
              page: 1,
              limit: 25,
              total: 1,
              hasMore: false,
            },
          },
        };

        const result = assetListResponseSchema.safeParse(response);
        expect(result.success).toBe(true);
      });

      it('should validate error response', () => {
        const response = {
          ok: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Assets not found',
          },
        };

        const result = assetListResponseSchema.safeParse(response);
        expect(result.success).toBe(true);
      });
    });

    describe('uploadResponseSchema', () => {
      it('should validate upload results', () => {
        const response = {
          ok: true,
          data: {
            results: [
              {
                url: 'https://example.com/video.mp4',
                success: true,
                asset: {
                  id: 'asset-123',
                  status: 'preparing',
                  created_at: '2023-01-01T00:00:00Z',
                },
              },
              {
                url: 'https://example.com/invalid.mp4',
                success: false,
                error: 'Invalid format',
              },
            ],
          },
        };

        const result = uploadResponseSchema.safeParse(response);
        expect(result.success).toBe(true);
      });
    });

    describe('usageResponseSchema', () => {
      it('should validate usage data structure', () => {
        const response = {
          ok: true,
          data: {
            currentMonth: {
              encoding: { used: 100, limit: 1000, cost: 5.0 },
              streaming: { used: 500, limit: 5000, cost: 10.0 },
              storage: { used: 1024, limit: 10240, cost: 2.0 },
            },
            recentUsage: [
              {
                date: '2023-01-01',
                encoding: 10,
                streaming: 50,
                storage: 100,
                cost: 1.5,
              },
            ],
            growth: {
              percentage: 15.5,
              isPositive: true,
            },
            totalCost: 17.5,
          },
        };

        const result = usageResponseSchema.safeParse(response);
        expect(result.success).toBe(true);
      });
    });
  });
});

describe('Property-based tests for schemas', () => {
  it('should handle various string inputs for URL validation', () => {
    const validUrls = [
      'https://example.com/video.mp4',
      'http://test.com/file.mov',
      'https://cdn.example.com/path/to/video.webm',
      'https://s3.amazonaws.com/bucket/video.mp4',
    ];

    validUrls.forEach(url => {
      const result = uploadUrlsSchema.safeParse({ urls: url });
      expect(result.success).toBe(true);
    });
  });

  it('should handle edge cases for numeric parameters', () => {
    const edgeCases = [
      { page: 1, limit: 1 }, // Minimum values
      { page: 999999, limit: 100 }, // Maximum values
      { page: '1', limit: '25' }, // String coercion
    ];

    edgeCases.forEach(input => {
      const result = assetQuerySchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  it('should reject malformed API responses', () => {
    const malformedResponses = [
      { ok: 'yes' }, // Wrong type for ok
      { ok: true }, // Missing data
      { ok: false }, // Missing error
      { ok: true, data: 'not-an-object' }, // Wrong data type
      { ok: false, error: 'string-error' }, // Wrong error type
    ];

    malformedResponses.forEach(response => {
      const result = assetListResponseSchema.safeParse(response);
      expect(result.success).toBe(false);
    });
  });

  it('should maintain schema invariants across transformations', () => {
    // Test that URL parsing and transformation maintains list structure
    const multilineInput = {
      urls: `https://example.com/1.mp4

      https://example.com/2.mp4
      
      https://example.com/3.mp4`,
    };

    const result = uploadUrlsSchema.safeParse(multilineInput);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.urls).toHaveLength(3);
      expect(result.data.urls.every(url => url.startsWith('https://'))).toBe(
        true
      );
    }
  });
});
