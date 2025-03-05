const Task = require('../models/Task');
const { validationResult } = require('express-validator');

exports.createTask = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { title, description, deadline } = req.body;
    try {
        const newTask = new Task({
            title,
            description,
            deadline,
            user: req.user.id,
        });
        const task = await newTask.save();
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id });
        // Check deadlines to add warnings
        const currentDate = new Date();
        const tasksWithStatus = tasks.map(task => {
            let status = task.completed ? 'completed' : 'pending';
            let deadlineWarning = null;
            if (task.deadline) {
                const deadlineDate = new Date(task.deadline);
                if (deadlineDate < currentDate && !task.completed) {
                    deadlineWarning = 'Task is overdue!';
                } else if (deadlineDate - currentDate <= 86400000 && !task.completed) {
                    deadlineWarning = 'Task is expiring soon!';
                }
            }
            return {
                ...task._doc,
                status,
                deadlineWarning
            };
        });
        res.json(tasksWithStatus);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.updateTask = async (req, res) => {
    const { title, description, deadline, completed } = req.body;
    try {
        let task = await Task.findOne({ _id: req.params.id, user: req.user.id });
        if (!task) return res.status(404).json({ msg: 'Task not found' });
        
        task.title = title || task.title;
        task.description = description || task.description;
        task.deadline = deadline || task.deadline;
        if (typeof completed !== 'undefined') {
            task.completed = completed;
        }
        task = await task.save();
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.deleteTask = async (req, res) => {
    try {
      // Use findOneAndDelete to ensure the task belongs to the user and is deleted atomically.
      const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
      if (!task) {
        return res.status(404).json({ msg: 'Task not found' });
      }
      res.json({ msg: 'Task removed' });
    } catch (err) {
      console.error('Error deleting task:', err.message);
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  };
