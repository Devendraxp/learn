import mongoose, { model, mongo } from "mongoose";

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  role: { type: String, enum: ['student', 'educator', 'admin'], default: 'student' },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
}, { timestamps: true });

const User = mongoose.model('User',userSchema);

export default User;