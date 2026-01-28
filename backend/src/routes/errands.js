

import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { validate, catchAsync } from '../middleware/validate.js';
import * as errandsController from '../controllers/errandsController.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  [
    query('status').optional().isIn(['open', 'claimed', 'in_progress', 'completed', 'cancelled']),
    query('type').optional().isIn(['item', 'errand']),
  ],
  validate,
  catchAsync(errandsController.list)
);

router.post(
  '/',
  [
    body('title').trim().notEmpty(),
    body('description').optional().trim(),
    body('type').optional().isIn(['item', 'errand']),
    body('fromLocation').optional().trim(),
    body('toLocation').optional().trim(),
    body('deadline').optional().isISO8601(),
    body('rewardCredits').optional().isInt({ min: 0 }),
  ],
  validate,
  catchAsync(errandsController.create)
);

router.get('/my', catchAsync(errandsController.my));
router.post('/:id/claim', catchAsync(errandsController.claim));
router.patch('/:id', catchAsync(errandsController.update));

export default router;
