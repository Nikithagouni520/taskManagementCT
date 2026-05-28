import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const themes = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'system', label: 'System', icon: ComputerDesktopIcon },
];

export default function Settings() {
  const { user, updateSettings } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [isSaving, setIsSaving] = useState(false);

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    setIsSaving(true);
    try {
      await updateSettings({ theme: newTheme });
      toast.success('Theme updated');
    } catch (error) {
      toast.error('Failed to save preference');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

      {/* Profile section */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Appearance section */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => handleThemeChange(t.value)}
              disabled={isSaving}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                theme === t.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <t.icon className={`h-6 w-6 ${theme === t.value ? 'text-primary-600' : 'text-gray-400'}`} />
              <span
                className={`text-sm font-medium ${
                  theme === t.value ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications section */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notifications</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Email notifications</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Receive email updates about your tasks
            </p>
          </div>
          <button
            onClick={() => {
              const newValue = !user?.settings?.notifications;
              updateSettings({ notifications: newValue });
              toast.success(newValue ? 'Notifications enabled' : 'Notifications disabled');
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              user?.settings?.notifications ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                user?.settings?.notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
