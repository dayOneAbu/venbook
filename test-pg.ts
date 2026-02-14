import "dotenv/config";
import pg from "pg";
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function test() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Success:", res.rows[0]);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
}
test();
