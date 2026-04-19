import mongoose from 'mongoose'

const EducatorApplicationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  bio: { type: String, default: '' },
  yearsExperience: { type: Number, default: 0 },
  currentRole: { type: String, default: '' },
  portfolio: [
    {
      title: { type: String },
      url: { type: String },
      type: { type: String }
    }
  ],
  cvUrl: { type: String, default: '' },
  sampleLectureUrl: { type: String, default: '' },
  certifications: [String],
  supportingMessage: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'reviewing', 'approved', 'rejected'], default: 'pending' },
  adminNotes: { type: String, default: '' },
  reviewedBy: { type: String, default: '' },
  reviewedAt: { type: Date },
}, { timestamps: true })

const EducatorApplication = mongoose.models.EducatorApplication || mongoose.model('EducatorApplication', EducatorApplicationSchema)
export default EducatorApplication
