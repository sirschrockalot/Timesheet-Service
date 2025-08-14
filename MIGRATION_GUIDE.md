# Migration Guide: TimeTrackr to Standalone Timesheet Service

This guide will help you migrate from the integrated timesheet functionality in TimeTrackr to the new standalone timesheet service.

## Overview

The timesheet functionality has been extracted from the main TimeTrackr application into a separate microservice. This provides:

- **Better scalability**: Independent scaling of timesheet operations
- **Improved maintainability**: Focused codebase for timesheet features
- **Enhanced deployment**: Separate CI/CD pipeline and deployment
- **Technology flexibility**: Can use different tech stacks if needed

## Migration Steps

### 1. Deploy the Timesheet Service

First, deploy the standalone timesheet service:

```bash
# Clone the timesheet service repository
git clone <timesheet-service-repo>
cd timesheet-service

# Set up environment variables
cp env.example .env
# Edit .env with your configuration

# Deploy using Docker Compose
docker-compose up -d

# Or deploy manually
npm install
npm run build
npm start
```

### 2. Update TimeTrackr Environment Variables

Add the timesheet service URL to your TimeTrackr environment:

```env
# Add to your TimeTrackr .env file
TIMESHEET_SERVICE_URL=http://localhost:3001
TIMESHEET_SERVICE_API_KEY=your-api-key-if-needed
```

### 3. Update API Client Functions

Replace the existing timesheet API functions in TimeTrackr with calls to the new service.

#### Before (TimeTrackr integrated API):

```typescript
// lib/api/timeEntries.ts
export async function saveDraft(userId: string, weekStart: string, weekEnd: string, hours: number[], notes: string) {
  const response = await fetch('/api/time-entries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      weekStart,
      weekEnd,
      hours,
      notes,
      status: 'draft'
    }),
  });
  
  return response.json();
}
```

#### After (Standalone service):

```typescript
// lib/api/timeEntries.ts
const TIMESHEET_SERVICE_URL = process.env.NEXT_PUBLIC_TIMESHEET_SERVICE_URL || 'http://localhost:3001';

export async function saveDraft(userId: string, weekStart: string, weekEnd: string, hours: number[], notes: string) {
  const response = await fetch(`${TIMESHEET_SERVICE_URL}/api/time-entries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Add authentication headers if needed
      // 'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      userId,
      weekStart,
      weekEnd,
      hours,
      notes,
      status: 'draft'
    }),
  });
  
  return response.json();
}

export async function getTimeEntries(filters: TimeEntryFilters = {}) {
  const params = new URLSearchParams();
  
  if (filters.userId) params.append('userId', filters.userId);
  if (filters.status) params.append('status', filters.status);
  if (filters.weekStart) params.append('weekStart', filters.weekStart);
  if (filters.weekEnd) params.append('weekEnd', filters.weekEnd);
  
  const response = await fetch(`${TIMESHEET_SERVICE_URL}/api/time-entries?${params.toString()}`);
  return response.json();
}

export async function getTimeEntryForWeek(userId: string, weekStart: string) {
  const response = await fetch(
    `${TIMESHEET_SERVICE_URL}/api/time-entries/week?userId=${userId}&weekStart=${weekStart}`
  );
  return response.json();
}

export async function updateTimeEntry(id: string, updates: Partial<TimeEntry>) {
  const response = await fetch(`${TIMESHEET_SERVICE_URL}/api/time-entries/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  return response.json();
}

export async function deleteTimeEntry(id: string) {
  const response = await fetch(`${TIMESHEET_SERVICE_URL}/api/time-entries/${id}`, {
    method: 'DELETE',
  });
  
  return response.json();
}
```

### 4. Remove Timesheet API Routes from TimeTrackr

Delete the following files from TimeTrackr as they're no longer needed:

```bash
# Remove timesheet API routes
rm -rf app/api/time-entries/

# Remove timesheet model (if not used elsewhere)
rm models/TimeEntry.ts

# Remove timesheet API client functions
rm lib/api/timeEntries.ts
```

### 5. Update Frontend Components

Update any frontend components that directly call the timesheet API to use the new service functions.

#### Example: Update TimeTracking Page

```typescript
// app/time-tracking/page.tsx
import { saveDraft, submitTimesheet, getTimeEntryForWeek, updateTimeEntry } from '../../lib/api/timeEntries';

// The component logic remains the same, just using the updated API functions
const handleSaveDraft = async () => {
  const result = await saveDraft(
    user.id,
    monday.toISOString(),
    sunday.toISOString(),
    rows[0].hours,
    rows[0].notes
  );
  
  if (result.success) {
    setSuccess('Draft saved successfully!');
  } else {
    setError(result.error || 'Failed to save draft');
  }
};
```

### 6. Add Error Handling for Service Communication

Add proper error handling for service communication:

```typescript
// lib/api/timeEntries.ts
async function handleServiceResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Service error: ${response.status}`);
  }
  
  return response.json();
}

export async function saveDraft(userId: string, weekStart: string, weekEnd: string, hours: number[], notes: string) {
  try {
    const response = await fetch(`${TIMESHEET_SERVICE_URL}/api/time-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        weekStart,
        weekEnd,
        hours,
        notes,
        status: 'draft'
      }),
    });
    
    return await handleServiceResponse(response);
  } catch (error) {
    console.error('Timesheet service error:', error);
    return {
      success: false,
      error: 'Failed to connect to timesheet service'
    };
  }
}
```

### 7. Update Docker Configuration

If using Docker, update your TimeTrackr docker-compose.yml to include the timesheet service:

```yaml
# docker-compose.yml
version: '3.8'

services:
  # ... existing TimeTrackr services ...
  
  # Timesheet Service
  timesheet-service:
    image: timesheet-service:latest
    container_name: timetrackr-timesheet-service
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      MONGODB_URI: mongodb://admin:password123@mongodb:27017/timesheet-service?authSource=admin
      NODE_ENV: production
      ALLOWED_ORIGINS: http://localhost:3000
    depends_on:
      - mongodb
    networks:
      - timetrackr-network
```

### 8. Update Environment Variables

Add the timesheet service URL to your production environment:

```env
# Production .env
TIMESHEET_SERVICE_URL=https://your-timesheet-service.com
```

## Testing the Migration

### 1. Test Local Development

```bash
# Start both services
# Terminal 1: Start TimeTrackr
cd timetrackr
npm run dev

# Terminal 2: Start Timesheet Service
cd timesheet-service
npm run dev

# Test the integration
curl http://localhost:3001/health
```

### 2. Test API Endpoints

```bash
# Test timesheet service directly
curl -X POST http://localhost:3001/api/time-entries \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "weekStart": "2024-01-01T00:00:00.000Z",
    "weekEnd": "2024-01-07T23:59:59.999Z",
    "hours": [8, 8, 8, 8, 8, 0, 0],
    "notes": "Test entry",
    "status": "draft"
  }'
```

### 3. Test Frontend Integration

1. Open TimeTrackr in your browser
2. Navigate to the time tracking page
3. Try creating, editing, and submitting timesheets
4. Verify data is saved and retrieved correctly

## Rollback Plan

If issues arise, you can rollback by:

1. **Revert API client changes**: Restore the original `lib/api/timeEntries.ts`
2. **Restore API routes**: Restore the `app/api/time-entries/` directory
3. **Restore model**: Restore `models/TimeEntry.ts`
4. **Update environment**: Remove timesheet service URL from environment variables

## Monitoring and Troubleshooting

### Health Checks

Monitor the timesheet service health:

```bash
# Check service health
curl http://localhost:3001/health

# Check Docker container health
docker ps
```

### Logs

Check service logs for issues:

```bash
# Timesheet service logs
docker logs timesheet-service

# Or if running locally
npm run dev
```

### Common Issues

1. **Connection refused**: Ensure timesheet service is running
2. **CORS errors**: Check ALLOWED_ORIGINS configuration
3. **Database connection**: Verify MongoDB connection string
4. **Authentication**: Implement proper service-to-service authentication

## Performance Considerations

1. **Connection pooling**: The service includes MongoDB connection pooling
2. **Rate limiting**: Built-in rate limiting prevents abuse
3. **Caching**: Consider adding Redis for caching frequently accessed data
4. **Load balancing**: Use a load balancer for high availability

## Security Considerations

1. **Service authentication**: Implement JWT or API key authentication
2. **Network security**: Use HTTPS in production
3. **Input validation**: The service includes comprehensive validation
4. **Rate limiting**: Prevents abuse and DoS attacks

## Next Steps

After successful migration:

1. **Monitor performance**: Track response times and error rates
2. **Add authentication**: Implement proper service-to-service authentication
3. **Set up monitoring**: Add logging and monitoring tools
4. **Optimize**: Add caching and performance optimizations
5. **Scale**: Consider horizontal scaling for high load

## Support

If you encounter issues during migration:

1. Check the service logs for error messages
2. Verify environment variable configuration
3. Test API endpoints directly
4. Review the service documentation
5. Create an issue in the timesheet service repository
