
import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { validate, catchAsync } from '../middleware/validate.js';
import * as ordersController from '../controllers/ordersController.js';

const router = Router();

router.use(authenticate);

router.post('/group', catchAsync(ordersController.createGroup));

router.get(
  '/',
  [query('groupId').optional().trim()],
  validate,
  catchAsync(ordersController.list)
);

router.post(
  '/',
  [
    body('groupId').trim().notEmpty(),
    body('vendor').trim().notEmpty(),
    body('vendorLocation').optional().trim(),
    body('items').isArray(),
    body('items.*.name').trim().notEmpty(),
    body('items.*.quantity').isInt({ min: 1 }),
    body('items.*.price').isFloat({ min: 0 }),
    body('items.*.notes').optional().trim(),
    body('deliveryLocation').optional().trim(),
  ],
  validate,
  catchAsync(ordersController.create)
);

router.patch('/:id', catchAsync(ordersController.update));

export default router;
