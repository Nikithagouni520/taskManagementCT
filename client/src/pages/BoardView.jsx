import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { PlusIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { useBoardStore } from '../store/boardStore';
import { socketService } from '../services/socket';
import Column from '../components/board/Column';
import TaskCard from '../components/board/TaskCard';
import TaskDetailModal from '../components/board/TaskDetailModal';
import toast from 'react-hot-toast';

export default function BoardView() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const {
    currentBoard,
    tasks,
    fetchBoard,
    createTask,
    moveTask,
    addColumn,
    deleteColumn,
    setTasks,
    isLoading,
  } = useBoardStore();

  const [activeTask, setActiveTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchBoard(boardId);
    socketService.connect();
    socketService.joinBoard(boardId);

    return () => {
      socketService.leaveBoard(boardId);
    };
  }, [boardId]);

  useEffect(() => {
    const unsubscribeUpdate = socketService.onTaskUpdated((data) => {
      if (data.boardId === boardId) {
        fetchBoard(boardId);
      }
    });

    const unsubscribeMove = socketService.onTaskMoved((data) => {
      if (data.boardId === boardId) {
        fetchBoard(boardId);
      }
    });

    return () => {
      unsubscribeUpdate();
      unsubscribeMove();
    };
  }, [boardId]);

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTask = tasks.find((t) => t._id === active.id);
    if (!activeTask) return;

    let destColumnId = over.id;
    let newIndex = 0;

    // Check if dropped on a task or a column
    if (over.data?.current?.type === 'task') {
      destColumnId = over.data.current.task.columnId;
      const tasksInColumn = tasks.filter((t) => t.columnId === destColumnId);
      newIndex = tasksInColumn.findIndex((t) => t._id === over.id);
    } else if (over.data?.current?.type === 'column') {
      destColumnId = over.data.current.column.id;
      const tasksInColumn = tasks.filter((t) => t.columnId === destColumnId);
      newIndex = tasksInColumn.length;
    }

    if (activeTask.columnId === destColumnId) {
      // Same column reorder
      const columnTasks = tasks.filter((t) => t.columnId === destColumnId);
      const oldIndex = columnTasks.findIndex((t) => t._id === active.id);
      if (oldIndex !== newIndex) {
        const reordered = arrayMove(columnTasks, oldIndex, newIndex);
        const updatedTasks = tasks.map((t) => {
          const reorderedTask = reordered.find((r) => r._id === t._id);
          return reorderedTask || t;
        });
        setTasks(updatedTasks);
      }
    } else {
      // Move to different column
      const updatedTasks = tasks.map((t) =>
        t._id === active.id ? { ...t, columnId: destColumnId } : t
      );
      setTasks(updatedTasks);
    }

    // Persist to backend
    try {
      await moveTask(activeTask._id, {
        sourceColumnId: activeTask.columnId,
        destinationColumnId: destColumnId,
        newPosition: newIndex,
      });
      socketService.emitTaskMove({ boardId, taskId: activeTask._id });
    } catch (error) {
      toast.error('Failed to move task');
      fetchBoard(boardId); // Revert
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      await createTask({ ...taskData, boardId });
      socketService.emitTaskUpdate({ boardId });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;
    try {
      await addColumn(boardId, { title: newColumnTitle });
      setNewColumnTitle('');
      setShowAddColumn(false);
      toast.success('Column added');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteColumn = async (columnId) => {
    if (!confirm('Delete this column and all its tasks?')) return;
    try {
      await deleteColumn(boardId, columnId);
      toast.success('Column deleted');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getTasksByColumn = useCallback(
    (columnId) => tasks.filter((t) => t.columnId === columnId).sort((a, b) => a.position - b.position),
    [tasks]
  );

  if (isLoading || !currentBoard) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Board header */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{currentBoard.name}</h1>
            {currentBoard.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{currentBoard.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Members avatars */}
            <div className="flex -space-x-2">
              {currentBoard.members?.slice(0, 4).map((member) => (
                <div
                  key={member.user._id}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium ring-2 ring-white dark:ring-gray-900"
                  title={member.user.name}
                >
                  {member.user.avatar ? (
                    <img src={member.user.avatar} alt={member.user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    member.user.name.charAt(0).toUpperCase()
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Board content */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto p-4 sm:p-6">
          <div className="flex gap-4 h-full">
            {currentBoard.columns?.map((column) => (
              <Column
                key={column.id}
                column={column}
                tasks={getTasksByColumn(column.id)}
                onAddTask={handleAddTask}
                onEditTask={setSelectedTask}
                onDeleteColumn={handleDeleteColumn}
              />
            ))}

            {/* Add column */}
            <div className="flex-shrink-0 w-80">
              {showAddColumn ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-4"
                >
                  <input
                    type="text"
                    className="input mb-3"
                    placeholder="Enter column title..."
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                  />
                  <div className="flex gap-2">
                    <button onClick={handleAddColumn} className="btn-primary">
                      Add
                    </button>
                    <button onClick={() => setShowAddColumn(false)} className="btn-ghost">
                      Cancel
                    </button>
                  </div>
                </motion.div>
              ) : (
                <button
                  onClick={() => setShowAddColumn(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add Column
                </button>
              )}
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-3">
              <TaskCard task={activeTask} onEdit={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Task detail modal */}
      <TaskDetailModal
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}
