import * as LRUCache from 'lru-cache';
import cacheManager, { CacheClient } from '@type-cacheable/core';
import { MixCacheAdapterOptions } from './MixCacheAdapterOptions';
import { Redis } from 'ioredis';
import { LRUCacheAdapter } from './lib/lru';
import { IoRedisAdapter } from './lib/redis';

export class MixCacheAdapter<T> implements CacheClient {
  private readonly defaultLurOptions: LRUCache.Options<string, T> = {
    max: 200 * 1024,
    maxAge: 60 * 60 * 1000,
    length(value: T, key?: string): number {
      let valueLengh = value ? (typeof value === 'object' ? JSON.stringify(value).length : (value + '').length) : 0;
      if (valueLengh <= 1024) {
        valueLengh = 1;
      } else {
        valueLengh = Math.round(valueLengh / 1024);
      }
      return (key ? (key.length ? key.length : 1) : 0) + valueLengh;
    },
    updateAgeOnGet: false
  };

  constructor(redisClient: Redis, lruOptions?: LRUCache.Options<string, T>) {
    this.lruClient = new LRUCache(Object.assign({}, this.defaultLurOptions, lruOptions));
    this.redisClient = redisClient;
    this.lruAdapter = new LRUCacheAdapter(this.lruClient);
    this.redisAdapter = new IoRedisAdapter(this.redisClient);
    this.get = this.get.bind(this);
    this.del = this.del.bind(this);
    this.delHash = this.delHash.bind(this);
    this.getClientTTL = this.getClientTTL.bind(this);
    this.keys = this.keys.bind(this);
    this.set = this.set.bind(this);
  }

  private lruAdapter: LRUCacheAdapter<any>;
  private redisAdapter: IoRedisAdapter;
  private lruClient: LRUCache<string, T>;
  private redisClient: Redis;

  public async get(cacheKey: string): Promise<any> {
    let cacheObj = await this.lruAdapter.get(cacheKey);
    if (!cacheObj) {
      cacheObj = await this.redisAdapter.get(cacheKey);
      if (cacheObj) {
        await this.lruAdapter.set(cacheKey, cacheObj);
      }
    }
    return cacheObj;
  }

  public async set(cacheKey: string, value: any, ttl?: number): Promise<any> {
    return Promise.all([this.lruAdapter.set(cacheKey, value, ttl), this.redisAdapter.set(cacheKey, value, ttl)]);
  }

  public getClientTTL(): number {
    try {
      return this.lruClient.maxAge / 1000;
    } catch {
      return 0;
    }
  }

  public async del(keyOrKeys: string | string[]): Promise<any> {
    // if (Array.isArray(keyOrKeys)) {
    //   keyOrKeys.forEach((key) => {
    //     this.lruClient.del(key);
    //   });
    //
    //   return keyOrKeys.length;
    // }
    //
    // this.lruClient.del(keyOrKeys);
    await Promise.all([this.redisAdapter.del(keyOrKeys), this.lruAdapter.del(keyOrKeys)]);
    return 1;
  }

  public async keys(pattern: string): Promise<string[]> {
    return this.redisAdapter.keys(pattern);
  }

  public async delHash(hashKeyOrKeys: string | string[]): Promise<any> {
    await Promise.all([this.redisAdapter.delHash(hashKeyOrKeys), this.lruAdapter.delHash(hashKeyOrKeys)]);
    return;
  }
}

export const useAdapter = <T>(options: MixCacheAdapterOptions<T>, asFallback?: boolean): MixCacheAdapter<T> => {
  const mixCacheAdapter = new MixCacheAdapter(options.redisClient, options.lruOptions);

  if (asFallback) {
    cacheManager.setFallbackClient(mixCacheAdapter);
  } else {
    cacheManager.setClient(mixCacheAdapter);
  }
  return mixCacheAdapter;
};
