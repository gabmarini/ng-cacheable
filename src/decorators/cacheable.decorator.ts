import {ICacheBusterMetadataInterface, ICachedMetadataInterface} from '../interfaces/ICacheable-metadata.interface';
import {CacheService} from '../services/cache.service';
import {cacheResultOperator, Defaults} from '../constants/defaults.constant';
import * as momentImported from 'moment';
import {isEmpty} from 'lodash';
import {isObservable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

const moment = momentImported;

export function Cached(metadata?: ICachedMetadataInterface): MethodDecorator {

  function cacheResult(result, key: string) {
    if (isObservable(result)) {
      result = result.pipe(
        catchError(err => throwError(err)),
        cacheResultOperator(key, moment().valueOf() + metadata.cacheTTL),
      );
    } else {
      if (!!result) {
        CacheService.getInstance().insertCacheResult(key, result, moment().valueOf() + metadata.cacheTTL);
      }
    }
    return result;
  }

  return function (target: Function, key: string, descriptor: PropertyDescriptor) {

    if (!metadata.cacheTTL) {
      metadata.cacheTTL = Defaults.defaultTTL;
    }

    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {

      if (isEmpty(metadata.cacheKey)) {
        metadata.cacheKey = `${key}|${args.join('')}`;
      }

      const service: CacheService = CacheService.getInstance();

      const hasCacheHit = service.canBeCacheHit(metadata.cacheKey);
      let result;
      if (hasCacheHit) {
        result = service.getCacheHit(metadata.cacheKey);
      } else {
        result = originalMethod.apply(this, args);
        result = cacheResult(result, metadata.cacheKey);
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

