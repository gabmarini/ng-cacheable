import {of, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';
import {CacheService} from '../services/cache.service';

export const Defaults = {
  defaultTTL: 30 * 1000
};

export const cacheResultOperator = (cacheKey: string, ttl: number) => {
  return pipe(
    tap(result => CacheService.getInstance().insertCacheResult(cacheKey, of(result), ttl)),
  );
};
