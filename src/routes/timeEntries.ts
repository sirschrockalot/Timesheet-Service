import { Router } from 'express';
import {
  getTimeEntries,
  getTimeEntryById,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  getTimeEntryForWeek
} from '../controllers/timeEntryController';
import { validate, timeEntrySchemas } from '../middleware/validation';

const router = Router();

// GET /api/time-entries - Get all time entries with optional filters
router.get('/', validate(timeEntrySchemas.list), getTimeEntries);

// GET /api/time-entries/week - Get time entry for specific user and week
router.get('/week', getTimeEntryForWeek);

// GET /api/time-entries/:id - Get a specific time entry by ID
router.get('/:id', validate(timeEntrySchemas.getById), getTimeEntryById);

// POST /api/time-entries - Create a new time entry
router.post('/', validate(timeEntrySchemas.create), createTimeEntry);

// PUT /api/time-entries/:id - Update an existing time entry
router.put('/:id', validate(timeEntrySchemas.update), updateTimeEntry);

// DELETE /api/time-entries/:id - Delete a time entry
router.delete('/:id', validate(timeEntrySchemas.getById), deleteTimeEntry);

export default router;
