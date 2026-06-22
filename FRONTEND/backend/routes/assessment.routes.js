import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

import { authenticate, authorize } from "../middleware/auth.middleware.js";
import * as assessmentController from "../controllers/assessment.controller.js";

const router = express.Router();

/* =====================================================
   FILE UPLOAD SETUP (SYLLABUS)
===================================================== */

const uploadDir = path.join(process.cwd(), "uploads", "syllabus");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const { assessmentId } = req.params;
    cb(null, `assessment_${assessmentId}.pdf`);
  },
});

const upload = multer({ storage });

/* =====================================================
   PUBLIC / STUDENT
===================================================== */

router.get(
  "/published",
  authenticate,
  assessmentController.getPublishedAssessments
);

/* =====================================================
   INSTRUCTOR – DASHBOARD
===================================================== */

router.get(
  "/stats",
  authenticate,
  authorize("instructor"),
  assessmentController.getStats
);

router.get(
  "/instructor/manage",
  authenticate,
  authorize("instructor"),
  assessmentController.getMyAssessments
);

/* =====================================================
   ASSESSMENT CRUD
===================================================== */

router.get("/:id", authenticate, assessmentController.getAssessment);

router.post(
  "/",
  authenticate,
  authorize("instructor"),
  assessmentController.createAssessment
);

router.put(
  "/:id",
  authenticate,
  authorize("instructor"),
  assessmentController.updateAssessment
);

router.delete(
  "/:id",
  authenticate,
  authorize("instructor"),
  assessmentController.deleteAssessment
);

/* =====================================================
   SYLLABUS UPLOAD
===================================================== */

router.post(
  "/:assessmentId/upload-syllabus",
  authenticate,
  authorize("instructor"),
  upload.single("syllabus"),
  assessmentController.uploadSyllabus
);

/* =====================================================
   QUESTIONS (MANUAL)
===================================================== */

router.get(
  "/:assessmentId/questions",
  authenticate,
  assessmentController.getQuestions
);

router.post(
  "/:assessmentId/questions",
  authenticate,
  authorize("instructor"),
  assessmentController.createQuestion
);

router.put(
  "/questions/:questionId",
  authenticate,
  authorize("instructor"),
  assessmentController.updateQuestion
);

router.delete(
  "/questions/:questionId",
  authenticate,
  authorize("instructor"),
  assessmentController.deleteQuestion
);

/* =====================================================
   AI QUESTIONS (VIEW)
===================================================== */

router.get(
  "/ai/questions/:assessmentId", // ✅ FIXED PATH
  authenticate,
  authorize("instructor"),
  assessmentController.getAIQuestions
);

export default router;