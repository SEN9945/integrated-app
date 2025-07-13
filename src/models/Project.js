import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  projectLink: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  previewType: {
    type: String,
    enum: ['image', 'pdf', 'google', 'other'],
    default: 'image',
  },
  previewUrl: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
