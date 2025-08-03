import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { PortfolioListModel } from '../src/db/portfolio.model';
import { PortfolioAssetRecordModel } from '../src/db/portfolio.model';
import { AssetListModel } from '../src/db/asset.model';
import assetRecordApi from '../src/db/assetrecord.api';

const app = express();
app.use(express.json());
app.use('/api/portfolio', assetRecordApi);

describe('AssetRecord API', () => {
  let testPortfolio: any;
  let testAsset: any;

  beforeEach(async () => {
    // Create test portfolio
    testPortfolio = new PortfolioListModel({
      name: 'Test Portfolio',
      currency: 'KRW',
      timezone: 'Asia/Seoul'
    });
    await testPortfolio.save();

    // Create test asset
    testAsset = new AssetListModel({
      name: 'Bitcoin',
      ticker: 'BTC',
      category: 'crypto',
      unit: 'USD'
    });
    await testAsset.save();
  });

  describe('GET /api/portfolio/:portfolioId/assetrecord', () => {
    it('should return all asset records for a portfolio', async () => {
      // Create test asset records
      const assetRecord1 = new PortfolioAssetRecordModel({
        _pfId: testPortfolio._id,
        _assetId: testAsset._id,
        date: '2024-01-01',
        change: 100,
        result: 100,
        price: 50000,
        unit: 'USD',
        memo: 'Initial purchase'
      });
      await assetRecord1.save();

      const assetRecord2 = new PortfolioAssetRecordModel({
        _pfId: testPortfolio._id,
        _assetId: testAsset._id,
        date: '2024-01-02',
        change: 50,
        result: 150,
        price: 55000,
        unit: 'USD',
        memo: 'Additional purchase'
      });
      await assetRecord2.save();

      const response = await request(app)
        .get(`/api/portfolio/${testPortfolio._id}/assetrecord`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].change).toBe(100);
      expect(response.body[1].change).toBe(50);
    });

    it('should return empty array for portfolio with no asset records', async () => {
      const response = await request(app)
        .get(`/api/portfolio/${testPortfolio._id}/assetrecord`)
        .expect(200);

      expect(response.body).toHaveLength(0);
    });

    it('should return 404 for non-existent portfolio', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/portfolio/${nonExistentId}/assetrecord`)
        .expect(404);

      expect(response.body.message).toBe('Portfolio not found');
    });

    it('should return 400 for invalid portfolio ID', async () => {
      const response = await request(app)
        .get('/api/portfolio/invalid-id/assetrecord')
        .expect(400);

      expect(response.body.message).toBe('Invalid portfolio ID');
    });
  });

  describe('GET /api/portfolio/:portfolioId/assetrecord/:id', () => {
    it('should return a specific asset record', async () => {
      const assetRecord = new PortfolioAssetRecordModel({
        _pfId: testPortfolio._id,
        _assetId: testAsset._id,
        date: '2024-01-01',
        change: 100,
        result: 100,
        price: 50000,
        unit: 'USD',
        memo: 'Initial purchase'
      });
      await assetRecord.save();

      const response = await request(app)
        .get(`/api/portfolio/${testPortfolio._id}/assetrecord/${assetRecord._id}`)
        .expect(200);

      expect(response.body.change).toBe(100);
      expect(response.body.price).toBe(50000);
      expect(response.body.memo).toBe('Initial purchase');
    });

    it('should return 404 for non-existent asset record', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/portfolio/${testPortfolio._id}/assetrecord/${nonExistentId}`)
        .expect(404);

      expect(response.body.message).toBe('Asset record not found');
    });

    it('should return 404 for asset record not belonging to the portfolio', async () => {
      // Create another portfolio
      const otherPortfolio = new PortfolioListModel({
        name: 'Other Portfolio',
        currency: 'USD',
        timezone: 'America/New_York'
      });
      await otherPortfolio.save();

      // Create asset record for other portfolio
      const assetRecord = new PortfolioAssetRecordModel({
        _pfId: otherPortfolio._id,
        _assetId: testAsset._id,
        date: '2024-01-01',
        change: 100,
        result: 100,
        price: 50000,
        unit: 'USD',
        memo: 'Initial purchase'
      });
      await assetRecord.save();

      // Try to access it through wrong portfolio
      const response = await request(app)
        .get(`/api/portfolio/${testPortfolio._id}/assetrecord/${assetRecord._id}`)
        .expect(404);

      expect(response.body.message).toBe('Asset record not found in this portfolio');
    });

    it('should return 400 for invalid asset record ID', async () => {
      const response = await request(app)
        .get(`/api/portfolio/${testPortfolio._id}/assetrecord/invalid-id`)
        .expect(400);

      expect(response.body.message).toBe('Invalid asset record ID');
    });
  });

  describe('POST /api/portfolio/:portfolioId/assetrecord', () => {
    it('should create a new asset record', async () => {
      const assetRecordData = {
        _assetId: testAsset._id,
        date: '2024-01-01',
        change: 100,
        result: 100,
        price: 50000,
        unit: 'USD',
        memo: 'Initial purchase'
      };

      const response = await request(app)
        .post(`/api/portfolio/${testPortfolio._id}/assetrecord`)
        .send(assetRecordData)
        .expect(201);

      expect(response.body.message).toBe('Asset record created successfully');
      expect(response.body.data.change).toBe(assetRecordData.change);
      expect(response.body.data.price).toBe(assetRecordData.price);
      expect(response.body.data.memo).toBe(assetRecordData.memo);

      // Verify it was saved to database
      const savedRecord = await PortfolioAssetRecordModel.findById(response.body.data._id);
      expect(savedRecord).toBeTruthy();
      expect(savedRecord?._pfId.toString()).toBe(testPortfolio._id.toString());
    });

    it('should return 400 when required fields are missing', async () => {
      const incompleteData = {
        change: 100
        // missing _assetId, date, result, price
      };

      const response = await request(app)
        .post(`/api/portfolio/${testPortfolio._id}/assetrecord`)
        .send(incompleteData)
        .expect(400);

      expect(response.body.message).toBe('All required fields must be provided');
    });

    it('should return 400 for invalid date format', async () => {
      const invalidData = {
        _assetId: testAsset._id,
        date: 'invalid-date',
        change: 100,
        result: 100,
        price: 50000,
        unit: 'USD'
      };

      const response = await request(app)
        .post(`/api/portfolio/${testPortfolio._id}/assetrecord`)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain('Invalid date format');
    });

    it('should return 404 for non-existent portfolio', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const assetRecordData = {
        _assetId: testAsset._id,
        date: '2024-01-01',
        change: 100,
        result: 100,
        price: 50000,
        unit: 'USD',
        memo: 'Initial purchase'
      };

      const response = await request(app)
        .post(`/api/portfolio/${nonExistentId}/assetrecord`)
        .send(assetRecordData)
        .expect(404);

      expect(response.body.message).toBe('Portfolio not found');
    });
  });

  describe('PUT /api/portfolio/:portfolioId/assetrecord/:id', () => {
    it('should update an existing asset record', async () => {
      const assetRecord = new PortfolioAssetRecordModel({
        _pfId: testPortfolio._id,
        _assetId: testAsset._id,
        date: '2024-01-01',
        change: 100,
        result: 100,
        price: 50000,
        unit: 'USD',
        memo: 'Initial purchase'
      });
      await assetRecord.save();

      const updateData = {
        change: 150,
        result: 150,
        price: 55000,
        unit: 'USD',
        memo: 'Updated purchase'
      };

      const response = await request(app)
        .put(`/api/portfolio/${testPortfolio._id}/assetrecord/${assetRecord._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Asset record updated successfully');

      // Verify the update in database
      const updatedRecord = await PortfolioAssetRecordModel.findById(assetRecord._id);
      expect(updatedRecord?.change).toBe(updateData.change);
      expect(updatedRecord?.price).toBe(updateData.price);
      expect(updatedRecord?.memo).toBe(updateData.memo);
    });

    it('should return 404 for non-existent asset record', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateData = {
        change: 150,
        result: 150,
        price: 55000,
        unit: 'USD',
        memo: 'Updated purchase'
      };

      const response = await request(app)
        .put(`/api/portfolio/${testPortfolio._id}/assetrecord/${nonExistentId}`)
        .send(updateData)
        .expect(404);

      expect(response.body.message).toBe('Asset record not found');
    });

    it('should return 404 for asset record not belonging to the portfolio', async () => {
      // Create another portfolio
      const otherPortfolio = new PortfolioListModel({
        name: 'Other Portfolio',
        currency: 'USD',
        timezone: 'America/New_York'
      });
      await otherPortfolio.save();

      // Create asset record for other portfolio
      const assetRecord = new PortfolioAssetRecordModel({
        _pfId: otherPortfolio._id,
        _assetId: testAsset._id,
        date: '2024-01-01',
        change: 100,
        result: 100,
        price: 50000,
        unit: 'USD',
        memo: 'Initial purchase'
      });
      await assetRecord.save();

      const updateData = {
        change: 150,
        result: 150,
        price: 55000,
        unit: 'USD',
        memo: 'Updated purchase'
      };

      // Try to update it through wrong portfolio
      const response = await request(app)
        .put(`/api/portfolio/${testPortfolio._id}/assetrecord/${assetRecord._id}`)
        .send(updateData)
        .expect(404);

      expect(response.body.message).toBe('Asset record not found in this portfolio');
    });

    it('should return 400 when required fields are missing', async () => {
      const assetRecord = new PortfolioAssetRecordModel({
        _pfId: testPortfolio._id,
        _assetId: testAsset._id,
        date: '2024-01-01',
        change: 100,
        result: 100,
        price: 50000,
        unit: 'USD',
        memo: 'Initial purchase'
      });
      await assetRecord.save();

      const incompleteData = {
        change: 150
        // missing other required fields
      };

      const response = await request(app)
        .put(`/api/portfolio/${testPortfolio._id}/assetrecord/${assetRecord._id}`)
        .send(incompleteData)
        .expect(400);

      expect(response.body.message).toBe('All required fields must be provided');
    });
  });

  describe('DELETE /api/portfolio/:portfolioId/assetrecord/:id', () => {
    it('should delete an existing asset record', async () => {
      const assetRecord = new PortfolioAssetRecordModel({
        _pfId: testPortfolio._id,
        _assetId: testAsset._id,
        date: '2024-01-01',
        change: 100,
        result: 100,
        price: 50000,
        unit: 'USD',
        memo: 'Initial purchase'
      });
      await assetRecord.save();

      const response = await request(app)
        .delete(`/api/portfolio/${testPortfolio._id}/assetrecord/${assetRecord._id}`)
        .expect(200);

      expect(response.body.message).toBe('Asset record deleted successfully');

      // Verify it was deleted from database
      const deletedRecord = await PortfolioAssetRecordModel.findById(assetRecord._id);
      expect(deletedRecord).toBeNull();
    });

    it('should return 404 for non-existent asset record', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/portfolio/${testPortfolio._id}/assetrecord/${nonExistentId}`)
        .expect(404);

      expect(response.body.message).toBe('Asset record not found');
    });

    it('should return 404 for asset record not belonging to the portfolio', async () => {
      // Create another portfolio
      const otherPortfolio = new PortfolioListModel({
        name: 'Other Portfolio',
        currency: 'USD',
        timezone: 'America/New_York'
      });
      await otherPortfolio.save();

      // Create asset record for other portfolio
      const assetRecord = new PortfolioAssetRecordModel({
        _pfId: otherPortfolio._id,
        _assetId: testAsset._id,
        date: '2024-01-01',
        change: 100,
        result: 100,
        price: 50000,
        unit: 'USD',
        memo: 'Initial purchase'
      });
      await assetRecord.save();

      // Try to delete it through wrong portfolio
      const response = await request(app)
        .delete(`/api/portfolio/${testPortfolio._id}/assetrecord/${assetRecord._id}`)
        .expect(404);

      expect(response.body.message).toBe('Asset record not found in this portfolio');
    });

    it('should return 400 for invalid asset record ID', async () => {
      const response = await request(app)
        .delete(`/api/portfolio/${testPortfolio._id}/assetrecord/invalid-id`)
        .expect(400);

      expect(response.body.message).toBe('Invalid asset record ID');
    });
  });
});
