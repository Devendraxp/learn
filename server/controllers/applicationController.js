import asyncHandler from 'express-async-handler'
import EducatorApplication from '../models/EducatorApplication.js'
import User from '../models/User.js'
import { clerkClient } from '@clerk/clerk-sdk-node'

const getAuthUserId = (req) => {
  const auth =  req.auth() || req.auth;
  return auth?.userId || auth?.user_id || auth?.sub || auth?.id
}

const requireAuth = (req) => {
  const userId = getAuthUserId(req)
  if (!userId) {
    const err = new Error('Not authenticated')
    err.status = 401
    throw err
  }
  return userId
}

const snapshotUser = async (userId) => {
  let name = '', email = '', imageUrl = ''
  try {
    const clerkUser = await clerkClient.users.getUser(userId)
    name = clerkUser?.firstName || clerkUser?.fullName || ''
    email = clerkUser?.email || ''
    imageUrl = clerkUser?.imageUrl || ''

  } catch {
    const local = await User.findById(userId)
    if (local) {
      name = local.name || ''
      email = local.email || ''
      imageUrl = local.imageUrl || ''
    }
  }
  return { name, email, imageUrl }
}

const setApplicationStatus = async (app, status, notes, reviewerId) => {
  app.status = status
  app.adminNotes = notes || ''
  app.reviewedBy = reviewerId || ''
  app.reviewedAt = new Date()
  await app.save()
  return app
}


// Submit application
export const submitApplication = asyncHandler(async (req, res) => {
  const userId = requireAuth(req)

  const {
    bio,
    yearsExperience,
    currentRole,
    portfolio,
    cvUrl,
    sampleLectureUrl,
    certifications,
    supportingMessage
  } = req.body

  if (!bio || (!portfolio && !cvUrl && !sampleLectureUrl)) {
    return res.status(400).json({ success: false, message: 'Please provide a bio and at least one of portfolio/cv/sample lecture' })
  }

  // prevent duplicate pending
  const existingPending = await EducatorApplication.findOne({ userId, status: 'pending' })
  if (existingPending) {
    return res.status(400).json({ success: false, message: 'You already have a pending application' })
  }

  const { name, email, imageUrl } = await snapshotUser(userId)

  const app = await EducatorApplication.create({
    userId,
    name,
    email,
    imageUrl,
    bio,
    yearsExperience: Number(yearsExperience) || 0,
    currentRole: currentRole || '',
    portfolio: Array.isArray(portfolio) ? portfolio : (portfolio ? [portfolio] : []),
    cvUrl: cvUrl || '',
    sampleLectureUrl: sampleLectureUrl || '',
    certifications: Array.isArray(certifications) ? certifications : (certifications ? [certifications] : []),
    supportingMessage: supportingMessage || ''
  })

  res.json({ success: true, application: app })
})


export const listUserApplications = asyncHandler(async (req, res) => {
  const userId = requireAuth(req)
  const apps = await EducatorApplication.find({ userId }).sort({ createdAt: -1 })
  res.json({ success: true, applications: apps })
})

export const getUserApplication = asyncHandler(async (req, res) => {
  const userId = requireAuth(req)
  const { id } = req.params
  const app = await EducatorApplication.findById(id)
  if (!app || app.userId !== userId) return res.status(404).json({ success: false, message: 'Application not found' })
  res.json({ success: true, application: app })
})

export const adminListApplications = asyncHandler(async (req, res) => {
  const status = req.query.status || ''
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(100, Number(req.query.limit) || 20)
  const filter = status ? { status } : {}
  const total = await EducatorApplication.countDocuments(filter)
  const applications = await EducatorApplication.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
  res.json({ success: true, total, page, limit, applications })
})


export const adminGetApplication = asyncHandler(async (req, res) => {
  const { id } = req.params
  const app = await EducatorApplication.findById(id)
  if (!app) return res.status(404).json({ success: false, message: 'Application not found' })
  res.json({ success: true, application: app })
})


export const adminApproveApplication = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { notes } = req.body
  const app = await EducatorApplication.findById(id)
  if (!app) return res.status(404).json({ success: false, message: 'Application not found' })
  if (app.status === 'approved') return res.status(400).json({ success: false, message: 'Already approved' })


  try {
    const clerkUser = await clerkClient.users.getUser(app.userId)
    const existing = clerkUser?.publicMetadata || clerkUser?.public_metadata || {}
    await clerkClient.users.updateUser(app.userId, { publicMetadata: { ...existing, role: 'educator' } })
  } catch (e) {
    console.warn('Clerk update failed:', e?.message || e)
  }

  await User.findByIdAndUpdate(app.userId, { role: 'educator' }, { upsert: true })

  await setApplicationStatus(app, 'approved', notes, req.user?._id || req.user?.id || '')

  res.json({ success: true, application: app })
})

export const adminRejectApplication = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { notes } = req.body
  const app = await EducatorApplication.findById(id)
  if (!app) return res.status(404).json({ success: false, message: 'Application not found' })
  if (app.status === 'rejected') return res.status(400).json({ success: false, message: 'Already rejected' })

  await setApplicationStatus(app, 'rejected', notes, req.user?._id || req.user?.id || '')
  res.json({ success: true, application: app })
})