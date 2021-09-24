import { Cacheable } from '@type-cacheable/core';
import { useAdapter } from '../src';
import * as IORedis from 'ioredis';

class TestClass {
  @Cacheable({ ttlSeconds: 10 })
  public async testCache(count: number) {
    console.log('newly called');
    return count * 100;
  }
}

describe('index.ts test', () => {
  beforeAll(() => {
    useAdapter({ redisClient: new IORedis() });
  });

  it('cacheable', async () => {
    const clz = new TestClass();
    let r = await clz.testCache(10);
    console.log(r);
    r = await clz.testCache(10);
    console.log(r);
    r = await clz.testCache(10);
    console.log(r);

  });
});