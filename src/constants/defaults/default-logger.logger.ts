import {CacheLogger} from '../../interfaces/Icacheable-metadata.interface';

export class DefaultVoidLogger implements CacheLogger {
  log(payload: any) {}
}
