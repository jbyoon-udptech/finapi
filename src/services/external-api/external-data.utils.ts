import axios, { AxiosResponse } from 'axios';
import { getCache, setCache } from '../../utils/cache';
import { APIError } from '../../utils/error-handler';

interface EFResponseBase {
  category: string;
  ticker: string;
  date: string;
  value: number;
  unit: string;
  timestamp: string;
}

async function fetchAndCache<T, R extends EFResponseBase>(
  cacheKey: string,
  url: string,
  parser: (response: AxiosResponse<T>, category: string, ticker: string, date: string) => R | undefined,
  noCache: boolean = false,
  cachingTime: number = 300 // Default 5 minutes
): Promise<R> {
  const cachedData = noCache ? await getCache(cacheKey) : null;

  if (cachedData) {
    return JSON.parse(cachedData) as R;
  }

  try {
    const response = await axios.get<T>(url);
    const parsedData = parser(response, cacheKey.split(':')[1], cacheKey.split(':')[2], cacheKey.split(':')[3]);
    if (!parsedData) {
      throw new APIError('Failed to parse external data', 500);
    }

    await setCache(cacheKey, JSON.stringify(parsedData), cachingTime);
    return parsedData;
  } catch (error: any) {
    console.error(`Error fetching data from ${url}:`, error.message);
    if (error.response && error.response.status === 429) {
      throw new APIError('External API rate limit exceeded', 429);
    }
    throw new APIError(`Failed to fetch data from ${url}`, 500);
  }
}

export { fetchAndCache, EFResponseBase };
