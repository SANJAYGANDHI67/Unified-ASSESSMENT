import db from "./config/db.js";

try {
  const [rows] = await db.execute("SELECT 1 AS test");
  console.log("✅ Database connection works!");
  console.log(rows);
} catch (err) {
  console.error("❌ Database connection failed:");
  console.error(err);
}