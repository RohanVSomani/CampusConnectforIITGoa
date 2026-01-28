import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { Match } from '../models/Match.js';
import { catchAsync } from '../middleware/validate.js';

const router = Router();
router.use(authenticate);

router.get('/:matchId', catchAsync(async (req, res) => {
  const { matchId } = req.params;

  const match = await Match.findById(matchId)
    .populate({
      path: 'travelA',
      select: 'userId',
      populate: { path: 'userId', select: '_id name email' }
    })
    .populate({
      path: 'travelB',
      select: 'userId',
      populate: { path: 'userId', select: '_id name email' }
    });

  if (!match) return res.status(404).json({ message: 'Match not found' });

  const members = [
    match.travelA.userId,
    match.travelB.userId
  ];

  if (!members.some(u => u._id.toString() === req.user._id.toString())) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const messages = await ChatMessage.find({ matchId })
    .populate('sender', 'name')
    .sort({ createdAt: 1 })
    .lean();

  res.json({ success: true, data: { members, messages } });
}));

export default router;
