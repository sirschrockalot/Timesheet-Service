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

/**
 * @swagger
 * /api/time-entries:
 *   get:
 *     summary: Get all time entries with optional filters
 *     description: |
 *       Retrieve a paginated list of time entries with optional filtering capabilities.
 *       Supports filtering by user ID, status, and date ranges.
 *       
 *       **Filtering Options:**
 *       - `userId`: Filter entries for a specific user
 *       - `status`: Filter by entry status (draft, submitted, approved, rejected)
 *       - `weekStart`: Filter entries starting from this date
 *       - `weekEnd`: Filter entries up to this date
 *       
 *       **Pagination:**
 *       - `page`: Page number (default: 1)
 *       - `limit`: Items per page (1-100, default: 50)
 *     tags: [Time Entries]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdQuery'
 *       - $ref: '#/components/parameters/StatusQuery'
 *       - $ref: '#/components/parameters/WeekStartQuery'
 *       - $ref: '#/components/parameters/WeekEndQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - $ref: '#/components/parameters/PageQuery'
 *     responses:
 *       200:
 *         description: Successfully retrieved time entries
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimeEntryListResponse'
 *             example:
 *               success: true
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   userId: "user123"
 *                   weekStart: "2024-01-01T00:00:00.000Z"
 *                   weekEnd: "2024-01-07T23:59:59.999Z"
 *                   hours: [8, 8, 8, 8, 8, 0, 0]
 *                   notes: "Regular work week"
 *                   status: "submitted"
 *                   submittedAt: "2024-01-05T10:30:00.000Z"
 *                   createdAt: "2024-01-01T09:00:00.000Z"
 *                   updatedAt: "2024-01-05T10:30:00.000Z"
 *               pagination:
 *                 page: 1
 *                 limit: 50
 *                 total: 1
 *                 pages: 1
 *       400:
 *         description: Bad request - Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', validate(timeEntrySchemas.list), getTimeEntries);

/**
 * @swagger
 * /api/time-entries/week:
 *   get:
 *     summary: Get time entry for specific user and week
 *     description: |
 *       Retrieve a specific time entry for a user and week combination.
 *       This endpoint is useful for checking if a user has already submitted
 *       a timesheet for a particular week.
 *     tags: [Time Entries]
 *     parameters:
 *       - name: userId
 *         in: query
 *         required: true
 *         description: User ID to search for
 *         schema:
 *           type: string
 *         example: "user123"
 *       - name: weekStart
 *         in: query
 *         required: true
 *         description: Week start date (ISO date string)
 *         schema:
 *           type: string
 *           format: date
 *         example: "2024-01-01"
 *     responses:
 *       200:
 *         description: Successfully retrieved time entry (or null if not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/TimeEntry'
 *                     - type: null
 *             example:
 *               success: true
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 userId: "user123"
 *                 weekStart: "2024-01-01T00:00:00.000Z"
 *                 weekEnd: "2024-01-07T23:59:59.999Z"
 *                 hours: [8, 8, 8, 8, 8, 0, 0]
 *                 notes: "Regular work week"
 *                 status: "submitted"
 *                 submittedAt: "2024-01-05T10:30:00.000Z"
 *                 createdAt: "2024-01-01T09:00:00.000Z"
 *                 updatedAt: "2024-01-05T10:30:00.000Z"
 *       400:
 *         description: Bad request - Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "userId and weekStart are required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/week', getTimeEntryForWeek);

/**
 * @swagger
 * /api/time-entries/{id}:
 *   get:
 *     summary: Get a specific time entry by ID
 *     description: |
 *       Retrieve a single time entry by its unique identifier.
 *       Returns detailed information about the timesheet entry.
 *     tags: [Time Entries]
 *     parameters:
 *       - $ref: '#/components/parameters/TimeEntryId'
 *     responses:
 *       200:
 *         description: Successfully retrieved time entry
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TimeEntry'
 *             example:
 *               success: true
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 userId: "user123"
 *                 weekStart: "2024-01-01T00:00:00.000Z"
 *                 weekEnd: "2024-01-07T23:59:59.999Z"
 *                 hours: [8, 8, 8, 8, 8, 0, 0]
 *                 notes: "Regular work week"
 *                 status: "submitted"
 *                 submittedAt: "2024-01-05T10:30:00.000Z"
 *                 createdAt: "2024-01-01T09:00:00.000Z"
 *                 updatedAt: "2024-01-05T10:30:00.000Z"
 *       400:
 *         description: Bad request - Invalid time entry ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Invalid time entry ID"
 *       404:
 *         description: Time entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Time entry not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', validate(timeEntrySchemas.getById), getTimeEntryById);

/**
 * @swagger
 * /api/time-entries:
 *   post:
 *     summary: Create a new time entry
 *     description: |
 *       Create a new timesheet entry for a user and week combination.
 *       The system prevents duplicate entries for the same user and week.
 *       
 *       **Important Notes:**
 *       - Each user can only have one timesheet per week
 *       - Hours array must contain exactly 7 numbers (Monday to Sunday)
 *       - Each hour value must be between 0 and 24
 *       - If status is set to 'submitted', submittedAt will be automatically set
 *     tags: [Time Entries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TimeEntryCreate'
 *           example:
 *             userId: "user123"
 *             weekStart: "2024-01-01T00:00:00.000Z"
 *             weekEnd: "2024-01-07T23:59:59.999Z"
 *             hours: [8, 8, 8, 8, 8, 0, 0]
 *             notes: "Worked on project A and attended team meetings"
 *             status: "draft"
 *     responses:
 *       201:
 *         description: Time entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TimeEntry'
 *                 message:
 *                   type: string
 *                   example: "Time entry created successfully"
 *             example:
 *               success: true
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 userId: "user123"
 *                 weekStart: "2024-01-01T00:00:00.000Z"
 *                 weekEnd: "2024-01-07T23:59:59.999Z"
 *                 hours: [8, 8, 8, 8, 8, 0, 0]
 *                 notes: "Worked on project A and attended team meetings"
 *                 status: "draft"
 *                 createdAt: "2024-01-01T09:00:00.000Z"
 *                 updatedAt: "2024-01-01T09:00:00.000Z"
 *               message: "Time entry created successfully"
 *       400:
 *         description: Bad request - Validation failed or duplicate entry
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: Validation Error
 *                 value:
 *                   success: false
 *                   error: "Validation failed"
 *                   details: ["userId is required", "hours must be an array of 7 numbers"]
 *               duplicate_entry:
 *                 summary: Duplicate Entry Error
 *                 value:
 *                   success: false
 *                   error: "Time entry already exists for this week"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', validate(timeEntrySchemas.create), createTimeEntry);

/**
 * @swagger
 * /api/time-entries/{id}:
 *   put:
 *     summary: Update an existing time entry
 *     description: |
 *       Update an existing timesheet entry. All fields are optional in the request body.
 *       Only the fields provided will be updated.
 *       
 *       **Special Behavior:**
 *       - If status is updated to 'submitted' and submittedAt is not provided, it will be automatically set
 *       - All validation rules apply to the updated data
 *     tags: [Time Entries]
 *     parameters:
 *       - $ref: '#/components/parameters/TimeEntryId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TimeEntryUpdate'
 *           example:
 *             hours: [8, 8, 8, 8, 8, 4, 0]
 *             notes: "Updated notes for the week"
 *             status: "submitted"
 *     responses:
 *       200:
 *         description: Time entry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TimeEntry'
 *                 message:
 *                   type: string
 *                   example: "Time entry updated successfully"
 *             example:
 *               success: true
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 userId: "user123"
 *                 weekStart: "2024-01-01T00:00:00.000Z"
 *                 weekEnd: "2024-01-07T23:59:59.999Z"
 *                 hours: [8, 8, 8, 8, 8, 4, 0]
 *                 notes: "Updated notes for the week"
 *                 status: "submitted"
 *                 submittedAt: "2024-01-05T10:30:00.000Z"
 *                 createdAt: "2024-01-01T09:00:00.000Z"
 *                 updatedAt: "2024-01-05T10:30:00.000Z"
 *               message: "Time entry updated successfully"
 *       400:
 *         description: Bad request - Invalid ID or validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Time entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Time entry not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', validate(timeEntrySchemas.update), updateTimeEntry);

/**
 * @swagger
 * /api/time-entries/{id}:
 *   delete:
 *     summary: Delete a time entry
 *     description: |
 *       Permanently delete a timesheet entry by its ID.
 *       This action cannot be undone.
 *     tags: [Time Entries]
 *     parameters:
 *       - $ref: '#/components/parameters/TimeEntryId'
 *     responses:
 *       200:
 *         description: Time entry deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Time entry deleted successfully"
 *             example:
 *               success: true
 *               message: "Time entry deleted successfully"
 *       400:
 *         description: Bad request - Invalid time entry ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Invalid time entry ID"
 *       404:
 *         description: Time entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Time entry not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', validate(timeEntrySchemas.getById), deleteTimeEntry);

export default router;
