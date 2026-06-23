import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// ================= VERIFY ENV =================
console.log("🚨 BACKEND CONNECTED TO DB:", process.env.DB_NAME);


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

app.use(cors({
  origin: [
    "https://YOUR-FRONTEND-VERCEL-URL.vercel.app",
    "http://localhost:5173"
  ],
  credentials: true
}));

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));


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


// AI GENERATION
app.use("/api/ai", aiRoutes);


// EVALUATION
app.use("/api/evaluations", evaluationRoutes);


// ================= HEALTH CHECK =================

app.get("/", (req, res) => {
  res.send("Unified Assessment Backend is running ✅");
});


// ================= VERCEL EXPORT =================

export default app;
