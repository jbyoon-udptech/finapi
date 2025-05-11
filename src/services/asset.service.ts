import AssetModel, { AssetDocument } from '../models/asset.model';
import efService from './external-api';
import { formatDate } from '../utils/timezone';
import { APIError } from '../utils/error-handler';
import { getCache, setCache } from '../utils/cache';

const createAsset = async (assetData: { name: string; category: string; ticker: string }): Promise<AssetDocument> => {
  const asset = new AssetModel(assetData);
  return await asset.save();
};

const getAssetDataByDate = async (assetId: string, date: string): Promise<any> => {
  const cacheKey = `asset:${assetId}:${date}`;
  const cachedData = await getCache(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const asset = await AssetModel.findById(assetId);
  if (!asset) {
    throw new APIError('Asset not found', 404);
  }

  try {
    const externalData = await efService.fetchExternalData(asset.category, asset.ticker, date);
    const response = {
      asset_id: asset.id,
      name: asset.name,
      date: externalData.date,
      value: externalData.value,
      currency: externalData.unit,
      timestamp: externalData.timestamp,
    };
    await setCache(cacheKey, JSON.stringify(response), 3600); // 1시간 캐싱
    return response;
  } catch (error: any) {
    if (error instanceof APIError && error.statusCode === 429) {
      throw error;
    }
    // 내부 DB에 저장 로직 추가 (선택 사항)
    console.warn(`Failed to fetch external data for ${asset.name} on ${date}: ${error.message}`);
    throw new APIError('Failed to retrieve asset data', 500);
  }
};

export default { createAsset, getAssetDataByDate };
