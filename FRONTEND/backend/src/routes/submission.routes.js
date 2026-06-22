import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import * as submissionController from '../controllers/submission.controller.js';

const router = express.Router();

router.get('/my-submissions', authenticate, authorize('student'), submissionController.getMySubmissions);
router.get('/:id', authenticate, submissionController.getSubmission);
router.post('/start/:assessmentId', authenticate, authorize('student'), submissionController.startAssessment);
router.get('/:submissionId/answers', authenticate, submissionController.getSubmissionAnswers);
router.post('/:submissionId/answers', authenticate, authorize('student'), submissionController.saveAnswer);
router.post('/:submissionId/submit', authenticate, authorize('student'), submissionController.submitAssessment);
router.get('/assessment/:assessmentId', authenticate, authorize('instructor'), submissionController.getAssessmentSubmissions);

export default router;

