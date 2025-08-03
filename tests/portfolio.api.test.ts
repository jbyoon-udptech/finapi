import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { PortfolioListModel } from '../src/db/portfolio.model';
import portfolioApi from '../src/db/portfolio.api';

const app = express();
app.use(express.json());
app.use('/api/portfolio', portfolioApi);

describe('Portfolio API', () => {

  describe('GET /api/portfolio', () => {
    it('should return empty array when no portfolios exist', async () => {
      const response = await request(app)
        .get('/api/portfolio')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all portfolios', async () => {
      // Create test portfolios
      const portfolio1 = new PortfolioListModel({
        name: 'Test Portfolio 1',
        currency: 'KRW',
        timezone: 'Asia/Seoul'
      });
      const portfolio2 = new PortfolioListModel({
        name: 'Test Portfolio 2',
        currency: 'USD',
        timezone: 'America/New_York'
      });

      await portfolio1.save();
      await portfolio2.save();

      const response = await request(app)
        .get('/api/portfolio')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('Test Portfolio 1');
      expect(response.body[1].name).toBe('Test Portfolio 2');
    });
  });

  describe('GET /api/portfolio/:id', () => {
    it('should return a specific portfolio by ID', async () => {
      const portfolio = new PortfolioListModel({
        name: 'Test Portfolio',
        currency: 'KRW',
        timezone: 'Asia/Seoul'
      });
      await portfolio.save();

      const response = await request(app)
        .get(`/api/portfolio/${portfolio._id}`)
        .expect(200);

      expect(response.body.name).toBe('Test Portfolio');
      expect(response.body.currency).toBe('KRW');
      expect(response.body.timezone).toBe('Asia/Seoul');
    });

    it('should return 404 for non-existent portfolio', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/portfolio/${nonExistentId}`)
        .expect(404);

      expect(response.body.message).toBe('Portfolio not found');
    });

    it('should return 400 for invalid ObjectId', async () => {
      const response = await request(app)
        .get('/api/portfolio/invalid-id')
        .expect(400);

      expect(response.body.message).toBe('Invalid portfolio ID');
    });
  });

  describe('POST /api/portfolio', () => {
    it('should create a new portfolio', async () => {
      const portfolioData = {
        name: 'New Portfolio',
        currency: 'USD',
        timezone: 'America/New_York'
      };

      const response = await request(app)
        .post('/api/portfolio')
        .send(portfolioData)
        .expect(201);

      expect(response.body.message).toBe('Portfolio created successfully');
      expect(response.body.data.name).toBe(portfolioData.name);
      expect(response.body.data.currency).toBe(portfolioData.currency);
      expect(response.body.data.timezone).toBe(portfolioData.timezone);

      // Verify it was saved to database
      const savedPortfolio = await PortfolioListModel.findById(response.body.data._id);
      expect(savedPortfolio).toBeTruthy();
      expect(savedPortfolio?.name).toBe(portfolioData.name);
    });

    it('should return 400 when required fields are missing', async () => {
      const incompleteData = {
        currency: 'USD'
        // missing name and timezone
      };

      const response = await request(app)
        .post('/api/portfolio')
        .send(incompleteData)
        .expect(400);

      expect(response.body.message).toBe('Name, currency, and timezone are required');
    });

    it('should return 400 when portfolio name already exists', async () => {
      // Create a portfolio first
      await new PortfolioListModel({
        name: 'Duplicate Portfolio',
        currency: 'KRW',
        timezone: 'Asia/Seoul'
      }).save();

      // Try to create another with the same name
      const duplicateData = {
        name: 'Duplicate Portfolio',
        currency: 'USD',
        timezone: 'America/New_York'
      };

      const response = await request(app)
        .post('/api/portfolio')
        .send(duplicateData)
        .expect(400);

      expect(response.body.message).toBe('Portfolio name already exists');
    });
  });

  describe('PUT /api/portfolio/:id', () => {
    it('should update an existing portfolio', async () => {
      const portfolio = new PortfolioListModel({
        name: 'Original Portfolio',
        currency: 'KRW',
        timezone: 'Asia/Seoul'
      });
      await portfolio.save();

      const updateData = {
        name: 'Updated Portfolio',
        currency: 'USD',
        timezone: 'America/New_York'
      };

      const response = await request(app)
        .put(`/api/portfolio/${portfolio._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Portfolio updated successfully');

      // Verify the update in database
      const updatedPortfolio = await PortfolioListModel.findById(portfolio._id);
      expect(updatedPortfolio?.name).toBe(updateData.name);
      expect(updatedPortfolio?.currency).toBe(updateData.currency);
      expect(updatedPortfolio?.timezone).toBe(updateData.timezone);
    });

    it('should return 404 for non-existent portfolio', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateData = {
        name: 'Updated Portfolio',
        currency: 'USD',
        timezone: 'America/New_York'
      };

      const response = await request(app)
        .put(`/api/portfolio/${nonExistentId}`)
        .send(updateData)
        .expect(404);

      expect(response.body.message).toBe('Portfolio not found');
    });

    it('should return 400 when required fields are missing', async () => {
      const portfolio = new PortfolioListModel({
        name: 'Test Portfolio',
        currency: 'KRW',
        timezone: 'Asia/Seoul'
      });
      await portfolio.save();

      const incompleteData = {
        currency: 'USD'
        // missing name and timezone
      };

      const response = await request(app)
        .put(`/api/portfolio/${portfolio._id}`)
        .send(incompleteData)
        .expect(400);

      expect(response.body.message).toBe('Name, currency, and timezone are required');
    });
  });

  describe('DELETE /api/portfolio/:id', () => {
    it('should delete an existing portfolio', async () => {
      const portfolio = new PortfolioListModel({
        name: 'Portfolio to Delete',
        currency: 'KRW',
        timezone: 'Asia/Seoul'
      });
      await portfolio.save();

      const response = await request(app)
        .delete(`/api/portfolio/${portfolio._id}`)
        .expect(200);

      expect(response.body.message).toBe('Portfolio deleted successfully');

      // Verify it was deleted from database
      const deletedPortfolio = await PortfolioListModel.findById(portfolio._id);
      expect(deletedPortfolio).toBeNull();
    });

    it('should return 404 for non-existent portfolio', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/portfolio/${nonExistentId}`)
        .expect(404);

      expect(response.body.message).toBe('Portfolio not found');
    });

    it('should return 400 for invalid ObjectId', async () => {
      const response = await request(app)
        .delete('/api/portfolio/invalid-id')
        .expect(400);

      expect(response.body.message).toBe('Invalid portfolio ID');
    });
  });
});
