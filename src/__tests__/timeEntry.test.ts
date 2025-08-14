import request from 'supertest';
import app from '../app';
import TimeEntry from '../models/TimeEntry';

describe('TimeEntry API', () => {
  const mockTimeEntry = {
    userId: 'user123',
    weekStart: '2024-01-01T00:00:00.000Z',
    weekEnd: '2024-01-07T23:59:59.999Z',
    hours: [8, 8, 8, 8, 8, 0, 0],
    notes: 'Test timesheet entry',
    status: 'draft'
  };

  describe('POST /api/time-entries', () => {
    it('should create a new time entry', async () => {
      const response = await request(app)
        .post('/api/time-entries')
        .send(mockTimeEntry)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(mockTimeEntry.userId);
      expect(response.body.data.hours).toEqual(mockTimeEntry.hours);
    });

    it('should return 400 for invalid hours array', async () => {
      const invalidEntry = {
        ...mockTimeEntry,
        hours: [8, 8, 8, 8, 8] // Only 5 days instead of 7
      };

      const response = await request(app)
        .post('/api/time-entries')
        .send(invalidEntry)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 for duplicate entry', async () => {
      // Create first entry
      await request(app)
        .post('/api/time-entries')
        .send(mockTimeEntry);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/time-entries')
        .send(mockTimeEntry)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Time entry already exists for this week');
    });
  });

  describe('GET /api/time-entries', () => {
    beforeEach(async () => {
      // Create test entries
      await TimeEntry.create([
        mockTimeEntry,
        { ...mockTimeEntry, userId: 'user456', weekStart: '2024-01-08T00:00:00.000Z', weekEnd: '2024-01-14T23:59:59.999Z' }
      ]);
    });

    it('should return all time entries', async () => {
      const response = await request(app)
        .get('/api/time-entries')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);
    });

    it('should filter by userId', async () => {
      const response = await request(app)
        .get('/api/time-entries?userId=user123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].userId).toBe('user123');
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/time-entries?status=draft')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('GET /api/time-entries/:id', () => {
    let timeEntryId: string;

    beforeEach(async () => {
      const entry = await TimeEntry.create(mockTimeEntry);
      timeEntryId = entry._id.toString();
    });

    it('should return a specific time entry', async () => {
      const response = await request(app)
        .get(`/api/time-entries/${timeEntryId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(timeEntryId);
    });

    it('should return 404 for non-existent entry', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/time-entries/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Time entry not found');
    });
  });

  describe('PUT /api/time-entries/:id', () => {
    let timeEntryId: string;

    beforeEach(async () => {
      const entry = await TimeEntry.create(mockTimeEntry);
      timeEntryId = entry._id.toString();
    });

    it('should update a time entry', async () => {
      const updates = {
        notes: 'Updated notes',
        status: 'submitted'
      };

      const response = await request(app)
        .put(`/api/time-entries/${timeEntryId}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notes).toBe(updates.notes);
      expect(response.body.data.status).toBe(updates.status);
      expect(response.body.data.submittedAt).toBeDefined();
    });

    it('should return 404 for non-existent entry', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/time-entries/${fakeId}`)
        .send({ notes: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Time entry not found');
    });
  });

  describe('DELETE /api/time-entries/:id', () => {
    let timeEntryId: string;

    beforeEach(async () => {
      const entry = await TimeEntry.create(mockTimeEntry);
      timeEntryId = entry._id.toString();
    });

    it('should delete a time entry', async () => {
      const response = await request(app)
        .delete(`/api/time-entries/${timeEntryId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Time entry deleted successfully');

      // Verify it's actually deleted
      const deletedEntry = await TimeEntry.findById(timeEntryId);
      expect(deletedEntry).toBeNull();
    });

    it('should return 404 for non-existent entry', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/time-entries/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Time entry not found');
    });
  });

  describe('GET /api/time-entries/week', () => {
    beforeEach(async () => {
      await TimeEntry.create(mockTimeEntry);
    });

    it('should return time entry for specific user and week', async () => {
      const response = await request(app)
        .get('/api/time-entries/week')
        .query({
          userId: 'user123',
          weekStart: '2024-01-01T00:00:00.000Z'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.userId).toBe('user123');
    });

    it('should return null for non-existent entry', async () => {
      const response = await request(app)
        .get('/api/time-entries/week')
        .query({
          userId: 'user999',
          weekStart: '2024-01-01T00:00:00.000Z'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeNull();
    });

    it('should return 400 for missing parameters', async () => {
      const response = await request(app)
        .get('/api/time-entries/week')
        .query({ userId: 'user123' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('userId and weekStart are required');
    });
  });
});
