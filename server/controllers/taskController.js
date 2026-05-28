import asyncHandler from 'express-async-handler';
import Task from '../models/Task.js';
import Board from '../models/Board.js';

// @desc    Create task
// @route   POST /api/tasks

export const createTask = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    boardId,
    columnId,
    priority,
    dueDate,
    labels,
  } = req.body;

  const board = await Board.findById(boardId);

  if (!board) {
    res.status(404);
    throw new Error('Board not found');
  }

  // Get current column
  const column = board.columns.find((c) => c.id === columnId);

  // Auto status from column
  let taskStatus = 'todo';

  if (column?.title.toLowerCase().includes('progress')) {
    taskStatus = 'inprogress';
  }

  if (
    column?.title.toLowerCase().includes('done') ||
    column?.title.toLowerCase().includes('complete')
  ) {
    taskStatus = 'completed';
  }

  // Get highest position
  const lastTask = await Task.findOne({
    board: boardId,
    columnId,
  }).sort('-position');

  const position = lastTask ? lastTask.position + 1 : 0;

  // Create task
  const task = await Task.create({
    title,
    description,
    board: boardId,
    columnId,
    status: taskStatus,
    position,
    priority: priority || 'medium',
    dueDate,
    labels,
    createdBy: req.user._id,
  });

  await task.populate([
    { path: 'assignees', select: 'name email avatar' },
    { path: 'createdBy', select: 'name email avatar' },
  ]);

  // Add task to board column
  if (column) {
    column.taskIds.push(task._id);
    await board.save();
  }

  res.status(201).json({
    success: true,
    data: task,
  });
});
// @desc    Update task
// @route   PUT /api/tasks/:id
export const updateTask = asyncHandler(async (req, res) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate([
    { path: 'assignees', select: 'name email avatar' },
    { path: 'createdBy', select: 'name email avatar' },
    { path: 'comments.user', select: 'name email avatar' },
  ]);

  res.json({ success: true, data: task });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Remove from board column
  const board = await Board.findById(task.board);
  if (board) {
    const column = board.columns.find((c) => c.id === task.columnId);
    if (column) {
      column.taskIds = column.taskIds.filter((id) => id.toString() !== task._id.toString());
      await board.save();
    }
  }

  await task.deleteOne();

  res.json({ success: true, data: {} });
});

// @desc    Move task (drag and drop)
// @route   PUT /api/tasks/:id/move
export const moveTask = asyncHandler(async (req, res) => {
  const { sourceColumnId, destinationColumnId, newPosition } = req.body;

  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const board = await Board.findById(task.board);

  if (!board) {
    res.status(404);
    throw new Error('Board not found');
  }

  const sourceColumn = board.columns.find(
    (c) => c.id === sourceColumnId
  );

  const destColumn = board.columns.find(
    (c) => c.id === destinationColumnId
  );

  if (!destColumn) {
    res.status(404);
    throw new Error('Destination column not found');
  }

  if (sourceColumn) {
    sourceColumn.taskIds = sourceColumn.taskIds.filter(
      (id) => id.toString() !== task._id.toString()
    );
  }

  if (!destColumn.taskIds.includes(task._id)) {
    destColumn.taskIds.splice(newPosition, 0, task._id);
  }

  let newStatus = 'todo';

  const columnTitle = destColumn.title.toLowerCase();

  if (columnTitle.includes('progress')) {
    newStatus = 'inprogress';
  }

  if (columnTitle.includes('done') || columnTitle.includes('complete')) {
    newStatus = 'completed';
  }

  task.columnId = destinationColumnId;
  task.position = newPosition;
  task.status = newStatus;

  await task.save();
  await board.save();

  for (let i = 0; i < destColumn.taskIds.length; i++) {
    await Task.findByIdAndUpdate(destColumn.taskIds[i], {
      position: i,
    });
  }

  res.json({
    success: true,
    data: task,
  });
});

// @desc    Add comment
// @route   POST /api/tasks/:id/comments
export const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  task.comments.push({
    user: req.user._id,
    text,
  });

  await task.save();
  await task.populate('comments.user', 'name email avatar');

  res.json({ success: true, data: task });
});

// @desc    Toggle subtask
// @route   PUT /api/tasks/:id/subtasks/:subtaskId
export const toggleSubtask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const subtask = task.subtasks.id(req.params.subtaskId);
  if (!subtask) {
    res.status(404);
    throw new Error('Subtask not found');
  }

  subtask.completed = !subtask.completed;
  await task.save();

  res.json({ success: true, data: task });
});
// @desc    Get all tasks
// @route   GET /api/tasks
export const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({
    createdBy: req.user._id,
  }).sort('-createdAt');

  res.json({
    success: true,
    data: tasks,
  });
});

// @desc    Get board tasks
// @route   GET /api/tasks/board/:boardId
export const getBoardTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({
    board: req.params.boardId,
    createdBy: req.user._id,
  }).sort('position');

  res.json({
    success: true,
    data: tasks,
  });
});