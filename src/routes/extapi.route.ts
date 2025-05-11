import express from 'express';
import efController from '../controllers/extapi.controller';

const router = express.Router();

router.get('/:category/:ticker/:date', efController.getExternalData);

export default router;
