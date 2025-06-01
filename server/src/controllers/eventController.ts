import { Request, Response } from 'express';
import { EventService } from '../services/eventService';
import { CreateEventRequest, UpdateEventRequest } from '../types';

const eventService = new EventService();

export class EventController {
  async createEvent(req: Request, res: Response) {
    try {
      const eventData: CreateEventRequest = req.body;
      const event = await eventService.createEvent(eventData, req.user!.uid);
      
      res.status(201).json({
        success: true,
        event
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getEvents(req: Request, res: Response) {
    try {
      const { category, search, limit = '20', offset = '0' } = req.query;
      
      const events = await eventService.getEvents(
        category as string,
        search as string,
        parseInt(limit as string),
        parseInt(offset as string)
      );
      
      res.json({
        success: true,
        events
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getEventById(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const event = await eventService.getEventById(eventId);
      
      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }

      res.json({
        success: true,
        event
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const updates: UpdateEventRequest = req.body;
      
      const event = await eventService.updateEvent(eventId, updates, req.user!.uid);
      
      res.json({
        success: true,
        event
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      await eventService.deleteEvent(eventId, req.user!.uid);
      
      res.json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async joinEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      await eventService.joinEvent(eventId, req.user!.uid);
      
      res.json({
        success: true,
        message: 'Successfully joined event'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async leaveEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      await eventService.leaveEvent(eventId, req.user!.uid);
      
      res.json({
        success: true,
        message: 'Successfully left event'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getEventAttendees(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const attendees = await eventService.getEventAttendees(eventId);
      
      res.json({
        success: true,
        attendees
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getUserEvents(req: Request, res: Response) {
    try {
      const { type = 'attending' } = req.query;
      const events = await eventService.getUserEvents(
        req.user!.uid,
        type as 'organized' | 'attending'
      );
      
      res.json({
        success: true,
        events
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Admin-only methods for content moderation
  async adminDeleteEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const { reason } = req.body;
      
      await eventService.adminDeleteEvent(eventId, req.user!.uid, reason);
      
      res.json({
        success: true,
        message: 'Event removed by admin'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getAllEventsForModeration(req: Request, res: Response) {
    try {
      const { status, limit = '50', offset = '0' } = req.query;
      
      const events = await eventService.getAllEventsForModeration(
        status as string,
        parseInt(limit as string),
        parseInt(offset as string)
      );
      
      res.json({
        success: true,
        events
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async flagEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const { reason } = req.body;
      
      await eventService.flagEvent(eventId, req.user!.uid, reason);
      
      res.json({
        success: true,
        message: 'Event flagged for review'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}
