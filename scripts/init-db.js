// Database initialization script
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Connecting to database...');
    
    // Create links table
    await client.query(`
      CREATE TABLE IF NOT EXISTS links (
        id SERIAL PRIMARY KEY,
        code VARCHAR(8) UNIQUE NOT NULL,
        url TEXT NOT NULL,
        clicks INTEGER DEFAULT 0,
        last_clicked TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Table "links" created or already exists');
    
    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_code ON links(code);
    `);
    console.log('✅ Index "idx_code" created or already exists');
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_created_at ON links(created_at DESC);
    `);
    console.log('✅ Index "idx_created_at" created or already exists');
    
    // Add comments
    await client.query(`
      COMMENT ON TABLE links IS 'Stores shortened URL links and their statistics';
    `);
    await client.query(`
      COMMENT ON COLUMN links.code IS 'Unique 6-8 character alphanumeric code for the short URL';
    `);
    await client.query(`
      COMMENT ON COLUMN links.url IS 'Original long URL to redirect to';
    `);
    await client.query(`
      COMMENT ON COLUMN links.clicks IS 'Total number of times this link has been clicked';
    `);
    await client.query(`
      COMMENT ON COLUMN links.last_clicked IS 'Timestamp of the most recent click';
    `);
    await client.query(`
      COMMENT ON COLUMN links.created_at IS 'Timestamp when the link was created';
    `);
    console.log('✅ Table comments added');
    
    // Check if table has data
    const result = await client.query('SELECT COUNT(*) FROM links');
    console.log(`📊 Current links in database: ${result.rows[0].count}`);
    
    console.log('\n✨ Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase();
