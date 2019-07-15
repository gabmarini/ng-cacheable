export interface ICachedMetadataInterface {
  cacheBustingKey?: string;
  cacheBustedBy?: string;
  cacheTTL?: number;
  logger?: CacheLogger;
}

export interface CacheLogger {
  log: (payload: any) => void;
}

export interface ICacheBusterMetadataInterface {
  cacheBusterFor?: string;
}

