require("dotenv").config();

const bcrypt = require("bcrypt");
const { query, pool } = require("./config/database");

const createAdmin = async () => {
  const name = "Camp Admin";
  const email = "purvanshu1375@gmail.com";
  const password = "Admin@1375"; // Change this to a secure password

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      `
      INSERT INTO admins (
        name,
        email,
        password_hash,
        role
      )
      VALUES ($1, $2, $3, 'admin')
      ON CONFLICT (email)
      DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        name = EXCLUDED.name,
        is_active = TRUE,
        updated_at = NOW()
      RETURNING id, name, email, role
      `,
      [
        name,
        email,
        passwordHash,
      ]
    );

    console.log("Admin created:");
    console.log(result.rows[0]);

  } catch (error) {
    console.error("Failed to create admin:");
    console.error(error.message);
  } finally {
    await pool.end();
  }
};

createAdmin();