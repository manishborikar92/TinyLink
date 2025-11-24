import { Pool } from 'pg';

// Singleton pattern to prevent multiple pool instances in development
declare global {
  var pgPool: Pool | undefined;
}

let pool: Pool;

if (!global.pgPool) {
  global.pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    max: 10, // Reduced max connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  global.pgPool.on('connect', () => {
    console.log('✓ Connected to PostgreSQL database');
  });

  global.pgPool.on('error', (err) => {
    console.error('Database connection error:', err);
  });
}

pool = global.pgPool;

export default pool;
