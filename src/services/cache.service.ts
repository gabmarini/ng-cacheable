import * as momentImported from 'moment';
import {CacheItem} from '../interfaces/cache.item';
import {Moment} from 'moment';
import {CacheInsertion} from '../interfaces/cache-insertion.interface';

const moment = momentImported;

// @dynamic
export class CacheService {

  private constructor() {
    this.cacheMap = new Map<string, any>();
  }

  private static instance: CacheService = null;
  private readonly cacheMap: Map<string, CacheItem>;

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }

    return CacheService.instance;
  }

  static hashString = string => {
    let hash = 0, i, chr;
    for (i = 0; i < string.length; i++) {
      chr = string.charCodeAt(i);
      // tslint:disable-next-line:no-bitwise
      hash = ((hash << 5) - hash) + chr;
      // tslint:disable-next-line:no-bitwise
      hash |= 0; // Convert to 32bit integer
    }
    return String(hash);
  }

  static isFreshCacheItem(cacheItem: CacheItem): boolean {
    const now: Moment = moment();
    return now.valueOf() < cacheItem.expirationTimeMillis;
  }

  static buildPreHashedKey(method: string, args: any[]) {
    return `${method}|${args.join('')}`;
  }

  static buildHashedKey(method: string, args: any[]) {
    return CacheService.hashString(CacheService.buildPreHashedKey(method, args));
  }

  insertCacheResult(cacheInsertion: CacheInsertion) {
    this.cacheMap.set(cacheInsertion.cacheKey, {
      cachedResult: cacheInsertion.result,
      expirationTimeMillis: moment().valueOf() + cacheInsertion.ttl,
      bustingKey: cacheInsertion.bustingKey
    });
  }

  canBeCacheHit(method: string, args: any[]): boolean {
    const hashedKey: string = CacheService.buildHashedKey(method, args);
    if (this.cacheMap.has(hashedKey)) {
      const cacheItem: CacheItem = this.cacheMap.get(hashedKey);
      return CacheService.isFreshCacheItem(cacheItem);
    }
    return false;
  }

  getCacheHit(method: string, args: any[]) {
    return this.cacheMap.get(CacheService.buildHashedKey(method, args)).cachedResult;
  }

  deleteCacheHit(key: string) {
    Array.from(this.cacheMap.keys()).forEach((cacheKey: string) => {
      const cacheItem: CacheItem = this.cacheMap.get(cacheKey);
      if (cacheItem.bustingKey === key) {
        this.cacheMap.delete(cacheKey);
      }
    });
  }

}
