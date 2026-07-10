import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// ================= VERIFY ENV =================

console.log(
  "🚨 BACKEND CONNECTED TO DB:",
  process.env.DB_NAME
);

// ================= ROUTE IMPORTS =================

// AUTH
import authRoutes from "./routes/auth.routes.js";

// CORE MODULES
import assessmentRoutes from "./routes/assessment.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import adminRoutes from "./routes/admin.routes.js";

// DASHBOARD
import dashboardRoutes from "./routes/dashboard.routes.js";

// AI GENERATION
import aiRoutes from "./routes/ai.routes.js";

// EVALUATION
import evaluationRoutes from "./routes/evaluation.routes.js";

// ================= APP =================

const app = express();

// ================= MIDDLEWARE =================

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ================= API ROUTES =================

// AUTH
app.use("/api/auth", authRoutes);

// ASSESSMENTS
app.use("/api/assessments", assessmentRoutes);

// SUBMISSIONS
app.use("/api/submissions", submissionRoutes);

// ADMIN
app.use("/api/admin", adminRoutes);

// DASHBOARD
app.use("/api/dashboard", dashboardRoutes);

// AI
app.use("/api/ai", aiRoutes);

// EVALUATION
app.use("/api/evaluations", evaluationRoutes);

// ================= HEALTH CHECK =================

app.get("/", (req, res) => {
  res.send("Unified Assessment Backend is running ✅");
});

// ================= LOCAL SERVER =================

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// ================= VERCEL EXPORT =================

export default app;