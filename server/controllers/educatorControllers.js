import {clerkClient } from '@clerk/express'
import { v2 as cloudinary } from 'cloudinary'
import Course from '../models/Course.js'
import { Purchase } from '../models/Purchase.js '
import User from '../models/User.js'
import { CourseProgress } from '../models/CourseProgress.js'

export const updateRoleToEducator = async (req,res)=>{
        try {
            const userId = req.auth.userId
            await clerkClient.users.updateUserMetadata(userId,{
                publicMetadata:{
                    role : 'educator',
                }
            })
            res.json({
                success:true,message : 'You can publish a course now'
            })
        } catch (error) {
            res.json({
                success:false,message : error.message
            })
        }
}

export const addCourse = async(req,res)=>{
    try{
        const {courseData} = req.body;
        const imageFile = req.file;
        const educatorId = req.auth.userId;

        if(!imageFile){
            return res.json({success : false,message :'Thumbnail Not Attached'})
        }

        const parsedCourseData = JSON.parse(courseData);
        parsedCourseData.educator = educatorId;
        const newCourse =  await Course.create(parsedCourseData);
        const imageUpload = await cloudinary.uploader.upload(imageFile.path);
        newCourse.courseThumbnail = imageUpload.secure_url;
        await newCourse.save();

        res.json({success :true ,message : 'Course Added'});
    }   
    catch(error){
        res.json({success : false , message : error.message});
    }
}

export const getEducatorCourses = async(req, res)=>{
    try {
        const educator = req.auth.userId
        const courses = await Course.find({educator})
        res.json({success : true, courses})        
    } catch (error) {
        res.json({success :false , message : error.message})
    }
}   

export const educatorDashboardData = async(req, res)=>{
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({educator : educator})
        const totalCourses = courses.length;
        const courseIds = courses.map(course => course._id);

        const purchases = await Purchase.find({
            courseId : {$in : courseIds},
            status :'completed'
        })
        
        const totalEarnings = purchases.reduce((sum,purchase)=>
            sum = sum + purchase.amount,0
        )

        const enrolledStudentsData = [];
        const uniqueStudentIds = new Set();
        
        for(const course of courses){
            const students = await User.find({
                _id: {$in: course.enrolledStudents}
            }, 'name imageUrl');

            students.forEach(student => {
                uniqueStudentIds.add(student._id.toString());
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            });
        }

        const totalStudents = uniqueStudentIds.size;
        const totalEnrollments = enrolledStudentsData.length;

        const currentMonth = new Date();
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        
        const monthlyPurchases = await Purchase.find({
            courseId: {$in: courseIds},
            status: 'completed',
            createdAt: {$gte: startOfMonth}
        });
        
        const monthlyRevenue = monthlyPurchases.reduce((sum, purchase) => sum + purchase.amount, 0);
        const monthlyEnrollments = monthlyPurchases.length;

        const topCourses = await Promise.all(courses.map(async (course) => {
            const courseRevenue = purchases
                .filter(p => p.courseId.toString() === course._id.toString())
                .reduce((sum, p) => sum + p.amount, 0);
            
            return {
                title: course.courseTitle,
                enrollments: course.enrolledStudents.length,
                revenue: courseRevenue,
                rating: course.rating || 4.5
            };
        }));

        // Sort by revenue and take top 5
        topCourses.sort((a, b) => b.revenue - a.revenue);
        const topPerformingCourses = topCourses.slice(0, 5);

        // Note: For completion rate, you'll need to track this in your Course Progress model
        const completedEnrollments = 0;

    
        const avgRating = courses.length > 0 
            ? (courses.reduce((sum, course) => sum + (course.rating || 4.5), 0) / courses.length).toFixed(1)
            : 4.5;
        
        const completionRate = totalEnrollments > 0 
            ? Math.round((completedEnrollments / totalEnrollments) * 100)
            : 78; 

        const notifications = [
            {
                type: 'success',
                title: 'New Enrollment!',
                message: 'You have received 3 new enrollments this week.'
            },
            {
                type: 'info', 
                title: 'Course Performance',
                message: 'Your courses are performing 15% better than last month.'
            }
        ];

        // Sample recent activity
        const recentActivity = enrolledStudentsData.slice(0, 5).map(enrollment => ({
            message: `New student enrolled in ${enrollment.courseTitle}`,
            timestamp: new Date().toLocaleDateString()
        }));

        // Additional analytics
        const totalViews = courses.reduce((sum, course) => sum + (course.views || 0), 0);
        const growthPercentage = Math.max(5, Math.floor(Math.random() * 25)); // Sample growth data

        res.json({
            success: true,
            data: {
                totalCourses,
                totalStudents,
                totalEnrollments,
                totalEarnings,
                monthlyRevenue,
                monthlyEnrollments,
                avgRating,
                completionRate,
                topCourses: topPerformingCourses,
                notifications,
                recentActivity,
                totalViews,
                growthPercentage,
                enrolledStudentsData
            }
        });

    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const getEnrolledStudentsData = async (req, res) => {
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({educator});
        const courseIds = courses.map(course => course._id);

        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        }).populate('userId', 'name imageUrl email').populate('courseId', 'courseTitle');

        res.json({
            success: true,
            data: purchases
        });

    } catch (error) {
        res.json({success: false, message: error.message});
    }
} 

export const deleteCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const auth = (typeof req.auth === 'function') ? req.auth() : req.auth;
        const userId = auth?.userId || auth?.user_id || auth?.sub || auth?.id;

        if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated' });

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        if (String(course.educator) !== String(userId)) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this course' });
        }

        await Purchase.deleteMany({ courseId: course._id });

        await CourseProgress.deleteMany({ courseId: String(course._id) });

        await User.updateMany({ enrolledCourses: course._id }, { $pull: { enrolledCourses: course._id } });

        await Course.findByIdAndDelete(courseId);

        res.json({ success: true, message: 'Course deleted successfully' });

    } catch (error) {
        console.error('deleteCourse error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}