import asyncHandler from 'express-async-handler';
import { clerkClient } from '@clerk/clerk-sdk-node';
import User from '../models/User.js';

const getAuthUserId = (req) => {
  const auth = (typeof req.auth === 'function') ? req.auth() : req.auth;
  return auth?.userId || auth?.user_id || auth?.sub || auth?.id;
};

const requireRole = async (req, role) => {
  const userId = getAuthUserId(req);
  if (!userId) {
    const err = new Error('Not authenticated');
    err.status = 401;
    throw err;
  }

  try {
    const clerkUser = await clerkClient.users.getUser(userId);
    const clerkRole = clerkUser?.publicMetadata?.role || clerkUser?.public_metadata?.role;
    if (clerkRole === role) {
      return {
        id: userId,
        name: clerkUser?.firstName || clerkUser?.fullName || clerkUser?.username || '',
        email:
          clerkUser?.email?.[0] ||
          clerkUser?.primaryEmailAddress?.emailAddress ||
          ''
      };
    }
  } catch (e) {
  }

 
  const localUser = await User.findById(userId);
  if (localUser && localUser.role === role) return localUser;

  const err = new Error(`${role[0].toUpperCase() + role.slice(1)} role required`);
  err.status = 403;
  throw err;
};

export const protectEducator = asyncHandler(async (req, res, next) => {
  req.user = await requireRole(req, 'educator');
  next();
});

export const protectAdmin = asyncHandler(async (req, res, next) => {
  req.user = await requireRole(req, 'admin');
  next();
});