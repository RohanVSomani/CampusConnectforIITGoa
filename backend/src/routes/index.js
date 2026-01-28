

import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import travelRoutes from './travel.js';
import errandRoutes from './errands.js';
import carpoolRoutes from './carpool.js';
import sosRoutes from './sos.js';
import orderRoutes from './orders.js';
import printRoutes from './print.js';
import creditsRoutes from './credits.js';
import mapRoutes from './maps.js';
import notificationsRoutes from './notifications.js';
import adminRoutes from './admin.js';
import chatRoutes from './chat.js';
import carpoolChatRoutes from './carpoolChatRoutes.js'


const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/travel', travelRoutes);
router.use('/errands', errandRoutes);
router.use('/carpool', carpoolRoutes);
router.use('/sos', sosRoutes);
router.use('/orders', orderRoutes);
router.use('/print', printRoutes);
router.use('/credits', creditsRoutes);
router.use('/map', mapRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/admin', adminRoutes);
router.use('/chat', chatRoutes);
router.use('/carpool-chat', carpoolChatRoutes);

export default router;
