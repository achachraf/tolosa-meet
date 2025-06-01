import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();
const categoryController = new CategoryController();

// Public routes
router.get('/', categoryController.getCategories);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, categoryController.createCategory);
router.put('/:slug', authenticateToken, requireAdmin, categoryController.updateCategory);
router.delete('/:slug', authenticateToken, requireAdmin, categoryController.deleteCategory);

export default router;
