import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import assetRouter from './routes/asset.route';
import extapiRouter from './routes/extapi.route';
import portfolioRouter from './routes/portfolio.route';
import { errorHandler } from './utils/error-handler';

const app: Application = express();

// 미들웨어
app.use(cors());
app.use(bodyParser.json());

// 라우터
app.use('/extapi', extapiRouter);
app.use('/assets', assetRouter);
app.use('/portfolios', portfolioRouter);

// 에러 핸들러
app.use(errorHandler);

export default app;
