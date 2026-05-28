import express from 'express';

import {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  updateColumns,
  addColumn,
  deleteColumn,
} from '../controllers/boardController.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getBoards).post(createBoard);

router
  .route('/:id')
  .get(getBoard)
  .put(updateBoard)
  .delete(deleteBoard);

router.route('/:id/columns').put(updateColumns).post(addColumn);

router.delete('/:id/columns/:columnId', deleteColumn);

export default router;