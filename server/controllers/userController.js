import User from "../models/User.js"
import { clerkClient } from '@clerk/clerk-sdk-node';

import Stripe from "stripe";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";
import { CourseProgress } from "../models/CourseProgress.js";

const getAuthUserId = (req) => {
    const auth = (typeof req.auth === 'function') ? req.auth() : req.auth;
    return auth?.userId || auth?.user_id || auth?.sub || auth?.id;
}

export const getUserData = async (req, res) => {
    try {
        const userId = getAuthUserId(req);
        const user = await User.findById(userId)

        if (!user) {

            try {
                const clerkUser = await clerkClient.users.getUser(userId);
                const name = clerkUser?.firstName || clerkUser?.fullName || '';
                const email = clerkUser?.emailAddresses?.[0]?.emailAddress || clerkUser?.email || '';
                const imageUrl = clerkUser?.imageUrl;
                const role = clerkUser?.publicMetadata?.role || 'student';

                const newUser = await User.findByIdAndUpdate(userId, { _id: userId, name, email, imageUrl, role }, { upsert: true, new: true, setDefaultsOnInsert: true });
                return res.json({ success: true, user: newUser });
            } catch (clerkErr) {
                console.warn('User not found locally and Clerk lookup failed:', clerkErr?.message || clerkErr);
                return res.json({ success: false, message: "User Not Found" });
            }
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error('Error in getUserData:', error);
        res.json({ success: false, message: error.message });
    }
}

export const userEnrolledCourses = async (req, res) => {
    try {
        const userId = getAuthUserId(req);

        const userData = await User.findById(userId).populate({
            path: 'enrolledCourses',
            populate: {
                path: 'educator',
                select: 'name email'
            }
        })

        if (!userData) {

            try {
                const clerkUser = await clerkClient.users.getUser(userId);
                const name = clerkUser?.firstName || clerkUser?.fullName || '';
                const email = clerkUser?.emailAddresses?.[0]?.emailAddress || clerkUser?.email || '';
                const imageUrl = clerkUser?.imageUrl || '';
                const role = clerkUser?.publicMetadata?.role || 'student';
                await User.findByIdAndUpdate(userId, { _id: userId, name, email, imageUrl, role }, { upsert: true, setDefaultsOnInsert: true });
                return res.json({ success: true, enrolledCourses: [], count: 0 });

            } catch (clerkErr) {
                console.warn('Clerk lookup failed when creating local user:', clerkErr?.message || clerkErr);
                return res.json({ success: false, message: "User Not Found" });
            }
        }
        res.json({
            success: true,
            enrolledCourses: userData.enrolledCourses || [],
            count: userData.enrolledCourses?.length || 0
        })

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const purchaseCourse = async (req, res) => {
    try {
        const userId = getAuthUserId(req);
        const { courseId } = req.body;

        console.log(' Purchase request:', { userId, courseId });

        const userData = await User.findById(userId);
        const courseData = await Course.findById(courseId);

        if (!userData || !courseData) {
            return res.json({ success: false, message: 'Data Not Found' });
        }

        if (userData.enrolledCourses.includes(courseId)) {
            return res.json({ success: false, message: 'Already Enrolled in this Course' });
        }

        const price = Number(courseData.coursePrice) || 0;
        const discount = Number(courseData.discount) || 0;


        if (price <= 0) {
            return res.json({ success: false, message: 'Invalid course price' });
        }

        const finalAmount = (price - (discount * price / 100));
        const roundedAmount = Number(finalAmount.toFixed(2));


        if (isNaN(roundedAmount) || roundedAmount <= 0) {
            return res.json({ success: false, message: 'Invalid amount calculated' });
        }

        const newPurchase = await Purchase.create({
            courseId: courseData._id,
            userId,
            amount: roundedAmount
        });

        console.log('📝 Purchase record created:', newPurchase._id);


        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        const isTestMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
        if (!isTestMode) {
            console.error('⚠️ WARNING: Using live Stripe keys!');
        }


        const clientBase = req.headers?.origin || process.env.CLIENT_URL || '';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: (process.env.CURRENCY || 'USD').toLowerCase(),
                    product_data: {
                        name: courseData.courseTitle,
                        description: `${courseData.courseTitle} - Test Mode Payment`
                    },
                    unit_amount: Math.floor(roundedAmount * 100)
                },
                quantity: 1
            }],
            mode: 'payment',
            success_url: `${clientBase}/loading/myenrollments?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${clientBase}/course/${courseId}?cancelled=true`,
            metadata: {
                courseId,
                userId,
                purchaseId: newPurchase._id.toString(),
                testMode: 'true'
            }
        });

        console.log('💳 Stripe session created:');
        console.log('  - Session ID:', session.id);
        console.log('  - Mode:', session.mode);
        console.log('  - URL:', session.url);
        console.log('  - Success URL:', `${process.env.CLIENT_URL}/loading/myenrollments?session_id={CHECKOUT_SESSION_ID}`);
        console.log('  - Cancel URL:', `${process.env.CLIENT_URL}/course/${courseId}?cancelled=true`);
        console.log('  - CLIENT_URL from env:', process.env.CLIENT_URL);
        console.log('  - Test Mode:', isTestMode ? 'YES' : 'NO');

        res.json({
            success: true,
            sessionUrl: session.url,
            sessionId: session.id,
            testMode: isTestMode,
            amount: roundedAmount
        });

    } catch (error) {
        console.error('Error in purchasing course:', error);
        res.json({ success: false, message: error.message });
    }
}


export const updateUserCourseProgress = async (req, res) => {
    try {
        const userId = getAuthUserId(req);
        const { courseId, lectureId } = req.body

        let progressData = await CourseProgress.findOne({ userId, courseId })

        if (progressData) {
            if (progressData.lectureCompleted.includes(lectureId)) {
                return res.json({ success: true, message: 'Lecture Already Completed', progressData })
            }

            progressData.lectureCompleted.push(lectureId)
            await progressData.save()
        } else {
            progressData = await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted: [lectureId]
            })
        }

        res.json({ success: true, message: 'Progress Updated Successfully', progressData })

    } catch (error) {
        console.error('Error updating course progress:', error)
        res.json({ success: false, message: error.message })
    }
}

export const getUserCourseProgress = async (req, res) => {
    try {
        const userId = getAuthUserId(req);
        const { courseId } = req.body

        const progressData = await CourseProgress.findOne({ userId, courseId })
        res.json({ success: true, progressData })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


export const addUserRating = async (req, res) => {
    const userId = getAuthUserId(req);
    const { courseId, rating } = req.body;

    if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
        return res.json({ success: false, message: 'Invalid Details' });
    }

    try {
        const course = await Course.findById(courseId);

        if (!course) {
            return res.json({ success: false, message: 'Course Not Found' });
        }

        const user = await User.findById(userId)
        if (!user || !user.enrolledCourses.includes(courseId)) {
            return res.json({ success: false, message: 'User does not purchased this course' });
        }

        const existingRating = course.courseRatings.find(r => r.userId.toString() === userId);

        if (existingRating) {
            existingRating.rating = rating;
        } else {
            course.courseRatings.push({
                userId,
                rating
            });
        }

        await course.save();

        res.json({ success: true, message: 'Rating Added Successfully' });

    } catch (error) {
        console.error('Error adding rating:', error);
        res.json({ success: false, message: error.message });
    }
}

// Admin endpoint to complete pending purchase and enroll user
export const adminCompletePurchase = async (req, res) => {
    try {
        const { userId, courseId } = req.body;

        if (!userId || !courseId) {
            return res.json({ success: false, message: 'userId and courseId are required' });
        }

        const user = await User.findById(userId);
        const course = await Course.findById(courseId);

        if (!user || !course) {
            return res.json({ success: false, message: 'User or course not found' });
        }

        if (user.enrolledCourses.includes(courseId)) {
            return res.json({ success: false, message: 'User already enrolled in this course' });
        }

        user.enrolledCourses.push(courseId);
        await user.save();

        // Add user to course's enrolled students
        if (!course.enrolledStudents.includes(userId)) {
            course.enrolledStudents.push(userId);
            await course.save();
        }

        // Update purchase status to completed
        await Purchase.findOneAndUpdate(
            { userId, courseId, status: 'pending' },
            { status: 'completed' }
        );

        res.json({
            success: true,
            message: `User enrolled in ${course.courseTitle}`,
            user: user.name,
            course: course.courseTitle
        });

    } catch (error) {
        console.error('Error completing purchase:', error);
        res.json({ success: false, message: error.message });
    }
}

