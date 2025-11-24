// Test database connection
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log('\n1. Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connected successfully');
    
    console.log('\n2. Running test query...');
    const result = await client.query('SELECT NOW(), version()');
    console.log('✅ Query successful');
    console.log('   Time:', result.rows[0].now);
    console.log('   Version:', result.rows[0].version.substring(0, 50) + '...');
    
    console.log('\n3. Checking links table...');
    const linksResult = await client.query('SELECT COUNT(*) as count FROM links');
    console.log('✅ Links table exists');
    console.log('   Total links:', linksResult.rows[0].count);
    
    console.log('\n4. Fetching sample links...');
    const sampleLinks = await client.query('SELECT code, url, clicks FROM links LIMIT 3');
    console.log('✅ Sample links:');
    sampleLinks.rows.forEach(link => {
      console.log(`   - ${link.code}: ${link.url.substring(0, 40)}... (${link.clicks} clicks)`);
    });
    
    client.release();
    await pool.end();
    
    console.log('\n✨ All tests passed!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testConnection();
