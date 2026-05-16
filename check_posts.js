require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const failedPosts = await sql`
      SELECT id, status, error_message, scheduled_date 
      FROM scheduled_posts 
      WHERE status = 'failed'
      ORDER BY created_at DESC
      LIMIT 5
    `;
    console.log('Failed Posts:', failedPosts);
    
    const allPosts = await sql`
      SELECT id, status, scheduled_date 
      FROM scheduled_posts 
      ORDER BY created_at DESC
      LIMIT 10
    `;
    console.log('Recent Posts:', allPosts);
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
