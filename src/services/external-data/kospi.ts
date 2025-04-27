import { DateTime } from 'luxon';
import { fetchAndCache, EFResponseBase } from './external-data.utils';

interface StockResponse {
  price: number;
  currency: string;
  timestamp: string;
}

interface EFResponse extends EFResponseBase {}

const fetchKOSPIData = (ticker: string, date: string): Promise<EFResponse> => {
  const cacheKey = `ef:KOSPI:${ticker}:${date}`;
  const url = `https://api.example.com/stock/KOSPI/${ticker}/${date}`; // 실제 API 엔드포인트

  const parser = (response: { data: StockResponse }, category: string, t: string, d: string): EFResponse | undefined => {
    if (response.data) {
      return {
        category,
        ticker: t,
        date: d,
        value: response.data.price,
        unit: response.data.currency,
        timestamp: DateTime.fromISO(response.data.timestamp).toISO() || "",
      };
    }
    return undefined;
  };

  return fetchAndCache<StockResponse, EFResponse>(cacheKey, url, parser);
};

export default fetchKOSPIData;
