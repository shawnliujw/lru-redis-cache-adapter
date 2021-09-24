import { Redis } from 'ioredis';
import * as LRUCache from 'lru-cache';
export declare class MixCacheAdapterOptions<T> {
    redisClient: Redis;
    lruOptions?: LRUCache.Options<string, T>;
    asFallback?: boolean;
}
