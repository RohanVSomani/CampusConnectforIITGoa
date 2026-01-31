import { PrintJob } from '../models/PrintJob.js';
import * as xeroxWorkflow from '../services/xeroxWorkflow.js';
import { AppError } from '../utils/AppError.js';
import { User } from '../models/User.js';

export async function shops(req, res) {
  const list = await User.find({ role: 'shop', isActive: true })
    .select('name shopName shopLocation')
    .lean();

  res.json({ success: true, data: list });
}

export async function create(req, res) {
  const file = req.file;
  if (!file) throw new AppError('File required', 400);

  const payload = {
    file: {
      data: file.buffer,
      contentType: file.mimetype,
    },
    fileName: file.originalname,
    copies: req.body.copies || 1,
    sides: req.body.sides || 'single',
    color: req.body.color || 'bw',
  };

  const data = await xeroxWorkflow.createJob(
    req.user._id,
    req.body.shopId,
    payload
  );

  res.status(201).json({ success: true, data });
}

export async function my(req, res) {
  const list = await PrintJob.find({ userId: req.user._id })
    .populate('shopId', 'name shopName')
    .sort({ createdAt: -1 })
    .select('-file.data')
    .lean();

  res.json({ success: true, data: list });
}

export async function shopQueue(req, res) {
  const list = await PrintJob.find({ shopId: req.user._id })
    .populate('userId', 'name email')
    .sort({ createdAt: 1 })
    .select('-file.data')
    .lean();

  res.json({ success: true, data: list });
}

export async function update(req, res) {
  const data = await xeroxWorkflow.updateJobStatus(
    req.params.id,
    req.user,
    req.body,
    req.app
  );

  res.json({ success: true, data });
}

export async function collect(req, res) {
  const job = await PrintJob.findOne({
    _id: req.params.id,
    userId: req.user._id,
    status: 'ready',
  });

  if (!job) throw new AppError('Job not ready', 400);

  job.status = 'collected';
  job.collectedAt = new Date();
  await job.save();

  res.json({ success: true });
}

export async function file(req, res) {
  const job = await PrintJob.findById(req.params.id).select('file fileName');

  if (!job || !job.file?.data) {
    throw new AppError('File not found', 404);
  }

  res.setHeader('Content-Type', job.file.contentType);
  res.setHeader('Content-Disposition', `inline; filename="${job.fileName}"`);
  res.send(job.file.data);
}
