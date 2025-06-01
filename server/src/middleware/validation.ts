import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validateSignUp = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    displayName: Joi.string().min(2).max(50).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateSignIn = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateCreateEvent = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(80).required(),
    description: Joi.string().max(4000).required(),
    category: Joi.string().required(),
    location: Joi.object({
      geoPoint: Joi.object({
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required()
      }).required(),
      address: Joi.string().required()
    }).required(),
    capacity: Joi.number().integer().min(0).max(500).required(),
    startTime: Joi.string().isoDate().required(),
    endTime: Joi.string().isoDate().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // Validate that endTime is after startTime
  const startTime = new Date(req.body.startTime);
  const endTime = new Date(req.body.endTime);
  
  if (endTime <= startTime) {
    return res.status(400).json({ error: 'End time must be after start time' });
  }

  // Validate that event is not in the past
  if (startTime <= new Date()) {
    return res.status(400).json({ error: 'Event cannot be scheduled in the past' });
  }

  next();
};

export const validateUpdateProfile = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    displayName: Joi.string().min(2).max(50),
    bio: Joi.string().max(500).allow('')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
