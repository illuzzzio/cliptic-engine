require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const userId = 'user_3DBBQgNQk4RzDHHyTjwzEA6uaHD';
    const posts = await sql`
      SELECT sp.id, sp.status, gs.title, sp.scheduled_date
      FROM scheduled_posts sp
      LEFT JOIN generated_shorts gs ON sp.short_id = gs.id
      WHERE sp.user_id = ${userId}
    `;
    console.log('All Scheduled Posts for User:', posts);
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
