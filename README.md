# Timesheet Service

A standalone microservice for managing timesheet data, extracted from the TimeTrackr application. This service provides a RESTful API for creating, reading, updating, and deleting timesheet entries.

## Features

- **CRUD Operations**: Full Create, Read, Update, Delete functionality for timesheet entries
- **Validation**: Comprehensive input validation using Joi
- **Authentication Ready**: Prepared for JWT authentication integration
- **Rate Limiting**: Built-in rate limiting to prevent abuse
- **Error Handling**: Comprehensive error handling and logging
- **Database Indexing**: Optimized MongoDB indexes for performance
- **Testing**: Full test coverage with Jest and Supertest
- **Docker Support**: Containerized deployment with Docker
- **CI/CD**: GitHub Actions pipeline for automated testing and deployment

## API Endpoints

### Time Entries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/time-entries` | Get all time entries with optional filters |
| GET | `/api/time-entries/week` | Get time entry for specific user and week |
| GET | `/api/time-entries/:id` | Get a specific time entry by ID |
| POST | `/api/time-entries` | Create a new time entry |
| PUT | `/api/time-entries/:id` | Update an existing time entry |
| DELETE | `/api/time-entries/:id` | Delete a time entry |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |

## Data Model

### TimeEntry

```typescript
{
  userId: string;           // User ID who created the timesheet
  weekStart: Date;          // Start of the week (Monday)
  weekEnd: Date;            // End of the week (Sunday)
  hours: number[];          // Array of 7 numbers (one for each day)
  notes: string;            // Optional notes
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: Date;       // When timesheet was submitted
  approvedAt?: Date;        // When timesheet was approved
  approvedBy?: string;      // Who approved the timesheet
  createdAt: Date;          // When record was created
  updatedAt: Date;          // When record was last updated
}
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB 7.0+
- Docker (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd timesheet-service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7.0
   
   # Or install MongoDB locally
   ```

5. **Run the service**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

6. **Run tests**
   ```bash
   npm test
   ```

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Or build and run manually**
   ```bash
   docker build -t timesheet-service .
   docker run -p 3001:3001 timesheet-service
   ```

## API Usage Examples

### Create a Time Entry

```bash
curl -X POST http://localhost:3001/api/time-entries \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "weekStart": "2024-01-01T00:00:00.000Z",
    "weekEnd": "2024-01-07T23:59:59.999Z",
    "hours": [8, 8, 8, 8, 8, 0, 0],
    "notes": "Worked on project tasks",
    "status": "draft"
  }'
```

### Get Time Entries

```bash
# Get all entries
curl http://localhost:3001/api/time-entries

# Filter by user
curl "http://localhost:3001/api/time-entries?userId=user123"

# Filter by status
curl "http://localhost:3001/api/time-entries?status=submitted"
```

### Update a Time Entry

```bash
curl -X PUT http://localhost:3001/api/time-entries/ENTRY_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "submitted",
    "notes": "Updated notes"
  }'
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/timesheet-service` |
| `NODE_ENV` | Application environment | `development` |
| `PORT` | Server port | `3001` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000,http://localhost:3001` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## Development

### Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── models/          # Database models
├── routes/          # API routes
├── __tests__/       # Test files
├── app.ts          # Express app setup
└── index.ts        # Server entry point
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |

### Testing

The service includes comprehensive tests covering:

- API endpoint functionality
- Data validation
- Error handling
- Database operations
- Edge cases

Run tests with:
```bash
npm test
npm run test:watch  # Watch mode
```

## CI/CD Pipeline

The GitHub Actions pipeline includes:

1. **Testing**: Unit tests, integration tests
2. **Security**: Security audits, vulnerability scanning
3. **Build**: Docker image building
4. **Deploy**: Automated deployment to staging/production

### Pipeline Stages

- **Test**: Runs on all branches and PRs
- **Security**: Security scanning and audits
- **Build**: Docker image building (main branch only)
- **Deploy**: Automated deployment (main/develop branches)

## Monitoring and Health Checks

### Health Check Endpoint

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "success": true,
  "message": "Timesheet Service is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

### Docker Health Check

The Docker container includes a health check that verifies the service is responding:

```bash
docker ps
# Check the STATUS column for health status
```

## Security Features

- **Helmet**: Security headers
- **CORS**: Configurable cross-origin requests
- **Rate Limiting**: Request rate limiting
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses

## Performance Optimization

- **Database Indexes**: Optimized MongoDB indexes
- **Connection Pooling**: MongoDB connection pooling
- **Compression**: Response compression
- **Caching**: Ready for Redis integration

## Integration with TimeTrackr

To integrate this service with the main TimeTrackr application:

1. **Update API calls**: Point to the new service URL
2. **Environment variables**: Add service URL to TimeTrackr config
3. **Error handling**: Update error handling for service communication
4. **Authentication**: Implement service-to-service authentication

### Example Integration

```typescript
// In TimeTrackr frontend
const API_BASE_URL = process.env.TIMESHEET_SERVICE_URL || 'http://localhost:3001';

export async function saveDraft(userId: string, weekStart: string, weekEnd: string, hours: number[], notes: string) {
  const response = await fetch(`${API_BASE_URL}/api/time-entries`, {
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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
