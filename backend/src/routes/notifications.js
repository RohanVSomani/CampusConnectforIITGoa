

import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { catchAsync } from '../middleware/validate.js';
import * as notificationsController from '../controllers/notificationsController.js';

const router = Router();

router.use(authenticate);

router.get('/', catchAsync(notificationsController.list));
router.patch('/:id/read', catchAsync(notificationsController.readOne));
router.patch('/read-all', catchAsync(notificationsController.readAll));

export default router;
