import express from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import * as aiController from "../controllers/ai.controller.js";

const router = express.Router();

/* =====================================================
   PHASE 1 — GENERATE AI QUESTIONS
   POST /api/ai/generate/:assessmentId
===================================================== */
router.post(
  "/generate/:assessmentId",
  authenticate,
  authorize("instructor"),
  aiController.generateQuestions
);

/* =====================================================
   PHASE 2 — FETCH AI QUESTIONS
   GET /api/ai/questions/:assessmentId
===================================================== */
router.get(
  "/questions/:assessmentId",
  authenticate,
  authorize("instructor"),
  aiController.getAIQuestions
);

/* =====================================================
   PHASE 3 — APPROVE AI QUESTION
   POST /api/ai/approve/:id
===================================================== */
router.post(
  "/approve/:id",
  authenticate,
  authorize("instructor"),
  aiController.approveAIQuestion
);

/* =====================================================
   PHASE 3 — REJECT AI QUESTION ✅ REQUIRED
   POST /api/ai/reject/:id
===================================================== */
router.post(
  "/reject/:id",
  authenticate,
  authorize("instructor"),
  aiController.rejectAIQuestion
);

export default router;