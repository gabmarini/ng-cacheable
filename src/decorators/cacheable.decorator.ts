import {ICacheBusterMetadataInterface, ICachedMetadataInterface} from '../interfaces/Icacheable-metadata.interface';
import {CacheService} from '../services/cache.service';
import {cacheResultOperator, Defaults} from '../constants/defaults.constant';
import {isObservable, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {CacheInsertion} from '../interfaces/cache-insertion.interface';


export function Cached(metadata?: ICachedMetadataInterface): MethodDecorator {

  const cacheService: CacheService = CacheService.getInstance();

  function cacheResult(cacheInsertion: CacheInsertion) {
    if (isObservable(cacheInsertion.result)) {
      cacheInsertion.result = cacheInsertion.result.pipe(
        catchError(err => throwError(err)),
        cacheResultOperator(cacheInsertion),
      );
    } else {
      if (!!cacheInsertion.result) {
        cacheService.insertCacheResult(cacheInsertion);
      }
    }
    return cacheInsertion.result;
  }

  return function (target: Function, method: string, descriptor: PropertyDescriptor) {

    if (!metadata.cacheTTL) {
      metadata.cacheTTL = Defaults.defaultTTL;
    }

    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {

      const hasCacheHit = cacheService.canBeCacheHit(method, args);
      let result;
      if (hasCacheHit) {
        result = cacheService.getCacheHit(method, args);
      } else {
        result = originalMethod.apply(this, args);
        const cacheInsertion: CacheInsertion = {
          args: args,
          bustingKey: metadata.cacheBustingKey,
          method: method,
          result: result,
          ttl: metadata.cacheTTL,
          cacheKey: CacheService.buildHashedKey(method, args)
        };
        result = cacheResult(cacheInsertion);
      }
      return result;
    };
    return descriptor;
  };
}

export function CacheBuster(metadata?: ICacheBusterMetadataInterface): MethodDecorator {

  function bustCacheResult(key: string) {
    CacheService.getInstance().deleteCacheHit(key);
  }

  return function (target: Function, key: string, descriptor: PropertyDescriptor) {

    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {

      const result = originalMethod.apply(this, args);
      bustCacheResult(metadata.cacheBusterFor);
      return result;
    };

    return descriptor;

  };
}

