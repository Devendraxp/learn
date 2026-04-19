import asyncHandler from 'express-async-handler';
import { clerkClient } from '@clerk/clerk-sdk-node';
import User from '../models/User.js';
import Course from '../models/Course.js';


export const changeUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!['student', 'educator', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }

  try {
    const clerkUser = await clerkClient.users.getUser(userId);
    const existingMeta = clerkUser?.publicMetadata || clerkUser?.public_metadata || {};
    await clerkClient.users.updateUser(userId, {
      publicMetadata: { ...existingMeta, role }
    });
  } catch (err) {
    console.warn('Clerk update failed (continuing to update local DB):', err?.message || err);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return res.json({ success: true, user });
});


export const listEducators = asyncHandler(async (req, res) => {
  const educators = await User.find({ role: 'educator' }).select('_id name email createdAt enrolledCourses');
  return res.json({ success: true, educators });
});


export const listStudents = asyncHandler(async (req, res) => {
  const students = await User.find({ role: 'student' }).select('_id name email createdAt enrolledCourses');
  return res.json({ success: true, students });
});


export const getAdminStats = asyncHandler(async (req, res) => {
  const totalEducators = await User.countDocuments({ role: 'educator' });
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalCourses = await Course.countDocuments({ isPublished: true });
  const pendingApplications = await import('../models/EducatorApplication.js').then(m => m.default.countDocuments({ status: 'pending' }));

  return res.json({ success: true, stats: { totalEducators, totalStudents, totalCourses, pendingApplications } });
});