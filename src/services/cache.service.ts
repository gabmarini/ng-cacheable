import * as momentImported from 'moment';
import {CacheItem} from '../interfaces/cache.item';
import {Moment} from 'moment';
import {CacheInsertion} from '../interfaces/cache-insertion.interface';
import {CacheLogger} from '../interfaces/Icacheable-metadata.interface';

const moment = momentImported;

// @dynamic
export class CacheService {

  public set logger(loggerInstance: CacheLogger) {
    if(!!loggerInstance) {
      this._logger = loggerInstance;
    } else {
      this._logger = {log: () => {}};
    }
  }

  private constructor() {
    this.cacheMap = new Map<string, any>();
  }

  private static instance: CacheService = null;

  private _logger: CacheLogger;
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
    this._logger.log(`inserting into cache: ${JSON.stringify(cacheInsertion, undefined, 3)}`);
    const map = this.cacheMap.set(cacheInsertion.cacheKey, {
      cachedResult: cacheInsertion.result,
      expirationTimeMillis: moment().valueOf() + cacheInsertion.ttl,
      bustingKey: cacheInsertion.bustingKey
    });
    this._logger.log(`inserted`);
    this._logger.log(`new cache map: ${JSON.stringify(Array.from(this.cacheMap.entries()), undefined, 3)}`);
  }

  canBeCacheHit(method: string, args: any[]): boolean {
    const hashedKey: string = CacheService.buildHashedKey(method, args);
    if (this.cacheMap.has(hashedKey)) {
      const cacheItem: CacheItem = this.cacheMap.get(hashedKey);
      this._logger.log(`cache hitted for ${method} - ${args}`);
      return CacheService.isFreshCacheItem(cacheItem);
    }
    return false;
  }

  getCacheHit(method: string, args: any[]) {
    this._logger.log(`retrieving cache hit for ${method} - ${args}`);
    return this.cacheMap.get(CacheService.buildHashedKey(method, args)).cachedResult;
  }

  deleteCacheHit(key: string) {
    Array.from(this.cacheMap.keys()).forEach((cacheKey: string) => {
      const cacheItem: CacheItem = this.cacheMap.get(cacheKey);
      if (cacheItem.bustingKey === key) {
        this._logger.log(`deleting cache hit for ${cacheKey}`);
        this.cacheMap.delete(cacheKey);
        this._logger.log(`new cache map: ${JSON.stringify(Array.from(this.cacheMap.entries()), undefined, 3)}`);
      }
    });
  }

}
