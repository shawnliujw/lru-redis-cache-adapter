import * as LRUCache from 'lru-cache';
import { CacheClient } from '@type-cacheable/core';
import { MixCacheAdapterOptions } from './MixCacheAdapterOptions';
import { Redis } from 'ioredis';
export declare class MixCacheAdapter<T> implements CacheClient {
    private readonly defaultLurOptions;
    constructor(redisClient: Redis, lruOptions?: LRUCache.Options<string, T>);
    private lruAdapter;
    private redisAdapter;
    private lruClient;
    private redisClient;
    get(cacheKey: string): Promise<any>;
    set(cacheKey: string, value: any, ttl?: number): Promise<any>;
    getClientTTL(): number;
    del(keyOrKeys: string | string[]): Promise<any>;
    keys(pattern: string): Promise<string[]>;
    delHash(hashKeyOrKeys: string | string[]): Promise<any>;
}
export declare const useAdapter: <T>(options: MixCacheAdapterOptions<T>, asFallback?: boolean | undefined) => MixCacheAdapter<T>;
