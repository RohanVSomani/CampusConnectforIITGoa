

import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, catchAsync } from '../middleware/validate.js';
import * as printController from '../controllers/printController.js';

const router = Router();

router.get('/shops', catchAsync(printController.shops));

router.use(authenticate);

router.post(
  '/',
  [
    body('shopId').isMongoId(),
    body('fileUrl').trim().notEmpty(),
    body('fileName').trim().notEmpty(),
    body('copies').optional().isInt({ min: 1 }),
    body('sides').optional().isIn(['single', 'double']),
    body('color').optional().isIn(['bw', 'color']),
    body('totalCost').optional().isFloat({ min: 0 }),
    body('creditsUsed').optional().isInt({ min: 0 }),
  ],
  validate,
  catchAsync(printController.create)
);

router.get('/my', catchAsync(printController.my));
router.get('/shop', authorize('xerox_shop'), catchAsync(printController.shopQueue));
router.patch('/:id', catchAsync(printController.update));

export default router;
