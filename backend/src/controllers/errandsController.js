//errands controller - creating updating completing errands
import { Errand } from '../models/Errand.js';
import * as creditsEngine from '../services/creditsEngine.js';
import { CreditLog } from '../models/CreditLog.js';
export async function list(req, res) {
  const filters = {};
  if (req.query.status) filters.status = req.query.status;
  if (req.query.type) filters.type = req.query.type;
  const list = await Errand.find(filters)
    .populate('userId', 'name email')
    .populate('claimedBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: list });
}

export async function create(req, res) {
  if (req.body.rewardCredits > 0) {
    const owner = await User.findById(req.user._id);
    if (owner.credits < req.body.rewardCredits) {
      return res.status(400).json({
        success: false,
        message: 'You do not have enough credits to post this reward',
      });
    }
  }
  
  const doc = await Errand.create({ ...req.body, userId: req.user._id });
  const populated = await Errand.findById(doc._id).populate('userId', 'name email').lean();
  res.status(201).json({ success: true, data: populated });
}

export async function my(req, res) {
  const list = await Errand.find({ userId: req.user._id })
    .populate('userId', 'name email')
    .populate('claimedBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: list });
}


export async function claim(req, res) {
  const errand = await Errand.findOne({ _id: req.params.id, status: 'open' });
  if (!errand) return res.status(404).json({ success: false, message: 'Errand not found or not open' });
  if (errand.userId.toString() === req.user._id.toString()) {
    return res.status(400).json({ success: false, message: 'Cannot claim own errand' });
  }
  errand.status = 'claimed';
  errand.claimedBy = req.user._id;
  await errand.save();
  const populated = await Errand.findById(errand._id)
    .populate('userId', 'name email')
    .populate('claimedBy', 'name email')
    .lean();
  res.json({ success: true, data: populated });
}

export async function update(req, res) {
  const errand = await Errand.findById(req.params.id);
  if (!errand) {
    return res.status(404).json({ success: false, message: 'Errand not found' });
  }

  const isOwner = errand.userId.toString() === req.user._id.toString();
  const isClaimant =
    errand.claimedBy &&
    errand.claimedBy.toString() === req.user._id.toString();

  const { status, bonusCredits = 0 } = req.body;

  if (status === 'in_progress') {
    if (!isClaimant) {
      return res.status(403).json({
        success: false,
        message: 'Only the claimant can start the errand',
      });
    }
    errand.status = 'in_progress';
  }

  else if (status === 'completed') {
    if (!isOwner && !isClaimant) {
      return res.status(403).json({
        success: false,
        message: 'Only owner or claimant can complete this errand',
      });
    }
  
    if (errand.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Errand already completed',
      });
    }
  
    errand.status = 'completed';
    errand.completedAt = new Date();
  
    const BASE_REWARD = 5;
    const bonus = Number(errand.rewardCredits || 0);
  
    if (bonus > 0) {
      try {
        await creditsEngine.deduct(
          errand.userId,  
          bonus,
          'errand_bonus',
          {
            refId: errand._id,
            refType: 'Errand',
          }
        );
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: 'Owner does not have enough credits to pay bonus',
        });
      }
    }
  
    const totalReward = BASE_REWARD + bonus;
  
    if (errand.claimedBy) {
      const alreadyCredited = await CreditLog.findOne({
        refId: errand._id,
        reason: 'errand_complete',
      });
  
      if (!alreadyCredited) {
        await creditsEngine.add(
          errand.claimedBy,
          totalReward,
          'errand_complete',
          {
            refId: errand._id,
            refType: 'Errand',
            metadata: {
              baseReward: BASE_REWARD,
              bonus,
            },
          }
        );
      }
    }
  }
  else if (status === 'cancelled') {
    if (!isOwner && !isClaimant) {
      return res.status(403).json({
        success: false,
        message: 'Only owner or claimant can cancel this errand',
      });
    }

    if (errand.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed errand',
      });
    }

    errand.status = 'cancelled';
  }

  else if (status === 'open') {
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Only owner can reopen this errand',
      });
    }

    if (errand.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reopen a completed errand',
      });
    }

    errand.status = 'open';
    errand.claimedBy = null;
  }

  else {
    return res.status(400).json({
      success: false,
      message: 'Invalid status',
    });
  }

  await errand.save();

  const populated = await Errand.findById(errand._id)
    .populate('userId', 'name email')
    .populate('claimedBy', 'name email')
    .lean();

  res.json({ success: true, data: populated });
}
