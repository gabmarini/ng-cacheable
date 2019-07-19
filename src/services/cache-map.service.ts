import {CacheInsertion} from '../interfaces/cache-insertion.interface';
import {CacheLogger} from '../interfaces/Icacheable-metadata.interface';
import * as momentImported from 'moment';
import {CacheItem} from '../interfaces/cache.item';
import {CacheConfiguration} from '../configurations/cache-configuration.configuration';

const moment = momentImported;


export class CacheMap {

  private constructor() {
    this._map = new Map<string, CacheItem>();
  }

  private static instance: CacheMap = null;
  private _map: Map<string, any>;
  private _logger: CacheLogger;

  get cacheMap() {
    return this._map;
  }

  static getInstance() {
    if (!CacheMap.instance) {
      CacheMap.instance = new CacheMap();
      CacheMap.instance._logger = new CacheConfiguration.logger;
      CacheMap.instance._map = new Map<string, any>();
    }
    return CacheMap.instance;
  }

  insertCacheResult(cacheInsertion: CacheInsertion) {
    this._logger.log(`inserting into cache: ${JSON.stringify(cacheInsertion, undefined, 3)}`);
    this._map.set(cacheInsertion.cacheKey, {
      cachedResult: cacheInsertion.result,
      expirationTimeMillis: moment().valueOf() + cacheInsertion.ttl,
      bustingKey: cacheInsertion.bustingKey
    });
    this._logger.log(`inserted`);
    this._logger.log(`new cache map: ${JSON.stringify(Array.from(this._map.entries()), undefined, 3)}`);
  }

}
