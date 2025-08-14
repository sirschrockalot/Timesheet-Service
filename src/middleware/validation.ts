import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export interface ValidationSchema {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}

export const validate = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    };

    const errors: string[] = [];

    if (schema.body) {
      const { error } = schema.body.validate(req.body, validationOptions);
      if (error) {
        errors.push(...error.details.map(detail => detail.message));
      }
    }

    if (schema.query) {
      const { error } = schema.query.validate(req.query, validationOptions);
      if (error) {
        errors.push(...error.details.map(detail => detail.message));
      }
    }

    if (schema.params) {
      const { error } = schema.params.validate(req.params, validationOptions);
      if (error) {
        errors.push(...error.details.map(detail => detail.message));
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    next();
  };
};

// Validation schemas for time entries
export const timeEntrySchemas = {
  create: {
    body: Joi.object({
      userId: Joi.string().required().trim(),
      weekStart: Joi.date().required(),
      weekEnd: Joi.date().required(),
      hours: Joi.array().items(Joi.number().min(0).max(24)).length(7).required(),
      notes: Joi.string().max(1000).optional().default(''),
      status: Joi.string().valid('draft', 'submitted', 'approved', 'rejected').optional().default('draft')
    })
  },
  update: {
    body: Joi.object({
      userId: Joi.string().trim(),
      weekStart: Joi.date(),
      weekEnd: Joi.date(),
      hours: Joi.array().items(Joi.number().min(0).max(24)).length(7),
      notes: Joi.string().max(1000),
      status: Joi.string().valid('draft', 'submitted', 'approved', 'rejected'),
      submittedAt: Joi.date(),
      approvedAt: Joi.date(),
      approvedBy: Joi.string().trim()
    }),
    params: Joi.object({
      id: Joi.string().required()
    })
  },
  getById: {
    params: Joi.object({
      id: Joi.string().required()
    })
  },
  list: {
    query: Joi.object({
      userId: Joi.string().optional(),
      status: Joi.string().valid('draft', 'submitted', 'approved', 'rejected').optional(),
      weekStart: Joi.date().optional(),
      weekEnd: Joi.date().optional(),
      limit: Joi.number().integer().min(1).max(100).optional().default(50),
      page: Joi.number().integer().min(1).optional().default(1)
    })
  }
};
