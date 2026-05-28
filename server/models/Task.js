import mongoose from 'mongoose';

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 2000,
      default: '',
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    columnId: {
      type: String,
      required: true,
    },
    position: {
      type: Number,
      default: 0,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    labels: [
      {
        name: String,
        color: String,
      },
    ],
    dueDate:{
      type: Date,
    },
    status: {
      type: String,
      enum: ["todo", "inprogress", "completed"],
      default: "todo",
    },
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    subtasks: [subtaskSchema],
    comments: [commentSchema],
    attachments: [
      {
        name: String,
        url: String,
        type: String,
      },
    ],
    cover: {
      type: { type: String, enum: ['color', 'image'], default: 'color' },
      value: String,
    },
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

taskSchema.index({ board: 1, columnId: 1, position: 1 });

export default mongoose.model('Task', taskSchema);
