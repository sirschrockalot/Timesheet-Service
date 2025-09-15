import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Timesheet Service API',
      version: '1.0.0',
      description: `
        A comprehensive REST API for managing timesheet entries in the TimeTrackr system.
        
        ## Overview
        This service provides endpoints for creating, reading, updating, and deleting timesheet entries.
        Each timesheet entry represents a week's worth of work hours for a specific user.
        
        ## Key Features
        - **Weekly Time Tracking**: Track hours for each day of the week (7 days)
        - **Status Management**: Support for draft, submitted, approved, and rejected statuses
        - **User-specific Entries**: Each entry is associated with a specific user
        - **Pagination**: Efficient data retrieval with pagination support
        - **Filtering**: Filter entries by user, status, and date ranges
        
        ## Data Model
        - **userId**: Unique identifier for the user
        - **weekStart**: Start date of the work week
        - **weekEnd**: End date of the work week
        - **hours**: Array of 7 numbers representing hours worked each day
        - **notes**: Optional notes for the week
        - **status**: Current status of the timesheet (draft/submitted/approved/rejected)
        - **submittedAt**: Timestamp when the timesheet was submitted
        - **approvedAt**: Timestamp when the timesheet was approved
        - **approvedBy**: User ID of the person who approved the timesheet
        
        ## Authentication
        This API currently does not implement authentication. In production, you should add
        appropriate authentication middleware (JWT, API keys, etc.).
        
        ## Rate Limiting
        The API implements rate limiting of 100 requests per 15 minutes per IP address.
      `,
      contact: {
        name: 'TimeTrackr Team',
        email: 'support@timetrackr.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3007',
        description: 'Development server'
      },
      {
        url: 'https://api.timetrackr.com',
        description: 'Production server'
      }
    ],
    components: {
      schemas: {
        TimeEntry: {
          type: 'object',
          required: ['userId', 'weekStart', 'weekEnd', 'hours'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique identifier for the time entry',
              example: '507f1f77bcf86cd799439011'
            },
            userId: {
              type: 'string',
              description: 'Unique identifier for the user',
              example: 'user123'
            },
            weekStart: {
              type: 'string',
              format: 'date',
              description: 'Start date of the work week (Monday)',
              example: '2024-01-01T00:00:00.000Z'
            },
            weekEnd: {
              type: 'string',
              format: 'date',
              description: 'End date of the work week (Sunday)',
              example: '2024-01-07T23:59:59.999Z'
            },
            hours: {
              type: 'array',
              items: {
                type: 'number',
                minimum: 0,
                maximum: 24
              },
              minItems: 7,
              maxItems: 7,
              description: 'Array of 7 numbers representing hours worked each day (Monday to Sunday)',
              example: [8, 8, 8, 8, 8, 0, 0]
            },
            notes: {
              type: 'string',
              maxLength: 1000,
              description: 'Optional notes for the week',
              example: 'Worked on project A and attended team meetings'
            },
            status: {
              type: 'string',
              enum: ['draft', 'submitted', 'approved', 'rejected'],
              default: 'draft',
              description: 'Current status of the timesheet'
            },
            submittedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the timesheet was submitted',
              example: '2024-01-05T10:30:00.000Z'
            },
            approvedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the timesheet was approved',
              example: '2024-01-06T14:20:00.000Z'
            },
            approvedBy: {
              type: 'string',
              description: 'User ID of the person who approved the timesheet',
              example: 'manager456'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the time entry was created'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the time entry was last updated'
            }
          }
        },
        TimeEntryCreate: {
          type: 'object',
          required: ['userId', 'weekStart', 'weekEnd', 'hours'],
          properties: {
            userId: {
              type: 'string',
              description: 'Unique identifier for the user',
              example: 'user123'
            },
            weekStart: {
              type: 'string',
              format: 'date',
              description: 'Start date of the work week (Monday)',
              example: '2024-01-01T00:00:00.000Z'
            },
            weekEnd: {
              type: 'string',
              format: 'date',
              description: 'End date of the work week (Sunday)',
              example: '2024-01-07T23:59:59.999Z'
            },
            hours: {
              type: 'array',
              items: {
                type: 'number',
                minimum: 0,
                maximum: 24
              },
              minItems: 7,
              maxItems: 7,
              description: 'Array of 7 numbers representing hours worked each day (Monday to Sunday)',
              example: [8, 8, 8, 8, 8, 0, 0]
            },
            notes: {
              type: 'string',
              maxLength: 1000,
              description: 'Optional notes for the week',
              example: 'Worked on project A and attended team meetings'
            },
            status: {
              type: 'string',
              enum: ['draft', 'submitted', 'approved', 'rejected'],
              default: 'draft',
              description: 'Initial status of the timesheet'
            }
          }
        },
        TimeEntryUpdate: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'Unique identifier for the user'
            },
            weekStart: {
              type: 'string',
              format: 'date',
              description: 'Start date of the work week (Monday)'
            },
            weekEnd: {
              type: 'string',
              format: 'date',
              description: 'End date of the work week (Sunday)'
            },
            hours: {
              type: 'array',
              items: {
                type: 'number',
                minimum: 0,
                maximum: 24
              },
              minItems: 7,
              maxItems: 7,
              description: 'Array of 7 numbers representing hours worked each day (Monday to Sunday)'
            },
            notes: {
              type: 'string',
              maxLength: 1000,
              description: 'Optional notes for the week'
            },
            status: {
              type: 'string',
              enum: ['draft', 'submitted', 'approved', 'rejected'],
              description: 'Current status of the timesheet'
            },
            submittedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the timesheet was submitted'
            },
            approvedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the timesheet was approved'
            },
            approvedBy: {
              type: 'string',
              description: 'User ID of the person who approved the timesheet'
            }
          }
        },
        PaginationInfo: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              description: 'Current page number',
              example: 1
            },
            limit: {
              type: 'integer',
              description: 'Number of items per page',
              example: 50
            },
            total: {
              type: 'integer',
              description: 'Total number of items',
              example: 150
            },
            pages: {
              type: 'integer',
              description: 'Total number of pages',
              example: 3
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              description: 'Response data'
            },
            message: {
              type: 'string',
              description: 'Success message',
              example: 'Operation completed successfully'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Validation failed'
            },
            details: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Detailed error information',
              example: ['userId is required', 'hours must be an array of 7 numbers']
            }
          }
        },
        TimeEntryListResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/TimeEntry'
              }
            },
            pagination: {
              $ref: '#/components/schemas/PaginationInfo'
            }
          }
        }
      },
      parameters: {
        TimeEntryId: {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Unique identifier of the time entry',
          schema: {
            type: 'string'
          },
          example: '507f1f77bcf86cd799439011'
        },
        UserIdQuery: {
          name: 'userId',
          in: 'query',
          description: 'Filter by user ID',
          schema: {
            type: 'string'
          },
          example: 'user123'
        },
        StatusQuery: {
          name: 'status',
          in: 'query',
          description: 'Filter by status',
          schema: {
            type: 'string',
            enum: ['draft', 'submitted', 'approved', 'rejected']
          },
          example: 'submitted'
        },
        WeekStartQuery: {
          name: 'weekStart',
          in: 'query',
          description: 'Filter by week start date (ISO date string)',
          schema: {
            type: 'string',
            format: 'date'
          },
          example: '2024-01-01'
        },
        WeekEndQuery: {
          name: 'weekEnd',
          in: 'query',
          description: 'Filter by week end date (ISO date string)',
          schema: {
            type: 'string',
            format: 'date'
          },
          example: '2024-01-07'
        },
        LimitQuery: {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page (1-100)',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 50
          },
          example: 25
        },
        PageQuery: {
          name: 'page',
          in: 'query',
          description: 'Page number',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          },
          example: 1
        }
      }
    },
    tags: [
      {
        name: 'Time Entries',
        description: 'Operations for managing timesheet entries'
      },
      {
        name: 'Health',
        description: 'Health check and service status'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/app.ts']
};

export default options;
