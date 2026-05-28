import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  Squares2X2Icon,
  Cog6ToothIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useBoardStore } from '../../store/boardStore';
import { useEffect, useState } from 'react';
import CreateBoardModal from '../board/CreateBoardModal';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const location = useLocation();
  const { boards, fetchBoards } = useBoardStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchBoards();
  }, []);

  return (
    <>
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">TaskFlow</span>
            </Link>
          </div>

          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              {/* Main navigation */}
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          `group flex gap-x-3 rounded-lg p-2 text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`
                        }
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {item.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Boards */}
              <li>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Your Boards
                  </h3>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {boards.map((board) => (
                    <li key={board._id}>
                      <NavLink
                        to={`/board/${board._id}`}
                        className={({ isActive }) =>
                          `group flex gap-x-3 rounded-lg p-2 text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`
                        }
                      >
                        <Squares2X2Icon className="h-5 w-5 shrink-0" />
                        <span className="truncate">{board.name}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      <CreateBoardModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </>
  );
}
