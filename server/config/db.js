import mongoose from 'mongoose';
import dns from 'dns';

// Ensure public DNS resolver fallback for MongoDB SRV lookups.
// On Windows, the system or local ISP resolver can return ECONNREFUSED for
// _mongodb._tcp DNS SRV queries. Setting public resolvers (Google / Cloudflare)
// allows Node's c-ares to resolve MongoDB Atlas cluster hosts reliably.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // If setServers cannot be changed in this runtime environment, continue gracefully
}

/**
 * Masks username and password from a MongoDB connection string to prevent leaking secrets.
 */
export const maskMongoUri = (rawUri) => {
  if (!rawUri) return '<not set>';
  try {
    return rawUri.replace(/\/\/[^@]+@/, '//***:***@');
  } catch {
    return '***';
  }
};

/**
 * Connects to MongoDB (Atlas or local instance) using Mongoose.
 */
export const connectDB = async () => {
  const rawUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/study_planner';

  // Extract database name from path if provided, or default to 'study_planner'
  const options = {
    serverSelectionTimeoutMS: 10000,
  };

  const beforeQuery = rawUri.split('?')[0];
  const slashParts = beforeQuery.split('/');
  const dbInPath = slashParts.length > 3 ? slashParts.slice(3).join('/') : '';
  if (!dbInPath || dbInPath.trim() === '') {
    options.dbName = 'study_planner';
  }

  try {
    const conn = await mongoose.connect(rawUri, options);
    const host = conn.connection.host || 'unknown-host';
    const dbName = conn.connection.name || options.dbName || 'study_planner';
    console.log(`✅ MongoDB connected successfully to host: ${host} (Database: ${dbName})`);
    return conn;
  } catch (error) {
    const masked = maskMongoUri(rawUri);
    console.error(`❌ MongoDB Connection Error (${masked}): ${error.message}`);

    // Provide non-sensitive, actionable guidance
    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.error('👉 Hint: Authentication failed. Please verify your Atlas database username and password in server/.env.');
    } else if (error.message.includes('querySrv') || error.message.includes('ECONNREFUSED')) {
      console.error('👉 Hint: DNS SRV resolution failed. Check your network connection or verify the Atlas cluster domain.');
    } else if (error.message.includes('timed out') || error.name === 'MongooseServerSelectionError') {
      console.error('👉 Hint: Connection timed out. Make sure your current IP address is added to the MongoDB Atlas Network Access whitelist (or 0.0.0.0/0 for development).');
    }

    throw error;
  }
};

export default connectDB;
