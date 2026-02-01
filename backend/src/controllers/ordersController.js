import { v4 as uuidv4 } from 'uuid';
import { Order } from '../models/Order.js';

export async function createGroup(req, res) {
  const { vendor, vendorLocation, deliveryLocation, items } = req.body;

  const groupId = uuidv4();
  const totalAmount = items.reduce((s, i) => s + i.quantity * i.price, 0);

  const order = await Order.create({
    groupId,
    leader: req.user._id,
    members: [req.user._id],
    vendor,
    vendorLocation,
    deliveryLocation,
    items: items.map(i => ({ ...i, addedBy: req.user._id })),
    totalAmount,
    status: 'open',
  });

  res.status(201).json({ success: true, data: order });
}

export async function joinGroup(req, res) {
  const { groupId, items = [] } = req.body; // Default items to empty array

  const order = await Order.findOne({ groupId });
  if (!order) return res.status(404).json({ message: 'Group not found' });

  if (order.status !== 'open')
    return res.status(400).json({ message: 'Group closed' });

  // Add user to members list if they aren't already there
  if (!order.members.includes(req.user._id)) {
    order.members.push(req.user._id);
  }

  // If items were provided during join, add them
  if (items.length > 0) {
    const mapped = items.map(i => ({ ...i, addedBy: req.user._id }));
    order.items.push(...mapped);
    order.totalAmount += items.reduce((s, i) => s + i.quantity * i.price, 0);
  }

  await order.save();

  // Return the full populated group so the frontend can display the modal immediately
  const updatedOrder = await Order.findOne({ groupId })
    .populate('leader', 'name')
    .populate('items.addedBy', 'name');

  res.json({ success: true, data: updatedOrder });
}
export async function addItems(req, res) {
  const { groupId, items } = req.body;

  const order = await Order.findOne({ groupId });
  if (!order) return res.status(404).json({ message: 'Group not found' });

  if (!order.members.includes(req.user._id))
    return res.status(403).json({ message: 'Not a group member' });

  if (order.status !== 'open')
    return res.status(400).json({ message: 'Order closed' });

  const mapped = items.map(i => ({ ...i, addedBy: req.user._id }));

  order.items.push(...mapped);
  order.totalAmount += items.reduce((s, i) => s + i.quantity * i.price, 0);

  await order.save();
  res.json({ success: true });
}

export async function listOpenGroups(req, res) {
  try {
    const userId = req.user._id;

    const groups = await Order.find({
      status: 'open',
      leader: { $ne: userId },
      members: { $ne: userId },
    })
      .select('groupId vendor vendorLocation deliveryLocation leader members createdAt')
      .populate('leader', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: groups });
  } catch (err) {
    console.error('❌ listOpenGroups:', err);
    res.status(500).json({ success: false, message: 'Failed to load open groups' });
  }
}


export async function getGroupOrders(req, res) {
  const order = await Order.findOne({ groupId: req.params.groupId })
    .populate('leader', 'name')
    .populate('items.addedBy', 'name');

  if (!order) return res.status(404).json({ message: 'Group not found' });

  res.json({ success: true, data: order });
}

export async function finalizeGroup(req, res) {
  const order = await Order.findOne({ groupId: req.params.groupId });

  if (!order) return res.status(404).json({ message: 'Group not found' });

  if (order.leader.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Only leader can finalize' });
  }

  order.status = 'placed';
  order.placedAt = new Date();

  await order.save();
  res.json({ success: true });
}
export async function listMyGroups(req, res) {
  try {
    const groups = await Order.find({
      members: req.user._id,
    })
      .populate('leader', 'name email')
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: groups });
  } catch (err) {
    console.error('❌ listMyGroups:', err);
    res.status(500).json({ success: false, message: 'Failed to load my groups' });
  }
}
