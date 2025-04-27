import { DateTime } from 'luxon';
import { fetchAndCache, EFResponseBase } from './external-data.utils';
import { formatDate } from '../../utils/timezone';

interface UpbitResponse {
  trade_date: string;
  trade_time_kst: string;
  trade_price: number;
}

interface EFResponse extends EFResponseBase {}

const fetchUpbitData = (ticker: string, date: string): Promise<EFResponse> => {
  const cacheKey = `ef:upbit:${ticker}:${date.replace(/-/g, '')}`; // Upbit API는 날짜 형식이 다를 수 있음
  const url = `https://api.upbit.com/v1/ticker?markets=${ticker}`; // 실제 API 엔드포인트

  const parser = (response: { data: UpbitResponse[] }, category: string, t: string, d: string): EFResponse | undefined => {
    if (response.data && response.data.length > 0) {
      const item = response.data[0];
      const tradeDateTime = DateTime.fromISO(item.trade_date + 'T' + item.trade_time_kst);
      const formattedDate = formatDate(tradeDateTime.toJSDate());
      return {
        category,
        ticker: t,
        date: formattedDate,
        value: item.trade_price,
        unit: 'KRW',
        timestamp: tradeDateTime.toISO() || "",
      };
    }
    return undefined;
  };

  return fetchAndCache<UpbitResponse[], EFResponse>(cacheKey, url, parser);
};

export default fetchUpbitData;
