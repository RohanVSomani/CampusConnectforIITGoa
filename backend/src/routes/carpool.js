
import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { validate, catchAsync } from '../middleware/validate.js';
import * as carpoolController from '../controllers/carpoolController.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  [
    query('from').optional().trim(),
    query('to').optional().trim(),
    query('status').optional().isIn(['open', 'full', 'departed', 'completed', 'cancelled']),
  ],
  validate,
  catchAsync(carpoolController.list)
);

router.post(
  '/',
  [
    body('from').trim().notEmpty(),
    body('to').trim().notEmpty(),
    body('departureAt').isISO8601(),
    body('maxSeats').isInt({ min: 1 }),
    body('pricePerSeat').optional().isFloat({ min: 0 }),
    body('notes').optional().trim(),
  ],
  validate,
  catchAsync(carpoolController.create)
);

router.get('/my', catchAsync(carpoolController.my));
router.post('/:id/join', catchAsync(carpoolController.join));
router.post('/:id/leave', catchAsync(carpoolController.leave));
router.patch('/:id/end', catchAsync(carpoolController.end));

router.patch('/:id', catchAsync(carpoolController.update));

export default router;
