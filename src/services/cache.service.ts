import * as momentImported from 'moment';
import {CacheItem} from '../interfaces/cache.item';
import {Moment} from 'moment';
import {interval} from 'rxjs';

const moment = momentImported;

// @dynamic
export class CacheService {

  private static instance: CacheService = null;
  private readonly cacheMap: Map<string, CacheItem>;

  private constructor() {
    this.cacheMap = new Map<string, any>();
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }

    return CacheService.instance;
  }

  static hashString = string => {
    let hash = 0, i, chr;
    for (i = 0; i < string.length; i++) {
      chr   = string.charCodeAt(i);
      // tslint:disable-next-line:no-bitwise
      hash  = ((hash << 5) - hash) + chr;
      // tslint:disable-next-line:no-bitwise
      hash |= 0; // Convert to 32bit integer
    }
    return String(hash);
  }

  static isFreshCacheItem(cacheItem: CacheItem): boolean {
    const now: Moment = moment();
    return now.valueOf() < cacheItem.expirationTimeMillis;
  }

  insertCacheResult(key: string, result: any, ttl: number) {
    this.cacheMap.set(CacheService.hashString(key), {cachedResult: result, expirationTimeMillis: ttl});
  }

  canBeCacheHit(key: string): boolean {
    const hashedKey: string = CacheService.hashString(key);
    if (this.cacheMap.has(hashedKey)) {
      const cacheItem: CacheItem = this.cacheMap.get(hashedKey);
      return CacheService.isFreshCacheItem(cacheItem);
    }
  }

  getCacheHit(key: string) {
    return this.cacheMap.get(CacheService.hashString(key)).cachedResult;
  }

  deleteCacheHit(key: string) {
    return this.cacheMap.delete(CacheService.hashString(key));
  }

}
