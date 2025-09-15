import mongoose from 'mongoose';

// Get MongoDB URI when function is called, not at module load time
function getMongoUri() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/timesheet-service';

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }
  
  return MONGODB_URI;
}

let cached: any = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Only log once per process
if (!global.mongoConnectedLogged) {
  global.mongoConnectedLogged = false;
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const MONGODB_URI = getMongoUri();
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      if (!global.mongoConnectedLogged) {
        console.log('✅ Connected to MongoDB:', MONGODB_URI);
        global.mongoConnectedLogged = true;
      }
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
