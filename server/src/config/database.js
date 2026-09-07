const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL error:", error);
});

const query = (text, params) => {
  return pool.query(text, params);
};

const testDatabaseConnection = async () => {
  const client = await pool.connect();

  try {
    await client.query("SELECT 1");

    console.log("PostgreSQL connected successfully");
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query,
  testDatabaseConnection,
};