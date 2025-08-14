import { Request, Response } from 'express';
import TimeEntry, { ITimeEntry } from '../models/TimeEntry';

export const getTimeEntries = async (req: Request, res: Response) => {
  try {
    const { userId, status, weekStart, weekEnd, limit = 50, page = 1 } = req.query;
    
    // Build query
    const query: any = {};
    
    if (userId) {
      query.userId = userId;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (weekStart || weekEnd) {
      query.weekStart = {};
      if (weekStart) {
        query.weekStart.$gte = new Date(weekStart as string);
      }
      if (weekEnd) {
        query.weekStart.$lte = new Date(weekEnd as string);
      }
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const timeEntries = await TimeEntry.find(query)
      .sort({ weekStart: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');
    
    const total = await TimeEntry.countDocuments(query);
    
    return res.json({
      success: true,
      data: timeEntries,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching time entries:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch time entries'
    });
  }
};

export const getTimeEntryById = async (req: Request, res: Response) => {
  try {
    const timeEntry = await TimeEntry.findById(req.params.id).select('-__v');
    
    if (!timeEntry) {
      return res.status(404).json({
        success: false,
        error: 'Time entry not found'
      });
    }
    
    return res.json({
      success: true,
      data: timeEntry
    });
    
  } catch (error: any) {
    console.error('Error fetching time entry:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid time entry ID'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch time entry'
    });
  }
};

export const createTimeEntry = async (req: Request, res: Response) => {
  try {
    const { userId, weekStart, weekEnd, hours, notes, status } = req.body;
    
    // Check if entry already exists for this user and week
    const existingEntry = await TimeEntry.findOne({
      userId,
      weekStart: new Date(weekStart)
    });
    
    if (existingEntry) {
      return res.status(400).json({
        success: false,
        error: 'Time entry already exists for this week'
      });
    }
    
    // Create new time entry
    const timeEntry = new TimeEntry({
      userId,
      weekStart: new Date(weekStart),
      weekEnd: new Date(weekEnd),
      hours,
      notes: notes || '',
      status: status || 'draft',
      submittedAt: status === 'submitted' ? new Date() : undefined
    });
    
    await timeEntry.save();
    
    return res.status(201).json({
      success: true,
      data: timeEntry,
      message: 'Time entry created successfully'
    });
    
  } catch (error: any) {
    console.error('Error creating time entry:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Time entry already exists for this week'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to create time entry'
    });
  }
};

export const updateTimeEntry = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    
    // Check if updating status to submitted
    if (updates.status === 'submitted' && !updates.submittedAt) {
      updates.submittedAt = new Date();
    }
    
    const updatedTimeEntry = await TimeEntry.findByIdAndUpdate(
      req.params.id,
      { ...updates },
      { new: true, runValidators: true }
    ).select('-__v');
    
    if (!updatedTimeEntry) {
      return res.status(404).json({
        success: false,
        error: 'Time entry not found'
      });
    }
    
    return res.json({
      success: true,
      data: updatedTimeEntry,
      message: 'Time entry updated successfully'
    });
    
  } catch (error: any) {
    console.error('Error updating time entry:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid time entry ID'
      });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to update time entry'
    });
  }
};

export const deleteTimeEntry = async (req: Request, res: Response) => {
  try {
    const timeEntry = await TimeEntry.findByIdAndDelete(req.params.id);
    
    if (!timeEntry) {
      return res.status(404).json({
        success: false,
        error: 'Time entry not found'
      });
    }
    
    return res.json({
      success: true,
      message: 'Time entry deleted successfully'
    });
    
  } catch (error: any) {
    console.error('Error deleting time entry:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid time entry ID'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to delete time entry'
    });
  }
};

export const getTimeEntryForWeek = async (req: Request, res: Response) => {
  try {
    const { userId, weekStart } = req.query;
    
    if (!userId || !weekStart) {
      return res.status(400).json({
        success: false,
        error: 'userId and weekStart are required'
      });
    }
    
    const timeEntry = await TimeEntry.findOne({
      userId,
      weekStart: new Date(weekStart as string)
    }).select('-__v');
    
    return res.json({
      success: true,
      data: timeEntry || null
    });
    
  } catch (error: any) {
    console.error('Error fetching time entry for week:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch time entry for week'
    });
  }
};
