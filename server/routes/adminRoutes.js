import express from 'express'
import { changeUserRole, listEducators, listStudents, getAdminStats } from '../controllers/adminController.js';
import { protectAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router()

// Admin: change user role
router.put('/users/:userId/role', protectAdmin, changeUserRole);

// Admin: educator application review endpoints
import { adminListApplications, adminGetApplication, adminApproveApplication, adminRejectApplication } from '../controllers/applicationController.js'

router.get('/applications', protectAdmin, adminListApplications)
router.get('/applications/:id', protectAdmin, adminGetApplication)
router.put('/applications/:id/approve', protectAdmin, adminApproveApplication)
router.put('/applications/:id/reject', protectAdmin, adminRejectApplication)

// Admin lists
router.get('/educators', protectAdmin, listEducators);
router.get('/students', protectAdmin, listStudents);
router.get('/stats', protectAdmin, getAdminStats);

export default router;
