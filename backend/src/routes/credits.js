

import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { catchAsync } from '../middleware/validate.js';
import * as creditsController from '../controllers/creditsController.js';

const router = Router();

router.use(authenticate);

router.get('/balance', catchAsync(creditsController.balance));
router.get('/history', catchAsync(creditsController.history));
router.get('/leaderboard', catchAsync(creditsController.leaderboard));

export default router;
