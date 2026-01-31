import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as c from '../controllers/ordersController.js';

const router = Router();
router.use(authenticate);

router.post('/group', c.createGroup);
router.post('/join', c.joinGroup);
router.post('/add-items', c.addItems);

router.get('/groups/open', c.listOpenGroups);
router.get('/my', c.listMyGroups);
router.get('/group/:groupId', c.getGroupOrders);

router.patch('/finalize/:groupId', c.finalizeGroup);

export default router;
