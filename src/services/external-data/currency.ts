import { DateTime } from 'luxon';
import { fetchAndCache, EFResponseBase } from './external-data.utils';

interface CurrencyResponse {
  rate: number;
  timestamp: string;
}

interface EFResponse extends EFResponseBase {}

const fetchCurrencyData = (ticker: string, date: string): Promise<EFResponse> => {
  const cacheKey = `ef:currency:${ticker}:${date}`;
  const url = `https://api.example.com/currency/${ticker}/${date}`; // 실제 API 엔드포인트

  const parser = (response: { data: CurrencyResponse[] }, category: string, t: string, d: string): EFResponse | undefined => {
    if (response.data && response.data.length > 0) {
      const item = response.data[0];
      return {
        category,
        ticker: t,
        date: d,
        value: item.rate,
        unit: t.slice(3),
        timestamp: DateTime.fromISO(item.timestamp).toISO() || "",
      };
    }
    return undefined;
  };

  return fetchAndCache<CurrencyResponse[], EFResponse>(cacheKey, url, parser);
};

export default fetchCurrencyData;
