import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/* =========================
   LOGIN
========================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // ✅ FIXED QUERY — MATCHES YOUR DB
    const [users] = await db.execute(
      `SELECT 
         id,
         name,
         email,
         password_hash,
         role
       FROM users
       WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ JWT PAYLOAD — SIMPLE & CORRECT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    await db.execute(
  `
  INSERT INTO system_logs (event, user, type)
  VALUES (?, ?, ?)
  `,
  [
    "User Logged In",
    user.email,
    "Success",
  ]
);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,     // ✅ FIXED
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

/* =========================
   SIGNUP
========================= */
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email.toLowerCase()]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.execute(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [name, email.toLowerCase(), passwordHash, role.toLowerCase()]
    );

    res.status(201).json({
      message: "User created successfully",
      userId: result.insertId,
    });
  }


  catch (err) {
  console.error("========== SIGNUP ERROR ==========");
  console.error(err);
  console.error("Message:", err.message);
  console.error("Code:", err.code);
  console.error("SQL:", err.sql);
  console.error("Stack:", err.stack);

  res.status(500).json({
    message: err.message,
    code: err.code,
  });
}
};

