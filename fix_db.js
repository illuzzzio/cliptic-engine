require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    console.log('Checking for users table...');
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `;
    
    if (result.length === 0) {
      console.log('Users table missing. Creating it...');
      await sql`
        CREATE TABLE IF NOT EXISTS "users" (
          "id" text PRIMARY KEY NOT NULL,
          "email" text NOT NULL UNIQUE,
          "first_name" text,
          "last_name" text,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        )
      `;
      console.log('Users table created successfully.');
    } else {
      console.log('Users table already exists.');
    }
  } catch (err) {
    console.error('Error handling users table:', err);
  }
}

main();
