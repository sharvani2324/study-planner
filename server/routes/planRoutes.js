import express from 'express';
import {
  getPlans,
  createPlan,
  getPlanById,
  updatePlan,
  updatePlanStatus,
  deletePlan,
  getProgressAndStats,
} from '../controllers/planController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protection to all study plan routes
router.use(protect);

router.get('/', getPlans);
router.post('/', createPlan);
router.get('/progress', getProgressAndStats);
router.get('/:id', getPlanById);
router.put('/:id', updatePlan);
router.put('/:id/status', updatePlanStatus);
router.delete('/:id', deletePlan);

export default router;
