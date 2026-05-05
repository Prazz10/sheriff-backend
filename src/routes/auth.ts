import { Router } from 'express';
import { signUp, signIn, verifyOtp } from '../controllers/authController';

const router = Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/verify-otp', verifyOtp);

export default router;
