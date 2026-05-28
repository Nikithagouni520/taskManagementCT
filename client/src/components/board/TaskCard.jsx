import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { format, isPast, isToday } from 'date-fns';
import {
  CalendarIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline';

const priorityColors = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  medium: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  high: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

export default function TaskCard({ task, onEdit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: { type: 'task', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  const dueDateColor = () => {
    if (!task.dueDate) return '';
    if (task.isCompleted) return 'text-green-600 dark:text-green-400';
    if (isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate))) {
      return 'text-red-600 dark:text-red-400';
    }
    if (isToday(new Date(task.dueDate))) {
      return 'text-orange-600 dark:text-orange-400';
    }
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 ${
        isDragging ? 'opacity-50 shadow-lg scale-105' : ''
      }`}
      onClick={() => onEdit()}
    >
      {/* Cover image or color */}
      {task.cover?.value && (
        <div
          className={`-mx-3 -mt-3 mb-3 h-20 rounded-t-xl ${
            task.cover.type === 'color' ? task.cover.value : ''
          }`}
          style={
            task.cover.type === 'image'
              ? { backgroundImage: `url(${task.cover.value})`, backgroundSize: 'cover' }
              : {}
          }
        />
      )}

      {/* Labels */}
      {task.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.map((label, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: label.color + '20', color: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
        {task.title}
      </h4>

      {/* Metadata */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          {/* Priority */}
          <span className={`px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>

          {/* Due date */}
          {task.dueDate && (
            <span className={`flex items-center gap-1 ${dueDateColor()}`}>
              <CalendarIcon className="h-3.5 w-3.5" />
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          {/* Subtasks */}
          {totalSubtasks > 0 && (
            <span className="flex items-center gap-1">
              <CheckCircleIcon className="h-3.5 w-3.5" />
              {completedSubtasks}/{totalSubtasks}
            </span>
          )}

          {/* Comments */}
          {task.comments?.length > 0 && (
            <span className="flex items-center gap-1">
              <ChatBubbleLeftIcon className="h-3.5 w-3.5" />
              {task.comments.length}
            </span>
          )}

          {/* Attachments */}
          {task.attachments?.length > 0 && (
            <span className="flex items-center gap-1">
              <PaperClipIcon className="h-3.5 w-3.5" />
              {task.attachments.length}
            </span>
          )}
        </div>
      </div>

      {/* Assignees */}
      {task.assignees?.length > 0 && (
        <div className="flex -space-x-2 mt-3">
          {task.assignees.slice(0, 3).map((user) => (
            <div
              key={user._id}
              className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium ring-2 ring-white dark:ring-gray-900"
              title={user.name}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
          ))}
          {task.assignees.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-medium ring-2 ring-white dark:ring-gray-900">
              +{task.assignees.length - 3}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
