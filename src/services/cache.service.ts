import * as momentImported from 'moment';
import {Moment} from 'moment';
import {CacheItem} from '../interfaces/cache.item';
import {CacheLogger} from '../interfaces/Icacheable-metadata.interface';
import {CacheConfiguration} from '../configurations/cache-configuration.configuration';
import {CacheInsertion} from '../interfaces/cache-insertion.interface';
import {CacheMap} from './cache-map.service';

const moment = momentImported;

interface CacheServiceI {
  canBeCacheHit(method: string, args: any[]): boolean;
}

// @dynamic
export class CacheService implements CacheServiceI {

  public set logger(loggerInstance: CacheLogger) {
    if (!!loggerInstance) {
      this._logger = loggerInstance;
    } else {
      this._logger = {log: () => {}};
    }
  }

  private constructor() {
    this.logger = new CacheConfiguration.logger;
    this.cacheMapInstance = CacheMap.getInstance();
  }

  private static instance: CacheService = null;

  private _logger: CacheLogger;
  private readonly cacheMapInstance: CacheMap;

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
    return `${method}|${JSON.stringify(args)}`;
  }

  static buildHashedKey(method: string, args: any[]) {
    return CacheService.hashString(CacheService.buildPreHashedKey(method, args));
  }

  canBeCacheHit(method: string, args: any[]): boolean {
    const hashedKey: string = CacheService.buildHashedKey(method, args);
    if (this.cacheMapInstance.cacheMap.has(hashedKey)) {
      const cacheItem: CacheItem = this.cacheMapInstance.cacheMap.get(hashedKey);
      this._logger.log(`cache hitted for ${method} - ${args}`);
      return CacheService.isFreshCacheItem(cacheItem);
    }
    return false;
  }

  getCacheHit(method: string, args: any[]) {
    this._logger.log(`retrieving cache hit for ${method} - ${args}`);
    return this.cacheMapInstance.cacheMap.get(CacheService.buildHashedKey(method, args)).cachedResult;
  }

  deleteCacheHit(key: string) {
    Array.from(this.cacheMapInstance.cacheMap.keys()).forEach((cacheKey: string) => {
      const cacheItem: CacheItem = this.cacheMapInstance.cacheMap.get(cacheKey);
      if (cacheItem.bustingKey === key) {
        this._logger.log(`deleting cache hit for ${cacheKey}`);
        this.cacheMapInstance.cacheMap.delete(cacheKey);
        this._logger.log(`new cache map: ${JSON.stringify(Array.from(this.cacheMapInstance.cacheMap.entries()), undefined, 3)}`);
      }
    });
  }

  insertCacheResult(cacheInsertion: CacheInsertion) {
    this.cacheMapInstance.insertCacheResult(cacheInsertion);
  }
}
