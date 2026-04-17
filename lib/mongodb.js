import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

export function isMongoConfigured() {
  return Boolean(MONGODB_URI);
}

const globalCache = globalThis;

if (!globalCache.__maisonMongo) {
  globalCache.__maisonMongo = {
    conn: null,
    promise: null,
  };
}

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (globalCache.__maisonMongo.conn) {
    return globalCache.__maisonMongo.conn;
  }

  if (!globalCache.__maisonMongo.promise) {
    globalCache.__maisonMongo.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  globalCache.__maisonMongo.conn = await globalCache.__maisonMongo.promise;
  return globalCache.__maisonMongo.conn;
}
