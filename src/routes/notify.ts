import { Router } from 'express';
import { sendSOSAlert, sendLocationAlert } from '../controllers/notifyController';

const router = Router();

router.post('/sos', sendSOSAlert);
router.post('/location', sendLocationAlert);

export default router;
