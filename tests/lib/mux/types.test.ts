import type { Result } from '@/lib/mux/types';
import {
  Err,
  Ok,
  assetId,
  isAssetErrored,
  isAssetPreparing,
  isAssetReady,
} from '@/lib/mux/types';
import { describe, expect, it } from 'vitest';

describe('Result Functions', () => {
  describe('Ok', () => {
    it('should create a successful result', () => {
      const data = { message: 'success' };
      const result = Ok(data);

      expect(result.ok).toBe(true);
      expect(result.data).toEqual(data);
    });

    it('should preserve the data type', () => {
      const stringResult = Ok('test');
      const numberResult = Ok(42);
      const objectResult = Ok({ foo: 'bar' });

      expect(stringResult.data).toBe('test');
      expect(numberResult.data).toBe(42);
      expect(objectResult.data).toEqual({ foo: 'bar' });
    });
  });

  describe('Err', () => {
    it('should create an error result with code only', () => {
      const result = Err('NOT_FOUND');

      expect(result.ok).toBe(false);
      expect(result.error.code).toBe('NOT_FOUND');
      expect(result.error.message).toBe('NOT_FOUND');
    });

    it('should create an error result with code and message', () => {
      const result = Err('NOT_FOUND', 'Resource not found');

      expect(result.ok).toBe(false);
      expect(result.error.code).toBe('NOT_FOUND');
      expect(result.error.message).toBe('Resource not found');
    });
  });

  describe('Result type guards', () => {
    it('should properly type guard successful results', () => {
      const successResult: Result<string, 'ERROR'> = Ok('success');
      const errorResult: Result<string, 'ERROR'> = Err('ERROR');

      // successResult.ok is always true for Ok(...); assert directly without conditional
      expect(successResult.ok).toBe(true);
      expect(successResult.data).toBe('success');
      // TypeScript should know this is Ok<string>
      expect(typeof successResult.data).toBe('string');

      // errorResult.ok is always false for Err(...); assert directly without conditional
      expect(errorResult.ok).toBe(false);
      expect(errorResult.error.code).toBe('ERROR');
      // TypeScript should know this is Err<'ERROR'>
      expect(errorResult.error.code).toBe('ERROR');
    });
  });
});

describe('AssetId Functions', () => {
  describe('assetId', () => {
    it('should create a branded AssetId from string', () => {
      const id = assetId('asset-123');

      expect(id).toBe('asset-123');
      // TypeScript compiler ensures this is branded as AssetId
    });
  });
});

describe('Asset Status Type Guards', () => {
  describe('isAssetReady', () => {
    it('should return true for ready assets', () => {
      const asset = { status: 'ready' as const };
      expect(isAssetReady(asset)).toBe(true);
    });

    it('should return false for non-ready assets', () => {
      const preparingAsset = { status: 'preparing' as const };
      const erroredAsset = { status: 'errored' as const };

      expect(isAssetReady(preparingAsset)).toBe(false);
      expect(isAssetReady(erroredAsset)).toBe(false);
    });
  });

  describe('isAssetErrored', () => {
    it('should return true for errored assets', () => {
      const asset = { status: 'errored' as const };
      expect(isAssetErrored(asset)).toBe(true);
    });

    it('should return false for non-errored assets', () => {
      const readyAsset = { status: 'ready' as const };
      const preparingAsset = { status: 'preparing' as const };

      expect(isAssetErrored(readyAsset)).toBe(false);
      expect(isAssetErrored(preparingAsset)).toBe(false);
    });
  });

  describe('isAssetPreparing', () => {
    it('should return true for preparing assets', () => {
      const asset = { status: 'preparing' as const };
      expect(isAssetPreparing(asset)).toBe(true);
    });

    it('should return false for non-preparing assets', () => {
      const readyAsset = { status: 'ready' as const };
      const erroredAsset = { status: 'errored' as const };

      expect(isAssetPreparing(readyAsset)).toBe(false);
      expect(isAssetPreparing(erroredAsset)).toBe(false);
    });
  });
});

describe('Property-based tests', () => {
  it('should maintain Result invariants', () => {
    // Test that Ok results are always ok=true
    const values = ['string', 42, { obj: true }, null, undefined];

    values.forEach(value => {
      const result = Ok(value);
      expect(result.ok).toBe(true);
      expect(result.data).toBe(value);
    });
  });

  it('should maintain Err invariants', () => {
    const codes = ['ERROR', 'NOT_FOUND', 'VALIDATION_FAILED'];
    const messages = ['Custom message', undefined];

    codes.forEach(code => {
      messages.forEach(message => {
        const result = message ? Err(code, message) : Err(code);
        expect(result.ok).toBe(false);
        expect(result.error.code).toBe(code);
        expect(result.error.message).toBe(message ?? code);
      });
    });
  });

  it('should maintain AssetId branding', () => {
    const testIds = ['asset-1', 'asset-123', 'very-long-asset-id-with-dashes'];

    testIds.forEach(id => {
      const assetIdValue = assetId(id);
      expect(assetIdValue).toBe(id);
      // The branded type is enforced at compile time
    });
  });
});
