export interface ICachedMetadataInterface {
  cacheKey?: string;
  cacheBustedBy?: string;
  cacheTTL?: number;
}

export interface ICacheBusterMetadataInterface {
  cacheBusterFor?: string;
}
