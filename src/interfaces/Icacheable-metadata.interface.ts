export interface ICachedMetadataInterface {
  cacheBustingKey?: string;
  cacheBustedBy?: string;
  cacheTTL?: number;
}

export interface ICacheBusterMetadataInterface {
  cacheBusterFor?: string;
}
