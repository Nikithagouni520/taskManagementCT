import express from 'express';
import {
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  addComment,
  toggleSubtask, getTasks,
  getBoardTasks,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createTask);

router.get('/', getTasks);

router.get('/board/:boardId', getBoardTasks);

router.route('/:id').put(updateTask).delete(deleteTask);

router.put('/:id/move', moveTask);

router.post('/:id/comments', addComment);

router.put('/:id/subtasks/:subtaskId', toggleSubtask);

export default router;
