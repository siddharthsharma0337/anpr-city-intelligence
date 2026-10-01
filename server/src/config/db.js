import mongoose from 'mongoose';

let isConnected = false;
let retryTimer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/anpr_city_intelligence';
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,  // 30s — needed for cold-start cloud connections
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    isConnected = false;
    console.warn(`[Database] MongoDB not reachable: ${error.message}`);
    console.warn(`[Database] Retrying in 10 seconds...`);
    // Keep retrying every 10 seconds until Atlas becomes reachable
    retryTimer = setTimeout(() => connectDB(), 10000);
  }
};

// Handle unexpected disconnects — auto-reconnect
mongoose.connection.on('disconnected', () => {
  if (isConnected) {
    isConnected = false;
    console.warn('[Database] MongoDB disconnected. Reconnecting...');
    retryTimer = setTimeout(() => connectDB(), 5000);
  }
});

export const getDBStatus = () => ({
  connected: isConnected,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host || 'local-fallback',
  name: mongoose.connection.name || 'anpr_city_intelligence'
});
