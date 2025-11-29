import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import 'dotenv/config'; // Make sure you have the 'dotenv' package installed

// 1. Get the Database Connection URL
const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) {
    throw new Error('DATABASE_URL environment variable is not set.');
}

// 2. Create a connection pool for the database
const pool = new Pool({
    connectionString: DB_URL,
});

// 3. Initialize the Drizzle ORM instance
const db = drizzle(pool);

// 4. Define the migration function
async function runMigrations() {
    console.log('--- Starting database migrations ---');

    try {
        // The core migration command
        await migrate(db, { migrationsFolder: './migrations/' }); 

        console.log('--- Migrations finished successfully! ---');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1); // Exit with an error code
    } finally {
        // 5. Close the database connection
        await pool.end();
    }
}

// Execute the function
runMigrations();