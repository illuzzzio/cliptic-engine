const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_i5VxyC0rMNvc@ep-jolly-recipe-anes5jdu.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require');
async function run() {
  try {
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS transcript TEXT`;
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS captions JSONB`;
    console.log('Columns added successfully!');
  } catch (err) {
    console.error('Failed to add columns:', err);
  }
}
run();
