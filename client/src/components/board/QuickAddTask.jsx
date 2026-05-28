import { useState } from 'react';

export default function QuickAddTask({ columnId, onAdd, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) return;

    setIsLoading(true);

    try {
      await onAdd({
        ...formData,
        title: formData.title.trim(),
        columnId,
      });

      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        status: 'todo',
      });

      onCancel();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-3 space-y-3"
    >
      {/* Title */}
      <input
        type="text"
        className="w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"
        placeholder="Task title"
        value={formData.title}
        onChange={(e) =>
          setFormData({ ...formData, title: e.target.value })
        }
        autoFocus
      />

      {/* Description */}
      <textarea
        className="w-full text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"
        placeholder="Description"
        rows={3}
        value={formData.description}
        onChange={(e) =>
          setFormData({
            ...formData,
            description: e.target.value,
          })
        }
      />

      {/* Due date and time */}
<div>
  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
    Due Date & Time
  </label>

  <input
    type="datetime-local"
    className="w-full text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"
    value={formData.dueDate}
    onChange={(e) =>
      setFormData({
        ...formData,
        dueDate: e.target.value,
      })
    }
  />
</div>

      {/* Priority */}
      <select
        className="w-full text-sm bg-transparent text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"
        value={formData.priority}
        onChange={(e) =>
          setFormData({
            ...formData,
            priority: e.target.value,
          })
          
        }
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>

      

      {/* Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={!formData.title.trim() || isLoading}
          className="btn-primary text-sm py-1.5"
        >
          {isLoading ? 'Adding...' : 'Add'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="btn-ghost text-sm py-1.5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}