export interface CacheInsertion {
  method?: string;
  args?: any[];
  cacheKey?: string;
  bustingKey?: string;
  ttl?: number;
  result?: any;
}
