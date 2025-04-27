import express from 'express';
import efController from '../controllers/ef.controller';

const router = express.Router();

router.get('/:category/:ticker/:date', efController.getExternalData);

export default router;
