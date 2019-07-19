import {of, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';
import {CacheInsertion} from '../interfaces/cache-insertion.interface';
import {CacheMap} from '../services/cache-map.service';

export const Defaults = {
  defaultTTL: 30 * 1000
};

export const cacheResultOperator = (cacheInsertion: CacheInsertion) => {
  return pipe(
    tap(result => {
      cacheInsertion.result = of(result);
      CacheMap.getInstance().insertCacheResult(cacheInsertion);
    }),
  );
};
