import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  try {
    await sql`ALTER TABLE generated_shorts ADD COLUMN export_url text;`;
    console.log('Added export_url');
  } catch (e: any) { console.log(e.message) }
  try {
    await sql`ALTER TABLE generated_shorts ADD COLUMN render_id text;`;
    console.log('Added render_id');
  } catch (e: any) { console.log(e.message) }
  try {
    await sql`ALTER TABLE generated_shorts ADD COLUMN render_status text DEFAULT 'idle';`;
    console.log('Added render_status');
  } catch (e: any) { console.log(e.message) }
  try {
    await sql`ALTER TABLE generated_shorts ADD COLUMN render_progress double precision DEFAULT 0;`;
    console.log('Added render_progress');
  } catch (e: any) { console.log(e.message) }
}
main();
