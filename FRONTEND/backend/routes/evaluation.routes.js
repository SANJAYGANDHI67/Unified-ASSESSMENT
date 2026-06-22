import express from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import * as evaluationController from "../controllers/evaluation.controller.js";

const router = express.Router();

/*
  Instructor submits final evaluation
*/
router.post(
  "/:submissionId/submit",
  authenticate,
  authorize("instructor"),
  evaluationController.submitEvaluation
);

/*
  Get evaluation by submission
*/
router.get(
  "/:submissionId",
  authenticate,
  evaluationController.getEvaluation
);

export default router;