import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { AssetListModel } from '../src/db/asset.model';
import assetApi from '../src/db/asset.api';

const app = express();
app.use(express.json());
app.use('/api/asset', assetApi);

describe('Asset API', () => {

  describe('GET /api/asset', () => {
    it('should return empty array when no assets exist', async () => {
      const response = await request(app)
        .get('/api/asset')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all assets', async () => {
      // Create test assets
      const asset1 = new AssetListModel({
        name: 'Bitcoin',
        ticker: 'BTC',
        category: 'crypto',
        unit: 'USD'
      });
      const asset2 = new AssetListModel({
        name: 'Ethereum',
        ticker: 'ETH',
        category: 'crypto',
        unit: 'USD'
      });

      await asset1.save();
      await asset2.save();

      const response = await request(app)
        .get('/api/asset')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('Bitcoin');
      expect(response.body[1].name).toBe('Ethereum');
    });
  });

  describe('GET /api/asset/:id', () => {
    it('should return a specific asset by ID', async () => {
      const asset = new AssetListModel({
        name: 'Bitcoin',
        ticker: 'BTC',
        category: 'crypto',
        unit: 'USD'
      });
      await asset.save();

      const response = await request(app)
        .get(`/api/asset/${asset._id}`)
        .expect(200);

      expect(response.body.name).toBe('Bitcoin');
      expect(response.body.ticker).toBe('BTC');
      expect(response.body.category).toBe('crypto');
    });

    it('should return 404 for non-existent asset', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/asset/${nonExistentId}`)
        .expect(404);

      expect(response.body.message).toBe('Asset not found');
    });

    it('should return 400 for invalid ObjectId', async () => {
      const response = await request(app)
        .get('/api/asset/invalid-id')
        .expect(400);

      expect(response.body.message).toBe('Invalid asset ID');
    });
  });

  describe('POST /api/asset', () => {
    it('should create a new asset', async () => {
      const assetData = {
        name: 'Cardano',
        ticker: 'ADA',
        category: 'crypto',
        unit: 'USD'
      };

      const response = await request(app)
        .post('/api/asset')
        .send(assetData)
        .expect(201);

      expect(response.body.message).toBe('Asset created successfully');
      expect(response.body.data.name).toBe(assetData.name);
      expect(response.body.data.ticker).toBe(assetData.ticker);
      expect(response.body.data.category).toBe(assetData.category);

      // Verify it was saved to database
      const savedAsset = await AssetListModel.findById(response.body.data._id);
      expect(savedAsset).toBeTruthy();
      expect(savedAsset?.name).toBe(assetData.name);
    });

    it('should return 400 when required fields are missing', async () => {
      const incompleteData = {
        ticker: 'BTC'
        // missing name and category
      };

      const response = await request(app)
        .post('/api/asset')
        .send(incompleteData)
        .expect(400);

      expect(response.body.message).toBe('Name, ticker, category, and unit are required');
    });

    it('should return 400 for invalid category', async () => {
      const invalidData = {
        name: 'Invalid Asset',
        ticker: 'INV',
        category: 'invalid_category',
        unit: 'USD'
      };

      const response = await request(app)
        .post('/api/asset')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain('Invalid category');
    });

    it('should return 400 when asset ticker already exists', async () => {
      // Create an asset first
      await new AssetListModel({
        name: 'Bitcoin',
        ticker: 'BTC',
        category: 'crypto',
        unit: 'USD'
      }).save();

      // Try to create another with the same ticker
      const duplicateData = {
        name: 'Bitcoin Cash',
        ticker: 'BTC',
        category: 'crypto',
        unit: 'USD'
      };

      const response = await request(app)
        .post('/api/asset')
        .send(duplicateData)
        .expect(400);

      expect(response.body.message).toBe('Asset category&ticker already exists');
    });
  });

  describe('PUT /api/asset/:id', () => {
    it('should update an existing asset', async () => {
      const asset = new AssetListModel({
        name: 'Original Asset',
        ticker: 'ORI',
        category: 'crypto',
        unit: 'USD'
      });
      await asset.save();

      const updateData = {
        name: 'Updated Asset',
        ticker: 'UPD',
        category: 'currency',
        unit: 'KRW'
      };

      const response = await request(app)
        .put(`/api/asset/${asset._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Asset updated successfully');

      // Verify the update in database
      const updatedAsset = await AssetListModel.findById(asset._id);
      expect(updatedAsset?.name).toBe(updateData.name);
      expect(updatedAsset?.ticker).toBe(updateData.ticker);
      expect(updatedAsset?.category).toBe(updateData.category);
    });

    it('should return 404 for non-existent asset', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateData = {
        name: 'Updated Asset',
        ticker: 'UPD',
        category: 'crypto',
        unit: 'USD'
      };

      const response = await request(app)
        .put(`/api/asset/${nonExistentId}`)
        .send(updateData)
        .expect(404);

      expect(response.body.message).toBe('Asset not found');
    });

    it('should return 400 when required fields are missing', async () => {
      const asset = new AssetListModel({
        name: 'Test Asset',
        ticker: 'TST',
        category: 'crypto',
        unit: 'USD'
      });
      await asset.save();

      const incompleteData = {
        ticker: 'UPD'
        // missing name and category
      };

      const response = await request(app)
        .put(`/api/asset/${asset._id}`)
        .send(incompleteData)
        .expect(400);

      expect(response.body.message).toBe('Name, ticker, category, and unit are required');
    });
  });

  describe('DELETE /api/asset/:id', () => {
    it('should delete an existing asset', async () => {
      const asset = new AssetListModel({
        name: 'Asset to Delete',
        ticker: 'DEL',
        category: 'crypto',
        unit: 'USD'
      });
      await asset.save();

      const response = await request(app)
        .delete(`/api/asset/${asset._id}`)
        .expect(200);

      expect(response.body.message).toBe('Asset deleted successfully');

      // Verify it was deleted from database
      const deletedAsset = await AssetListModel.findById(asset._id);
      expect(deletedAsset).toBeNull();
    });

    it('should return 404 for non-existent asset', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/asset/${nonExistentId}`)
        .expect(404);

      expect(response.body.message).toBe('Asset not found');
    });

    it('should return 400 for invalid ObjectId', async () => {
      const response = await request(app)
        .delete('/api/asset/invalid-id')
        .expect(400);

      expect(response.body.message).toBe('Invalid asset ID');
    });
  });
});
