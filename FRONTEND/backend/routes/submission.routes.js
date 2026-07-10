import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import * as submissionController from '../controllers/submission.controller.js';

const router = express.Router();

/* =====================================================
   STUDENT ROUTES
===================================================== */

// Get my submissions
router.get(
  '/my-submissions',
  authenticate,
  authorize('student'),
  submissionController.getMySubmissions
);

// Start / resume assessment
router.post(
  '/start/:assessmentId',
  authenticate,
  authorize('student'),
  submissionController.startAssessment
);

// Get answers of a submission
router.get(
  '/:submissionId/answers',
  authenticate,
  submissionController.getSubmissionAnswers
);

// Save answer (auto-save)
router.post(
  '/:submissionId/answers',
  authenticate,
  authorize('student'),
  submissionController.saveAnswer
);

// Final submit assessment
router.post(
  '/:submissionId/submit',
  authenticate,
  authorize('student'),
  submissionController.submitAssessment
);

/* =====================================================
   INSTRUCTOR ROUTES
===================================================== */

// Submissions of a specific assessment
router.get(
  '/assessment/:assessmentId',
  authenticate,
  authorize('instructor'),
  submissionController.getAssessmentSubmissions
);

// Evaluation page (submitted only)
router.get(
  '/evaluate/:assessmentId',
  authenticate,
  authorize('instructor'),
  submissionController.getSubmissionsForEvaluation
);


router.get(
  "/:submissionId/details",
  authenticate,
  authorize("instructor"),
  submissionController.getSubmissionDetails
);

export default router;