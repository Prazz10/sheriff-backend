import { Router } from 'express';
import { triggerSOS, resolveSOS } from '../controllers/sosController';

const router = Router();

router.post('/trigger', triggerSOS);
router.post('/resolve', resolveSOS);

export default router;
