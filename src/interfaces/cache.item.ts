export interface CacheItem {
  cachedResult: any;
  expirationTimeMillis: number;
  bustingKey: string;
}
