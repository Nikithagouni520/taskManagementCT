import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  XMarkIcon,
  CalendarIcon,
  TagIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  CheckIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../ui/Modal';
import { useBoardStore } from '../../store/boardStore';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-gray-500' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
];

const labelColors = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
];

export default function TaskDetailModal({ task, open, onClose }) {
  const { user } = useAuthStore();
  const { updateTask, deleteTask } = useBoardStore();
  const [editedTask, setEditedTask] = useState(task);
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(labelColors[0]);

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  if (!task) return null;

  const handleSave = async () => {
    try {
      await updateTask(task._id, editedTask);
      toast.success('Task updated');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(task._id);
      toast.success('Task deleted');
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    const subtasks = [...(editedTask.subtasks || []), { title: newSubtask, completed: false }];
    setEditedTask({ ...editedTask, subtasks });
    setNewSubtask('');
  };

  const handleToggleSubtask = (index) => {
    const subtasks = editedTask.subtasks.map((s, i) =>
      i === index ? { ...s, completed: !s.completed } : s
    );
    setEditedTask({ ...editedTask, subtasks });
  };

  const handleAddLabel = () => {
    if (!newLabelName.trim()) return;
    const labels = [...(editedTask.labels || []), { name: newLabelName, color: newLabelColor }];
    setEditedTask({ ...editedTask, labels });
    setNewLabelName('');
    setShowLabelPicker(false);
  };

  const handleRemoveLabel = (index) => {
    const labels = editedTask.labels.filter((_, i) => i !== index);
    setEditedTask({ ...editedTask, labels });
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const comments = [
      ...(editedTask.comments || []),
      { user: { _id: user._id, name: user.name, avatar: user.avatar }, text: newComment, createdAt: new Date() },
    ];
    setEditedTask({ ...editedTask, comments });
    setNewComment('');
  };

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className="flex flex-col lg:flex-row gap-6 max-h-[80vh] overflow-y-auto">
        {/* Main content */}
        <div className="flex-1 space-y-6">
          {/* Title */}
          <input
            type="text"
            className="w-full text-xl font-semibold text-gray-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0 p-0"
            value={editedTask.title || ''}
            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            placeholder="Task title"
          />

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
            <textarea
              className="mt-1 w-full input min-h-[100px] resize-none"
              value={editedTask.description || ''}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              placeholder="Add a more detailed description..."
            />
          </div>

          {/* Subtasks */}
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Subtasks</label>
            <div className="mt-2 space-y-2">
              {editedTask.subtasks?.map((subtask, index) => (
                <motion.div
                  key={index}
                  layout
                  className="flex items-center gap-2"
                >
                  <button
                    onClick={() => handleToggleSubtask(index)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      subtask.completed
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {subtask.completed && <CheckIcon className="w-3 h-3" />}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      subtask.completed
                        ? 'text-gray-400 line-through'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {subtask.title}
                  </span>
                </motion.div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 input text-sm py-1.5"
                  placeholder="Add a subtask..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                />
                <button onClick={handleAddSubtask} className="btn-secondary text-sm py-1.5">
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Comments</label>
            <div className="mt-2 space-y-3">
              {editedTask.comments?.map((comment, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {comment.user?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {comment.user?.name || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{comment.text}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <textarea
                    className="w-full input text-sm min-h-[60px] resize-none"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button
                    onClick={handleAddComment}
                    className="mt-2 btn-primary text-sm py-1.5"
                    disabled={!newComment.trim()}
                  >
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-64 space-y-4">
          {/* Priority */}
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-gray-100 dark:bg-gray-800" />
              Priority
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setEditedTask({ ...editedTask, priority: p.value })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    editedTask.priority === p.value
                      ? `${p.color} text-white`
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Due Date
            </label>
            <input
              type="date"
              className="mt-2 input text-sm"
              value={editedTask.dueDate ? format(new Date(editedTask.dueDate), 'yyyy-MM-dd') : ''}
              onChange={(e) =>
                setEditedTask({ ...editedTask, dueDate: e.target.value ? new Date(e.target.value) : null })
              }
            />
          </div>

          {/* Labels */}
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <TagIcon className="w-5 h-5" />
              Labels
            </label>
            <div className="mt-2 flex flex-wrap gap-1">
              {editedTask.labels?.map((label, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: label.color + '20', color: label.color }}
                >
                  {label.name}
                  <button onClick={() => handleRemoveLabel(index)} className="hover:opacity-70">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={() => setShowLabelPicker(!showLabelPicker)}
                className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <PlusIcon className="w-3 h-3" />
              </button>
            </div>

            <AnimatePresence>
              {showLabelPicker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2"
                >
                  <input
                    type="text"
                    className="input text-sm py-1.5"
                    placeholder="Label name"
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-1">
                    {labelColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewLabelColor(color)}
                        className={`w-6 h-6 rounded-full transition-transform ${
                          newLabelColor === color ? 'scale-110 ring-2 ring-offset-2 ring-gray-400' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <button onClick={handleAddLabel} className="btn-primary text-sm py-1.5 w-full">
                    Add Label
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <button onClick={handleSave} className="btn-primary w-full">
              Save Changes
            </button>
            <button onClick={handleDelete} className="btn-danger w-full">
              <TrashIcon className="w-4 h-4" />
              Delete Task
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
