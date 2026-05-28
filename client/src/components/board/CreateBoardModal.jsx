import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBoardStore } from '../../store/boardStore';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';

const gradients = [
  'from-indigo-500 to-purple-600',
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-blue-500',
  'from-green-500 to-emerald-500',
  'from-orange-500 to-red-500',
  'from-violet-500 to-purple-500',
  'from-yellow-400 to-orange-500',
  'from-teal-500 to-cyan-500',
];

export default function CreateBoardModal({ open, onClose }) {
  const navigate = useNavigate();
  const { createBoard } = useBoardStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    background: gradients[0],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);
    try {
      const board = await createBoard({
        name: formData.name,
        description: formData.description,
        background: { type: 'gradient', value: formData.background },
      });
      toast.success('Board created!');
      onClose();
      navigate(`/board/${board._id}`);
      setFormData({ name: '', description: '', background: gradients[0] });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Board">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Board Name
          </label>
          <input
            type="text"
            className="input"
            placeholder="Enter board name..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description (optional)
          </label>
          <textarea
            className="input min-h-[80px] resize-none"
            placeholder="What's this board for?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Background
          </label>
          <div className="grid grid-cols-4 gap-2">
            {gradients.map((gradient) => (
              <button
                key={gradient}
                type="button"
                onClick={() => setFormData({ ...formData, background: gradient })}
                className={`h-12 rounded-lg bg-gradient-to-br ${gradient} transition-all ${
                  formData.background === gradient
                    ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900 scale-105'
                    : 'hover:scale-105'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isLoading || !formData.name.trim()}>
            {isLoading ? 'Creating...' : 'Create Board'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
