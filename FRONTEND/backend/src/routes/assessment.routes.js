import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import * as assessmentController from '../controllers/assessment.controller.js';

const router = express.Router();

router.get('/published', authenticate, assessmentController.getPublishedAssessments);
router.get('/stats', authenticate, authorize('instructor'), assessmentController.getStats);
router.get('/my-assessments', authenticate, authorize('instructor'), assessmentController.getMyAssessments);
router.get('/:id', authenticate, assessmentController.getAssessment);
router.post('/', authenticate, authorize('instructor'), assessmentController.createAssessment);
router.put('/:id', authenticate, authorize('instructor'), assessmentController.updateAssessment);
router.delete('/:id', authenticate, authorize('instructor'), assessmentController.deleteAssessment);

router.get('/:assessmentId/questions', authenticate, assessmentController.getQuestions);
router.post('/:assessmentId/questions', authenticate, authorize('instructor'), assessmentController.createQuestion);
router.put('/questions/:questionId', authenticate, authorize('instructor'), assessmentController.updateQuestion);
router.delete('/questions/:questionId', authenticate, authorize('instructor'), assessmentController.deleteQuestion);

router.get('/:assessmentId/ai-questions', authenticate, authorize('instructor'), assessmentController.getAIQuestions);

export default router;

