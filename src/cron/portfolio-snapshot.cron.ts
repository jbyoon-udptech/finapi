import cron from 'node-cron';
import { DateTime } from 'luxon';
import portfolioService from '../services/portfolio.service';
import { toSeoulTime, formatDate } from '../utils/timezone';
import PortfolioModel from '../models/portfolio.model';
import { APIError } from '../utils/error-handler';

const setupPortfolioSnapshotCron = () => {
  // 매일 자정 (서울 시간 기준)에 실행
  cron.schedule('0 0 * * *', async () => {
    const todaySeoulFormatted = toSeoulTime().toFormat('yyyy-MM-dd');
    console.log(`Creating daily portfolio snapshots for ${todaySeoulFormatted}`);

    try {
      const portfolios = await PortfolioModel.find();
      for (const portfolio of portfolios) {
        await portfolioService.createDailyPortfolioSnapshot(portfolio.id.toString(), todaySeoulFormatted);
        console.log(`Snapshot created for portfolio: ${portfolio.name} (${portfolio.id}) on ${todaySeoulFormatted}`);
      }
      console.log('Daily portfolio snapshot creation completed.');
    } catch (error) {
      console.error('Error creating daily portfolio snapshots:', error);
    }
  }, {
    scheduled: true,
    timezone: 'Asia/Seoul',
  });
};

export default setupPortfolioSnapshotCron;
