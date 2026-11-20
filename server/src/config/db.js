import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool,types  } = pg;

// Return PostgreSQL DATE (OID 1082) as a plain 'YYYY-MM-DD' string
types.setTypeParser(1082, (val) => val);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error:', err);
  process.exit(1);
});

export default pool;