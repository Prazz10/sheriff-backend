import { Router } from 'express';
import { getProfile, updateProfile, addGuardian, removeGuardian } from '../controllers/userController';

const router = Router();

router.get('/profile/:userId', getProfile);
router.put('/profile/:userId', updateProfile);
router.post('/guardian', addGuardian);
router.delete('/guardian/:id', removeGuardian);

export default router;
