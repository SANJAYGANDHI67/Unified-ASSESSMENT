import pool from "./config/db.js";

(async () => {
  try {
    const [rows] = await pool.execute("SHOW TABLES");
    console.log("✅ DB CONNECTED. TABLES:", rows);
    process.exit(0);
  } catch (err) {
    console.error("❌ DB ERROR:", err);
    process.exit(1);
  }
})();