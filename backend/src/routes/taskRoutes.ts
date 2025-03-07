import express from 'express';
import { check } from 'express-validator';
import { createTask, getTasks, updateTask, deleteTask } from '../controllers/taskController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

// Create a new task
router.post(
  '/',
  [
    authMiddleware,
    [check('title', 'Title is required').not().isEmpty()]
  ],
  createTask
);

// Get all tasks for the logged in user
router.get('/', authMiddleware, getTasks);

// Update a task
router.put('/:id', authMiddleware, updateTask);

// Delete a task
router.delete('/:id', authMiddleware, deleteTask);

export default router;
