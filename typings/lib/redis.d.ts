import { Redis } from 'ioredis';
import { CacheClient } from '@type-cacheable/core';
export declare class IoRedisAdapter implements CacheClient {
    constructor(redisClient: Redis);
    private init;
    private redisVersion;
    private redisClient;
    get(cacheKey: string): Promise<any>;
    set(cacheKey: string, value: any, ttl?: number): Promise<any>;
    getClientTTL(): number;
    del(keyOrKeys: string | string[]): Promise<any>;
    keys(pattern: string): Promise<string[]>;
    delHash(hashKeyOrKeys: string | string[]): Promise<any>;
}
export declare const useAdapter: (client: Redis, asFallback?: boolean | undefined) => IoRedisAdapter;
