import { useEffect, useState } from 'react';
import { getTasks } from '../api/taskApi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  Squares2X2Icon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useBoardStore } from '../store/boardStore';
import { useAuthStore } from '../store/authStore';
import CreateBoardModal from '../components/board/CreateBoardModal';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuthStore();

  const {
    boards,
    fetchBoards,
    deleteBoard,
    isLoading,
  } = useBoardStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchBoards();

    const fetchAllTasks = async () => {
      try {
        const data = await getTasks();
        setTasks(data.data || data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchAllTasks();
  }, []);

  const handleDeleteBoard = async (e, boardId) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this board?'
    );

    if (!confirmDelete) return;

    try {
      await deleteBoard(boardId);
      toast.success('Board deleted');
    } catch (error) {
      console.log(error);
      toast.error('Failed to delete board');
    }
  };

  const today = new Date();

  const activeTasks = tasks.filter(
    (t) => t.status !== 'completed'
  ).length;

  const completedTasks = tasks.filter(
    (t) => t.status === 'completed'
  ).length;

  const overdueTasks = tasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate) < today &&
      t.status !== 'completed'
  ).length;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {greeting()}, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Here's what's happening with your projects today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Boards',
            value: boards.length,
            color: 'from-primary-500 to-purple-600',
          },
          {
            label: 'Active Tasks',
            value: activeTasks,
            color: 'from-green-500 to-emerald-600',
          },
          {
            label: 'Completed',
            value: completedTasks,
            color: 'from-blue-500 to-cyan-600',
          },
          {
            label: 'Overdue',
            value: overdueTasks,
            color: 'from-red-500 to-pink-600',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6"
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {stat.label}
            </p>
            <p
              className={`mt-2 text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
            >
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Your Boards
          </h2>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <PlusIcon className="h-4 w-4" />
            New Board
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="card h-40 animate-pulse bg-gray-200 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : boards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Squares2X2Icon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No boards yet
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Get started by creating your first board.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary mt-4"
            >
              <PlusIcon className="h-4 w-4" />
              Create Board
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {boards.map((board, index) => (
              <motion.div
                key={board._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                <Link
                  to={`/board/${board._id}`}
                  className="block card overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div
                    className={`h-24 bg-gradient-to-br ${
                      board.background?.value ||
                      'from-primary-500 to-purple-600'
                    }`}
                  />

                  <div className="p-4">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {board.name}
                      </h3>

                      <button
                        onClick={(e) => handleDeleteBoard(e, board._id)}
                        className="p-1 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                        title="Delete board"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>

                    {board.description && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {board.description}
                      </p>
                    )}

                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                      <span>{board.columns?.length || 0} columns</span>
                      <span>•</span>
                      <span>{board.members?.length || 0} members</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: boards.length * 0.05 }}
              onClick={() => setShowCreateModal(true)}
              className="card h-full min-h-[180px] flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              <PlusIcon className="h-8 w-8" />
              <span className="mt-2 font-medium">Create new board</span>
            </motion.button>
          </div>
        )}
      </div>

      <CreateBoardModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}