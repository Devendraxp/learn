import express from 'express'
import { addUserRating, getUserData,purchaseCourse,updateUserCourseProgress,userEnrolledCourses, getUserCourseProgress, adminCompletePurchase } from '../controllers/userController.js'
import { submitApplication, listUserApplications, getUserApplication } from '../controllers/applicationController.js'
import { changeUserRole } from '../controllers/adminController.js';
import { protectAdmin } from '../middlewares/authMiddleware.js';
const userRouter = express.Router()



userRouter.post('/applications', submitApplication)
userRouter.get('/applications', listUserApplications)
userRouter.get('/applications/:id', getUserApplication)

userRouter.get('/data',getUserData)
userRouter.get('/enrolled-courses',userEnrolledCourses)
userRouter.get('/myenrollments',userEnrolledCourses);
userRouter.post('/purchase',purchaseCourse);
userRouter.post('/update-course-progress',updateUserCourseProgress);
userRouter.post('/get-course-progress',getUserCourseProgress);
userRouter.post('/add-rating',addUserRating);
userRouter.post('/admin/complete-purchase',adminCompletePurchase);

export default userRouter;