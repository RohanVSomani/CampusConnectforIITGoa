import { Router } from 'express';
import { query } from 'express-validator';
import { optionalAuth } from '../middleware/auth.js';
import { validate, catchAsync } from '../middleware/validate.js';
import * as mapController from '../controllers/mapController.js';

const router = Router();

router.get(
  '/heatmap',
  optionalAuth,
  [
    query('sw').optional().matches(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/),
    query('ne').optional().matches(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/),
  ],
  validate,
  catchAsync(mapController.heatmap)
);

router.get('/pois', catchAsync(mapController.pois));

export default router;
