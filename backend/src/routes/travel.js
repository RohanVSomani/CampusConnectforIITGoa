

import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { validate, catchAsync } from '../middleware/validate.js';
import * as travelController from '../controllers/travelController.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  [
    query('type').optional().isIn(['request', 'offer']),
    query('from').optional().trim(),
    query('to').optional().trim(),
    query('status').optional().isIn(['open', 'matched', 'completed', 'cancelled']),
  ],
  validate,
  catchAsync(travelController.list)
);

router.post(
  '/',
  [
    body('type').isIn(['request', 'offer']),
    body('from').trim().notEmpty(),
    body('to').trim().notEmpty(),
    body('departureAt').isISO8601(),
    body('seats').optional().isInt({ min: 1 }),
    body('notes').optional().trim(),
  ],
  validate,
  catchAsync(travelController.create)
);

router.get('/my', catchAsync(travelController.my));

router.get('/matches', catchAsync(travelController.myMatches));

router.get(
  '/suggest',
  [query('travelId').isMongoId()],
  validate,
  catchAsync(travelController.suggest)
);

router.post(
  '/:id/match',
  [body('matchedTravelId').isMongoId()],
  validate,
  catchAsync(travelController.match)
);

router.patch('/:id', catchAsync(travelController.update));

export default router;
