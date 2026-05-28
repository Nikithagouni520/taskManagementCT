import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Link, NavLink } from 'react-router-dom';
import { XMarkIcon, HomeIcon, Cog6ToothIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { useBoardStore } from '../../store/boardStore';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function MobileNav({ open, onClose }) {
  const { boards } = useBoardStore();

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/80" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <button type="button" className="-m-2.5 p-2.5" onClick={onClose}>
                    <XMarkIcon className="h-6 w-6 text-white" />
                  </button>
                </div>
              </Transition.Child>

              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-900 px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center">
                  <Link to="/" className="flex items-center gap-3" onClick={onClose}>
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
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <NavLink
                              to={item.href}
                              onClick={onClose}
                              className={({ isActive }) =>
                                `group flex gap-x-3 rounded-lg p-2 text-sm font-medium ${
                                  isActive
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
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

                    <li>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Your Boards
                      </h3>
                      <ul role="list" className="-mx-2 mt-2 space-y-1">
                        {boards.map((board) => (
                          <li key={board._id}>
                            <NavLink
                              to={`/board/${board._id}`}
                              onClick={onClose}
                              className={({ isActive }) =>
                                `group flex gap-x-3 rounded-lg p-2 text-sm font-medium ${
                                  isActive
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
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
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
