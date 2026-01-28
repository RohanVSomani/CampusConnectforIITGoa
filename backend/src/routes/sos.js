

import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { validate, catchAsync } from '../middleware/validate.js';
import * as sosController from '../controllers/sosController.js';

const router = Router();

router.post(
  '/',
  authenticate,
  [
    body('lng').isFloat(),
    body('lat').isFloat(),
    body('address').optional().trim(),
    body('message').optional().trim(),
  ],
  validate,
  catchAsync(sosController.create)
);

router.get('/', authenticate, catchAsync(sosController.list));
router.patch('/:id', authenticate, catchAsync(sosController.update));

export default router;
