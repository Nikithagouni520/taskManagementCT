import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { PlusIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';
import QuickAddTask from './QuickAddTask';

export default function Column({ column, tasks, onAddTask, onEditTask, onDeleteColumn }) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'column', column },
  });

  const taskIds = tasks.map((t) => t._id);

  return (
    <div
      className={`flex-shrink-0 w-80 flex flex-col bg-gray-100 dark:bg-gray-800/50 rounded-xl transition-colors ${
        isOver ? 'ring-2 ring-primary-500 ring-opacity-50' : ''
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="font-medium text-gray-900 dark:text-white">{column.title}</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <EllipsisHorizontalIcon className="h-5 w-5" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black/5 dark:ring-white/10 py-1 z-10"
              >
                <button
                  onClick={() => {
                    onDeleteColumn(column.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Delete Column
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Task list */}
      <div
        ref={setNodeRef}
        className="flex-1 px-2 pb-2 overflow-y-auto scrollbar-thin min-h-[200px]"
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} onEdit={() => onEditTask(task)} />
            ))}
          </div>
        </SortableContext>

        {/* Quick add task */}
        <AnimatePresence>
          {showAddTask ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2"
            >
              <QuickAddTask
                columnId={column.id}
                onAdd={onAddTask}
                onCancel={() => setShowAddTask(false)}
              />
            </motion.div>
          ) : (
            <button
              onClick={() => setShowAddTask(true)}
              className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm"
            >
              <PlusIcon className="h-4 w-4" />
              Add task
            </button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
