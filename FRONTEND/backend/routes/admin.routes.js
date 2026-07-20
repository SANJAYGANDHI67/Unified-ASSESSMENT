import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import * as adminController from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/stats', authenticate, authorize('admin'), adminController.getStats);
router.get('/users', authenticate, authorize('admin'), adminController.getUsers);

router.get(
  "/logs",
  authenticate,
  authorize("admin"),
  adminController.getLogs
);

export default router;

