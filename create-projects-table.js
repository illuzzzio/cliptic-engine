const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_i5VxyC0rMNvc@ep-jolly-recipe-anes5jdu.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require');
async function run() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'uploading',
        progress TEXT NOT NULL DEFAULT '0',
        video_key TEXT,
        video_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log('Projects table created successfully!');
  } catch (err) {
    console.error('Failed to create table:', err);
  }
}
run();
