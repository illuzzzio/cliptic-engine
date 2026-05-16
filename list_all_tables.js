require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const tables = await sql`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
    `;
    console.log('All tables:', tables);
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
