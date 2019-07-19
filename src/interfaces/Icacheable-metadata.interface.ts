export interface ICachedMetadataInterface {
  cacheBustingKey?: string;
  cacheBustedBy?: string;
  cacheTTL?: number;
}

export interface CacheLogger {
  log(payload: any): void;
}

export interface ICacheBusterMetadataInterface {
  cacheBusterFor?: string;
}
