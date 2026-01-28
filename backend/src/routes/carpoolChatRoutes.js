import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { CarpoolChat } from '../models/CarPoolSchema.js';
import { catchAsync } from '../middleware/validate.js';

const router = Router();
router.use(authenticate);

router.get('/:carpoolId', catchAsync(async (req, res) => {
  const messages = await CarpoolChat.find({ carpoolId: req.params.carpoolId })
    .populate('sender', 'name')
    .sort({ createdAt: 1 })
    .lean();

  res.json({ success: true, data: messages });
}));

export default router;
