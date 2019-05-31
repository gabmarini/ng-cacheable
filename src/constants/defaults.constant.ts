import {of, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';
import {CacheService} from '../services/cache.service';
import {CacheInsertion} from '../interfaces/cache-insertion.interface';

export const Defaults = {
  defaultTTL: 30 * 1000
};

export const cacheResultOperator = (cacheInsertion: CacheInsertion) => {
  return pipe(
    tap(result => {
      cacheInsertion.result = of(result);
      CacheService.getInstance().insertCacheResult(cacheInsertion);
    }),
  );
};
