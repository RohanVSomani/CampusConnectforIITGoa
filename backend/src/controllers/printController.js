//Print controller – shops, create, my, shop, update. Uses Xerox workflow service.
 

import { User } from '../models/User.js';
import { PrintJob } from '../models/PrintJob.js';
import * as xeroxWorkflow from '../services/xeroxWorkflow.js';

export async function shops(req, res) {
  const list = await User.find({ role: 'xerox_shop', isActive: true })
    .select('name shopName shopLocation')
    .lean();
  res.json({ success: true, data: list });
}

export async function create(req, res) {
  const payload = {
    fileUrl: req.body.fileUrl,
    fileName: req.body.fileName,
    copies: req.body.copies || 1,
    sides: req.body.sides || 'single',
    color: req.body.color || 'bw',
    totalCost: req.body.totalCost ?? 0,
    creditsUsed: req.body.creditsUsed ?? 0,
  };
  const data = await xeroxWorkflow.createJob(req.user._id, req.body.shopId, payload);
  res.status(201).json({ success: true, data });
}

export async function my(req, res) {
  const list = await PrintJob.find({ userId: req.user._id })
    .populate('shopId', 'name shopName shopLocation')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: list });
}

export async function shopQueue(req, res) {
  const list = await PrintJob.find({ shopId: req.user._id })
    .populate('userId', 'name email')
    .sort({ createdAt: 1 })
    .lean();
  res.json({ success: true, data: list });
}

export async function update(req, res) {
  const data = await xeroxWorkflow.updateJobStatus(
    req.params.id,
    req.user,
    { status: req.body.status }
  );
  res.json({ success: true, data });
}
