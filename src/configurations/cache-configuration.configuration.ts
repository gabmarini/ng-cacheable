import {CacheLogger} from '../interfaces/Icacheable-metadata.interface';
import {DefaultVoidLogger} from '../constants/defaults/default-logger.logger';

export const CacheConfiguration: {
  logger: new () => CacheLogger,
} = {
  logger: DefaultVoidLogger,
};
