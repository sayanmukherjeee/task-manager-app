const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

// Create a new task
router.post('/', [authMiddleware, [
    check('title', 'Title is required').not().isEmpty()
]], taskController.createTask);

// Get all tasks for the logged in user
router.get('/', authMiddleware, taskController.getTasks);

// Update a task
router.put('/:id', authMiddleware, taskController.updateTask);

// Delete a task
router.delete('/:id', authMiddleware, taskController.deleteTask);

module.exports = router;
