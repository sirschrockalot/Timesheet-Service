import mongoose from 'mongoose';

// Global test setup
beforeAll(async () => {
  // Connect to test database
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/timesheet-service-test';
  await mongoose.connect(MONGODB_URI);
});

// Global test teardown
afterAll(async () => {
  // Close database connection
  await mongoose.connection.close();
});

// Clean up after each test
afterEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
