# Timesheet Service API Documentation

## Overview

The Timesheet Service provides a RESTful API for managing weekly timesheet entries. This service allows users to create, read, update, and delete timesheet entries, with support for status management and filtering capabilities.

## Quick Start

### Accessing the API Documentation

Once the service is running, you can access the interactive Swagger documentation at:

```
http://localhost:3001/api-docs
```

This provides a complete interactive interface where you can:
- Explore all available endpoints
- View request/response schemas
- Test API calls directly from the browser
- See detailed examples and error responses

### Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://api.timetrackr.com`

## API Endpoints

### Health Check

**GET** `/health`

Check if the service is running and healthy.

```bash
curl http://localhost:3001/health
```

**Response:**
```json
{
  "success": true,
  "message": "Timesheet Service is running",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "environment": "development"
}
```

### Time Entries

#### Get All Time Entries

**GET** `/api/time-entries`

Retrieve a paginated list of time entries with optional filtering.

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `status` (optional): Filter by status (`draft`, `submitted`, `approved`, `rejected`)
- `weekStart` (optional): Filter entries from this date
- `weekEnd` (optional): Filter entries up to this date
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page, 1-100 (default: 50)

**Example:**
```bash
curl "http://localhost:3001/api/time-entries?userId=user123&status=submitted&page=1&limit=10"
```

#### Get Time Entry by ID

**GET** `/api/time-entries/{id}`

Retrieve a specific time entry by its ID.

**Example:**
```bash
curl http://localhost:3001/api/time-entries/507f1f77bcf86cd799439011
```

#### Get Time Entry for Week

**GET** `/api/time-entries/week`

Get a time entry for a specific user and week.

**Query Parameters:**
- `userId` (required): User ID
- `weekStart` (required): Week start date (ISO format)

**Example:**
```bash
curl "http://localhost:3001/api/time-entries/week?userId=user123&weekStart=2024-01-01"
```

#### Create Time Entry

**POST** `/api/time-entries`

Create a new time entry.

**Request Body:**
```json
{
  "userId": "user123",
  "weekStart": "2024-01-01T00:00:00.000Z",
  "weekEnd": "2024-01-07T23:59:59.999Z",
  "hours": [8, 8, 8, 8, 8, 0, 0],
  "notes": "Worked on project A and attended team meetings",
  "status": "draft"
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/time-entries \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "weekStart": "2024-01-01T00:00:00.000Z",
    "weekEnd": "2024-01-07T23:59:59.999Z",
    "hours": [8, 8, 8, 8, 8, 0, 0],
    "notes": "Worked on project A and attended team meetings",
    "status": "draft"
  }'
```

#### Update Time Entry

**PUT** `/api/time-entries/{id}`

Update an existing time entry.

**Request Body:**
```json
{
  "hours": [8, 8, 8, 8, 8, 4, 0],
  "notes": "Updated notes for the week",
  "status": "submitted"
}
```

**Example:**
```bash
curl -X PUT http://localhost:3001/api/time-entries/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "hours": [8, 8, 8, 8, 8, 4, 0],
    "notes": "Updated notes for the week",
    "status": "submitted"
  }'
```

#### Delete Time Entry

**DELETE** `/api/time-entries/{id}`

Delete a time entry permanently.

**Example:**
```bash
curl -X DELETE http://localhost:3001/api/time-entries/507f1f77bcf86cd799439011
```

## Data Models

### TimeEntry

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "user123",
  "weekStart": "2024-01-01T00:00:00.000Z",
  "weekEnd": "2024-01-07T23:59:59.999Z",
  "hours": [8, 8, 8, 8, 8, 0, 0],
  "notes": "Worked on project A and attended team meetings",
  "status": "submitted",
  "submittedAt": "2024-01-05T10:30:00.000Z",
  "approvedAt": "2024-01-06T14:20:00.000Z",
  "approvedBy": "manager456",
  "createdAt": "2024-01-01T09:00:00.000Z",
  "updatedAt": "2024-01-05T10:30:00.000Z"
}
```

### Field Descriptions

- **userId**: Unique identifier for the user
- **weekStart**: Start date of the work week (Monday)
- **weekEnd**: End date of the work week (Sunday)
- **hours**: Array of 7 numbers representing hours worked each day (Monday to Sunday)
- **notes**: Optional notes for the week (max 1000 characters)
- **status**: Current status (`draft`, `submitted`, `approved`, `rejected`)
- **submittedAt**: Timestamp when the timesheet was submitted
- **approvedAt**: Timestamp when the timesheet was approved
- **approvedBy**: User ID of the person who approved the timesheet
- **createdAt**: Timestamp when the entry was created
- **updatedAt**: Timestamp when the entry was last updated

## Status Values

- **draft**: Initial state, can be edited
- **submitted**: User has submitted the timesheet for review
- **approved**: Manager has approved the timesheet
- **rejected**: Manager has rejected the timesheet

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": ["Detailed error information"]
}
```

### Common HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **404**: Not Found
- **500**: Internal Server Error

### Validation Errors

When validation fails, you'll receive a 400 response with details:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "userId is required",
    "hours must be an array of 7 numbers"
  ]
}
```

## Rate Limiting

The API implements rate limiting of **100 requests per 15 minutes** per IP address. When exceeded, you'll receive:

```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later."
}
```

## Pagination

List endpoints support pagination with these parameters:

- **page**: Page number (default: 1)
- **limit**: Items per page, 1-100 (default: 50)

Response includes pagination info:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

## Examples

### Creating a Weekly Timesheet

```bash
curl -X POST http://localhost:3001/api/time-entries \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "john.doe",
    "weekStart": "2024-01-01T00:00:00.000Z",
    "weekEnd": "2024-01-07T23:59:59.999Z",
    "hours": [8, 8, 8, 8, 8, 4, 0],
    "notes": "Worked on feature development and bug fixes. Attended team standups.",
    "status": "draft"
  }'
```

### Submitting a Timesheet

```bash
curl -X PUT http://localhost:3001/api/time-entries/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "submitted"
  }'
```

### Filtering Submitted Timesheets

```bash
curl "http://localhost:3001/api/time-entries?status=submitted&page=1&limit=25"
```

### Getting User's Timesheets for a Date Range

```bash
curl "http://localhost:3001/api/time-entries?userId=john.doe&weekStart=2024-01-01&weekEnd=2024-01-31"
```

## Integration Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:3001';

// Create a timesheet
async function createTimesheet(userId, weekStart, hours, notes) {
  try {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const response = await axios.post(`${API_BASE}/api/time-entries`, {
      userId,
      weekStart,
      weekEnd: weekEnd.toISOString(),
      hours,
      notes,
      status: 'draft'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating timesheet:', error.response?.data);
    throw error;
  }
}

// Get user's timesheets
async function getUserTimesheets(userId, page = 1, limit = 50) {
  try {
    const response = await axios.get(`${API_BASE}/api/time-entries`, {
      params: { userId, page, limit }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching timesheets:', error.response?.data);
    throw error;
  }
}
```

### Python

```python
import requests
from datetime import datetime, timedelta

API_BASE = 'http://localhost:3001'

def create_timesheet(user_id, week_start, hours, notes):
    week_end = week_start + timedelta(days=6)
    
    data = {
        'userId': user_id,
        'weekStart': week_start.isoformat(),
        'weekEnd': week_end.isoformat(),
        'hours': hours,
        'notes': notes,
        'status': 'draft'
    }
    
    response = requests.post(f'{API_BASE}/api/time-entries', json=data)
    response.raise_for_status()
    return response.json()

def get_user_timesheets(user_id, page=1, limit=50):
    params = {'userId': user_id, 'page': page, 'limit': limit}
    response = requests.get(f'{API_BASE}/api/time-entries', params=params)
    response.raise_for_status()
    return response.json()
```

## Testing with Swagger UI

1. Start the service: `npm run dev`
2. Open your browser to `http://localhost:3001/api-docs`
3. Click on any endpoint to expand it
4. Click "Try it out" to test the endpoint
5. Fill in the required parameters
6. Click "Execute" to make the request
7. View the response and response headers

## Support

For questions or issues with the API:

- **Email**: support@timetrackr.com
- **Documentation**: Visit `/api-docs` when the service is running
- **GitHub**: Create an issue in the repository

## License

This API is licensed under the MIT License.
