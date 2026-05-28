import asyncHandler from 'express-async-handler';
import Board from '../models/Board.js';
import Task from '../models/Task.js';
import { v4 as uuidv4 } from 'uuid';

const generateId = () => crypto.randomUUID();

// @desc    Get all boards for user
// @route   GET /api/boards
export const getBoards = asyncHandler(async (req, res) => {
  const boards = await Board.find({
    $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    isArchived: false,
  })
    .populate('owner', 'name email avatar')
    .sort('-updatedAt');

  res.json({ success: true, data: boards });
});

// @desc    Get single board with tasks
// @route   GET /api/boards/:id
export const getBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  if (!board) {
    res.status(404);
    throw new Error('Board not found');
  }

  // Check access
  const hasAccess =
    board.owner._id.toString() === req.user._id.toString() ||
    board.members.some((m) => m.user._id.toString() === req.user._id.toString());

  if (!hasAccess) {
    res.status(403);
    throw new Error('Not authorized to access this board');
  }

  const tasks = await Task.find({ board: board._id })
    .populate('assignees', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('comments.user', 'name email avatar')
    .sort('position');

  res.json({ success: true, data: { board, tasks } });
});

// @desc    Create board
// @route   POST /api/boards
export const createBoard = asyncHandler(async (req, res) => {
  const { name, description, background } = req.body;

  const board = await Board.create({
    name,
    description,
    owner: req.user._id,
    background: background || { type: 'gradient', value: 'from-indigo-500 to-purple-600' },
    columns: [
      { id: generateId(), title: 'To Do', color: '#6366f1', taskIds: [] },
      { id: generateId(), title: 'In Progress', color: '#f59e0b', taskIds: [] },
      { id: generateId(), title: 'Done', color: '#10b981', taskIds: [] },
    ],
  });

  await board.populate('owner', 'name email avatar');

  res.status(201).json({ success: true, data: board });
});

// @desc    Update board
// @route   PUT /api/boards/:id
export const updateBoard = asyncHandler(async (req, res) => {
  let board = await Board.findById(req.params.id);

  if (!board) {
    res.status(404);
    throw new Error('Board not found');
  }

  if (board.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this board');
  }

  board = await Board.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('owner', 'name email avatar');

  res.json({ success: true, data: board });
});

// @desc    Delete board
// @route   DELETE /api/boards/:id
export const deleteBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);

  if (!board) {
    res.status(404);
    throw new Error('Board not found');
  }

  if (board.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this board');
  }

  await Task.deleteMany({ board: board._id });
  await board.deleteOne();

  res.json({
    success: true,
    message: 'Board deleted successfully',
  });
});
// @desc    Update columns (for drag-and-drop reordering)
// @route   PUT /api/boards/:id/columns
export const updateColumns = asyncHandler(async (req, res) => {
  const { columns } = req.body;

  const board = await Board.findById(req.params.id);

  if (!board) {
    res.status(404);
    throw new Error('Board not found');
  }

  board.columns = columns;
  await board.save();

  res.json({ success: true, data: board });
});

// @desc    Add column
// @route   POST /api/boards/:id/columns
export const addColumn = asyncHandler(async (req, res) => {
  const { title, color } = req.body;

  const board = await Board.findById(req.params.id);

  if (!board) {
    res.status(404);
    throw new Error('Board not found');
  }

  board.columns.push({
    id: generateId(),
    title,
    color: color || '#6366f1',
    taskIds: [],
  });

  await board.save();

  res.json({ success: true, data: board });
});

// @desc    Delete column
// @route   DELETE /api/boards/:id/columns/:columnId
export const deleteColumn = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);

  if (!board) {
    res.status(404);
    throw new Error('Board not found');
  }

  const columnIndex = board.columns.findIndex((c) => c.id === req.params.columnId);
  
  if (columnIndex === -1) {
    res.status(404);
    throw new Error('Column not found');
  }

  // Delete all tasks in this column
  await Task.deleteMany({ board: board._id, columnId: req.params.columnId });

  board.columns.splice(columnIndex, 1);
  await board.save();

  res.json({ success: true, data: board });
});
