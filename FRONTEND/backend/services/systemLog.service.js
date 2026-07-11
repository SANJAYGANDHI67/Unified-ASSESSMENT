import pool from "../config/db.js";

export const addSystemLog = async (
  event,
  user = "System",
  type = "Info"
) => {
  try {
    console.log("ADDING LOG:", event, user, type);

    await pool.execute(
      `
      INSERT INTO system_logs (event, user, type)
      VALUES (?, ?, ?)
      `,
      [event, user, type]
    );

    console.log("✅ LOG INSERTED");
  } catch (error) {
    console.error("SYSTEM LOG ERROR:", error);
  }
};