import { Router } from 'express';
import { signUp, signIn, verifyOtp, sendOTP } from '../controllers/authController';

const router = Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOtp);

export default router;
