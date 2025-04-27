import dotenv from 'dotenv';
import app from './app';
import connectDB from './utils/database';
import setupPortfolioSnapshotCron from './cron/portfolio-snapshot.cron';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  setupPortfolioSnapshotCron();
};

startServer();
