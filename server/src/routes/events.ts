import { Router } from 'express';
import { EventController } from '../controllers/eventController';
import { validateCreateEvent } from '../middleware/validation';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();
const eventController = new EventController();

// Public routes
router.get('/', eventController.getEvents);
router.get('/:eventId', eventController.getEventById);
router.get('/:eventId/attendees', eventController.getEventAttendees);

// Protected routes
router.post('/', authenticateToken, validateCreateEvent, eventController.createEvent);
router.put('/:eventId', authenticateToken, eventController.updateEvent);
router.delete('/:eventId', authenticateToken, eventController.deleteEvent);
router.post('/:eventId/join', authenticateToken, eventController.joinEvent);
router.post('/:eventId/leave', authenticateToken, eventController.leaveEvent);
router.post('/:eventId/flag', authenticateToken, eventController.flagEvent);

// Admin-only routes
router.get('/admin/moderation', authenticateToken, requireAdmin, eventController.getAllEventsForModeration);
router.delete('/admin/:eventId', authenticateToken, requireAdmin, eventController.adminDeleteEvent);

export default router;
