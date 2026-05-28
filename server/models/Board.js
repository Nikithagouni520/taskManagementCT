import mongoose from 'mongoose';

const columnSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  color: { type: String, default: '#6366f1' },
  taskIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
});

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Board name is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['admin', 'member', 'viewer'], default: 'member' },
      },
    ],
    columns: [columnSchema],
    background: {
      type: { type: String, enum: ['color', 'gradient', 'image'], default: 'gradient' },
      value: { type: String, default: 'from-indigo-500 to-purple-600' },
    },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

boardSchema.index({ owner: 1, 'members.user': 1 });

export default mongoose.model('Board', boardSchema);
