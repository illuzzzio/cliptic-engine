require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Tables in database:', result.map(r => r.table_name));
    
    for (const table of result) {
      const columns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = ${table.table_name}
      `;
      console.log(`Columns in ${table.table_name}:`, columns.map(c => `${c.column_name} (${c.data_type})`));
    }
  } catch (err) {
    console.error('Error fetching tables:', err);
  }
}

main();
