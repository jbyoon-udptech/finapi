import fetchCurrencyData from './currency';
import { fetchUpbitData } from './upbit';
import fetchKOSPIData from './kospi';
import fetchNYSEData from './nyse';
import { APIError } from '../../utils/error-handler';
import { EFResponseBase } from './external-data.utils';

interface EFResponse extends EFResponseBase {}

export const fetchExternalData = async (category: string, ticker: string, date: string): Promise<EFResponse> => {
  switch (category) {
    case 'currency':
      return await fetchCurrencyData(ticker, date);
    case 'upbit':
      return await fetchUpbitData(ticker, date);
    case 'KOSPI':
      return await fetchKOSPIData(ticker, date);
    case 'NYSE':
      return await fetchNYSEData(ticker, date);
    default:
      throw new APIError(`Invalid category: ${category}`, 400);
  }
};

export default { fetchExternalData };
