/**
 * Type-level tests for critical type contracts
 * These tests run at compile time to ensure type safety
 *
 * Note: This file uses `.test-d.ts` extension to indicate it contains type-only tests
 * that are validated at compile time, not runtime tests.
 */

import { expectTypeOf } from 'expect-type';
import type { z } from 'zod';

// Domain types
import type { AssetId, AssetStatus, Result } from '../../lib/mux/types';
import { Err, Ok } from '../../lib/mux/types';

// API client types
import type { ClientResult, FetchError } from '../../lib/api/client';
import { safeFetch } from '../../lib/api/client';

// Validation schemas
import {
  type assetListResponseSchema,
  type directUploadSchema,
  uploadResponseSchema,
  type uploadUrlsSchema,
} from '../../lib/validations/upload';

/**
 * Result<T, E> Type Contract Tests
 */

// Result should be a discriminated union with proper error structure
type TestResult = Result<string, 'TEST_ERROR'>;

expectTypeOf<TestResult>().toEqualTypeOf<
  | { ok: true; data: string }
  | { ok: false; error: { code: 'TEST_ERROR'; message: string } }
>();

// Ok constructor should return correct type
const okResult = Ok('success');
expectTypeOf(okResult).toEqualTypeOf<{ ok: true; data: string }>();
expectTypeOf(okResult.ok).toEqualTypeOf<true>();
expectTypeOf(okResult.data).toEqualTypeOf<string>();

// Err constructor should return correct type
const errResult = Err('TEST_ERROR', 'Test failed');
expectTypeOf(errResult).toEqualTypeOf<{
  ok: false;
  error: { code: 'TEST_ERROR'; message: string };
}>();
expectTypeOf(errResult.ok).toEqualTypeOf<false>();
expectTypeOf(errResult.error.code).toEqualTypeOf<'TEST_ERROR'>();
expectTypeOf(errResult.error.message).toEqualTypeOf<string>();

// Complex generic types
type ComplexData = { id: number; name: string; items: string[] };
type ComplexResult = Result<ComplexData, 'COMPLEX_ERROR'>;

expectTypeOf<ComplexResult>().toEqualTypeOf<
  | { ok: true; data: ComplexData }
  | { ok: false; error: { code: 'COMPLEX_ERROR'; message: string } }
>();

/**
 * Branded Type Contract Tests
 */

// AssetId should be branded string type
expectTypeOf<AssetId>().toMatchTypeOf<string>();
expectTypeOf<AssetId>().not.toEqualTypeOf<string>();

// Regular strings should not be assignable to AssetId
const regularString = 'asset_123';
expectTypeOf(regularString).not.toEqualTypeOf<AssetId>();

// Different branded string types should not be assignable to each other
type UserId = string & { readonly __brand: 'UserId' };
expectTypeOf<AssetId>().not.toEqualTypeOf<UserId>();
expectTypeOf<UserId>().not.toEqualTypeOf<AssetId>();

/**
 * Asset Status Discriminated Union Tests
 */

expectTypeOf<AssetStatus>().toEqualTypeOf<'preparing' | 'ready' | 'errored'>();

// Should not accept other string values
expectTypeOf<'invalid'>().not.toEqualTypeOf<AssetStatus>();
expectTypeOf<string>().not.toEqualTypeOf<AssetStatus>();

/**
 * API Client Error Type Contract Tests
 */

type TestClientResult = ClientResult<{ data: string }>;

expectTypeOf<TestClientResult>().toEqualTypeOf<
  { ok: true; data: { data: string } } | { ok: false; error: FetchError }
>();

// FetchError should be a discriminated union
expectTypeOf<FetchError>().toEqualTypeOf<
  | { type: 'NETWORK_ERROR'; message: string }
  | { type: 'VALIDATION_ERROR'; message: string }
  | { type: 'API_ERROR'; code: string; message: string }
  | { type: 'HTTP_ERROR'; status: number; message: string }
>();

/**
 * safeFetch Function Type Contract Tests
 */

const testSchema = uploadResponseSchema;
type SchemaType = z.infer<typeof testSchema>;

const fetchResult = safeFetch('/api/test', {
  method: 'GET',
  responseSchema: testSchema,
});

// Should return Promise of ClientResult with extracted data type
expectTypeOf(fetchResult).toEqualTypeOf<
  Promise<ClientResult<Extract<SchemaType, { ok: true }>['data']>>
>();

// Should infer response type from schema
const uploadResult = safeFetch('/api/upload', {
  method: 'POST',
  responseSchema: uploadResponseSchema,
});

expectTypeOf(uploadResult).resolves.toMatchTypeOf<
  ClientResult<{ results: Array<{ url: string; success: boolean }> }>
>();

/**
 * Validation Schema Type Contract Tests
 */

// Upload URLs schema types
type UploadUrlsInput = z.input<typeof uploadUrlsSchema>;
type UploadUrlsOutput = z.output<typeof uploadUrlsSchema>;

expectTypeOf<UploadUrlsInput>().toEqualTypeOf<{
  urls: string;
}>();

expectTypeOf<UploadUrlsOutput>().toEqualTypeOf<{
  urls: string[];
}>();

// Direct upload schema types
type DirectUploadInput = z.infer<typeof directUploadSchema>;

expectTypeOf<DirectUploadInput>().toEqualTypeOf<{
  cors_origin?: string;
  new_asset_settings?: {
    playback_policy: Array<'public' | 'signed'>;
    encoding_tier: 'baseline' | 'smart';
    max_resolution_tier?: '1080p' | '1440p' | '2160p';
    normalize_audio: boolean;
    passthrough?: string;
  };
}>();

// Upload response schema types should be discriminated union
type UploadResponse = z.infer<typeof uploadResponseSchema>;

expectTypeOf<UploadResponse>().toMatchTypeOf<
  { ok: true; data: object } | { ok: false; error: object }
>();

// Asset list response schema types
type AssetListResponse = z.infer<typeof assetListResponseSchema>;

expectTypeOf<AssetListResponse>().toMatchTypeOf<
  { ok: true; data: object } | { ok: false; error: object }
>();

/**
 * Function Signature Type Contract Tests
 */

expectTypeOf(Ok).toBeFunction();
expectTypeOf(Ok<string>)
  .parameter(0)
  .toEqualTypeOf<string>();
expectTypeOf(Ok<string>).returns.toEqualTypeOf<{ ok: true; data: string }>();

expectTypeOf(Err).toBeFunction();
expectTypeOf(Err<'TEST_ERROR'>)
  .parameter(0)
  .toEqualTypeOf<'TEST_ERROR'>();
expectTypeOf(Err<'TEST_ERROR'>)
  .parameter(1)
  .toEqualTypeOf<string | undefined>();
expectTypeOf(Err<'TEST_ERROR'>).returns.toEqualTypeOf<{
  ok: false;
  error: { code: 'TEST_ERROR'; message: string };
}>();

expectTypeOf(safeFetch).toBeFunction();
expectTypeOf(safeFetch).parameter(0).toEqualTypeOf<string>();

/**
 * Type Utility Contract Tests
 */

// Conditional types work as expected
type IsOk<T> = T extends { ok: true } ? true : false;

expectTypeOf<IsOk<{ ok: true; data: string }>>().toEqualTypeOf<true>();
expectTypeOf<
  IsOk<{ ok: false; error: { code: string; message: string } }>
>().toEqualTypeOf<false>();

// Mapped types work as expected
type ExtractData<T> = T extends { ok: true; data: infer D } ? D : never;

expectTypeOf<ExtractData<{ ok: true; data: string }>>().toEqualTypeOf<string>();
expectTypeOf<
  ExtractData<{ ok: false; error: { code: string; message: string } }>
>().toEqualTypeOf<never>();

// Template literal types for API routes
type ApiRoute = `/api/${string}`;

expectTypeOf<'/api/upload'>().toMatchTypeOf<ApiRoute>();
expectTypeOf<'/api/assets/123'>().toMatchTypeOf<ApiRoute>();
expectTypeOf<'/invalid'>().not.toMatchTypeOf<ApiRoute>();

/**
 * Integration Type Contract Tests
 */

// Result and ClientResult should have compatible structures
type DomainResult = Result<string, 'DOMAIN_ERROR'>;
type ApiClientResult = ClientResult<string>;

// Both should be discriminated unions on 'ok' property
expectTypeOf<DomainResult['ok']>().toEqualTypeOf<boolean>();
expectTypeOf<ApiClientResult['ok']>().toEqualTypeOf<boolean>();

// Success cases should be similar
type DomainSuccess = Extract<DomainResult, { ok: true }>;
type ClientSuccess = Extract<ApiClientResult, { ok: true }>;

expectTypeOf<DomainSuccess['data']>().toEqualTypeOf<string>();
expectTypeOf<ClientSuccess['data']>().toEqualTypeOf<string>();

/**
 * Schema composition should work (type-only)
 * Avoid a runtime binding to satisfy ESLint: model the transformed output type without creating a value.
 */
type ComposedType = z.output<typeof directUploadSchema> & { processed: true };
// Verify composition maintains input properties and adds new ones
expectTypeOf<ComposedType>().toHaveProperty('processed').toEqualTypeOf<true>();
expectTypeOf<ComposedType>()
  .toHaveProperty('cors_origin')
  .toEqualTypeOf<string | undefined>();

/**
 * Exhaustive Type Tests
 * These tests ensure discriminated unions are exhaustive
 */

// AssetStatus exhaustiveness
const exhaustiveAssetStatus = (status: AssetStatus): string => {
  switch (status) {
    case 'preparing':
      return 'preparing';
    case 'ready':
      return 'ready';
    case 'errored':
      return 'errored';
    default:
      // This should be never if the switch is exhaustive
      const _exhaustive: never = status;
      return _exhaustive;
  }
};

expectTypeOf(exhaustiveAssetStatus).toBeFunction();

// FetchError exhaustiveness
const exhaustiveFetchError = (error: FetchError): string => {
  switch (error.type) {
    case 'API_ERROR':
      return error.code;
    case 'HTTP_ERROR':
      return String(error.status);
    case 'VALIDATION_ERROR':
      return 'validation';
    case 'NETWORK_ERROR':
      return 'network';
    default:
      // This should be never if the switch is exhaustive
      const _exhaustive: never = error;
      return _exhaustive;
  }
};

expectTypeOf(exhaustiveFetchError).toBeFunction();

/**
 * Generic Type Constraints Tests
 */

// Result error parameter should be constrained to string
type ValidResult = Result<number, 'VALID_ERROR'>;
expectTypeOf<ValidResult>().toBeObject();

// Branded types should maintain their branding
type BrandTest = AssetId extends string ? true : false;
expectTypeOf<BrandTest>().toEqualTypeOf<true>();

type BrandDistinct = AssetId extends string & { readonly brand: unknown }
  ? true
  : false;
expectTypeOf<BrandDistinct>().toEqualTypeOf<true>();

/**
 * Schema Transformation Type Tests
 */

// Schema inputs and outputs should differ when transforms are applied
type UrlsInput = z.input<typeof uploadUrlsSchema>;
type UrlsOutput = z.output<typeof uploadUrlsSchema>;

// Input is string, output is string array due to transform
expectTypeOf<UrlsInput['urls']>().toEqualTypeOf<string>();
expectTypeOf<UrlsOutput['urls']>().toEqualTypeOf<string[]>();

// Default values should be applied in schema output
type DirectUploadOutput = z.output<typeof directUploadSchema>;
expectTypeOf<DirectUploadOutput['new_asset_settings']>().toMatchTypeOf<
  | {
      playback_policy: Array<'public' | 'signed'>;
      encoding_tier: 'baseline' | 'smart';
      normalize_audio: boolean;
    }
  | undefined
>();
