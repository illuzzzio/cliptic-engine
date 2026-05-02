const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_i5VxyC0rMNvc@ep-jolly-recipe-anes5jdu.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require');
async function run() {
  try {
    await sql`ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_user_id_users_id_fk`;
    console.log('Constraint removed successfully.');
  } catch (err) {
    console.error('Failed to remove constraint:', err);
  }
}
run();
