import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

redisClient.on('connect', () => {
  console.info('Redis connected');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

const connectRedis = async (): Promise<void> => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

const disconnectRedis = async (): Promise<void> => {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
};

const getCache = async (key: string): Promise<string | null> => {
  try {
    await connectRedis();
    const value = await redisClient.get(key);
    return value;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  } finally {
    // disconnectRedis(); // 필요에 따라 연결 유지 또는 해제
  }
};

const setCache = async (key: string, value: string, expiry?: number): Promise<void> => {
  try {
    await connectRedis();
    await redisClient.set(key, value, { EX: expiry || 3600 }); // 기본 만료 시간 1시간 (초 단위)
  } catch (error) {
    console.error('Redis set error:', error);
  } finally {
    // disconnectRedis(); // 필요에 따라 연결 유지 또는 해제
  }
};

export { redisClient, getCache, setCache };