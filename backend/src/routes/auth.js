

import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { validate, catchAsync } from '../middleware/validate.js';
import * as authController from '../controllers/authController.js';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
    body('role').optional().isIn(['student', 'admin', 'xerox_shop', 'driver']),
  ],
  validate,
  catchAsync(authController.register)
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').exists()],
  validate,
  catchAsync(authController.login)
);

router.get('/me', authenticate, authController.me);

export default router;
