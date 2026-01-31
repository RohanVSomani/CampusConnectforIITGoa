import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, catchAsync } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';
import * as printController from '../controllers/printController.js';

const router = Router();

router.get('/shops', catchAsync(printController.shops));
router.get('/:id/file', catchAsync(printController.file));
router.use(authenticate);

router.post(
  '/',
  upload.single('file'),
  [
    body('shopId').isMongoId(),
    body('copies').optional().isInt({ min: 1 }),
    body('sides').optional().isIn(['single', 'double']),
    body('color').optional().isIn(['bw', 'color']),
  ],
  validate,
  catchAsync(printController.create)
);

router.get('/my', catchAsync(printController.my));
router.get('/shop', authorize('shop'), catchAsync(printController.shopQueue));
router.patch('/:id', authorize('shop'), catchAsync(printController.update));
router.patch('/:id/collect', catchAsync(printController.collect));

// 🔥 PDF VIEW / DOWNLOAD


export default router;
