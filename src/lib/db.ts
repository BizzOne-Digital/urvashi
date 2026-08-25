import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  uri: string | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null, uri: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

function getMongoUri(): string {
  return process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dpm_custom_prints";
}

export async function connectDB(): Promise<typeof mongoose> {
  const uri = getMongoUri();

  if (cached.conn && cached.uri && cached.uri !== uri) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    cached.uri = null;
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.uri = uri;
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
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

export async function isDBConnected(): Promise<boolean> {
  try {
    await connectDB();
    return mongoose.connection.readyState === 1;
  } catch {
    return false;
  }
}
