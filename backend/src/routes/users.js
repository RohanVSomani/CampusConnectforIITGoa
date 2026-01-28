
import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { validate, catchAsync } from '../middleware/validate.js';
import * as usersController from '../controllers/usersController.js';

const router = Router();

router.use(authenticate);

router.get('/profile', usersController.getProfile);

router.patch(
  '/profile',
  [
    body('name').optional().trim().notEmpty(),
    body('phone').optional().trim(),
    body('campusId').optional().trim(),
    body('dorm').optional().trim(),
    body('avatar').optional().trim(),
  ],
  validate,
  catchAsync(usersController.updateProfile)
);

router.post(
  '/location',
  [body('lng').isFloat(), body('lat').isFloat()],
  validate,
  catchAsync(usersController.updateLocation)
);

export default router;
