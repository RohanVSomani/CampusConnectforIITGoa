//Orders controller – createGroup, list, create, update. Emits Socket.IO for group.
 

import { v4 as uuidv4 } from 'uuid';
import { Order } from '../models/Order.js';

export async function createGroup(req, res) {
  const groupId = uuidv4();
  res.status(201).json({ success: true, groupId });
}

export async function list(req, res) {
  const filter = req.query.groupId ? { groupId: req.query.groupId } : { createdBy: req.user._id };
  const list = await Order.find(filter)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: list });
}

export async function create(req, res) {
  const { groupId, vendor, vendorLocation, items, deliveryLocation } = req.body;
  const totalAmount = items.reduce((s, i) => s + i.quantity * i.price, 0);
  const doc = await Order.create({
    groupId,
    vendor,
    vendorLocation: vendorLocation || '',
    createdBy: req.user._id,
    items,
    totalAmount,
    deliveryLocation: deliveryLocation || '',
    status: 'open',
  });
  const populated = await Order.findById(doc._id).populate('createdBy', 'name email').lean();
  const io = req.app.get('io');
  const ordersNs = io?.of?.('/orders');
  if (ordersNs) ordersNs.to(`group:${groupId}`).emit('order:added', populated);
  res.status(201).json({ success: true, data: populated });
}

export async function update(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not your order' });
  }
  if (['placed', 'preparing', 'delivered', 'cancelled'].includes(req.body.status)) {
    order.status = req.body.status;
    if (req.body.status === 'placed') order.placedAt = new Date();
  }
  await order.save();
  const populated = await Order.findById(order._id).populate('createdBy', 'name email').lean();
  const io = req.app.get('io');
  const ordersNs = io?.of?.('/orders');
  if (ordersNs) ordersNs.to(`group:${order.groupId}`).emit('order:updated', populated);
  res.json({ success: true, data: populated });
}
