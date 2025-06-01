import { Router } from 'express';
import { EventController } from '../controllers/eventController';
import { UserController } from '../controllers/userController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();
const eventController = new EventController();
const userController = new UserController();

// User's events (organized and attending)
router.get('/events', authenticateToken, eventController.getUserEvents);

// Admin routes for user management
router.get('/admin/dashboard/stats', authenticateToken, requireAdmin, userController.getDashboardStats);
router.get('/admin/users', authenticateToken, requireAdmin, userController.getAllUsers);
router.post('/admin/users/:userId/promote', authenticateToken, requireAdmin, userController.promoteToAdmin);
router.post('/admin/users/:userId/demote', authenticateToken, requireAdmin, userController.demoteFromAdmin);
router.post('/admin/users/:userId/suspend', authenticateToken, requireAdmin, userController.suspendUser);

export default router;
