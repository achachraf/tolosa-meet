import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateSignUp, validateSignIn, validateUpdateProfile } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/signup', validateSignUp, authController.signUp);
router.post('/signin', validateSignIn, authController.signIn);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, validateUpdateProfile, authController.updateProfile);
router.delete('/account', authenticateToken, authController.deleteAccount);

export default router;
