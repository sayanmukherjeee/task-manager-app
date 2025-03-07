import { Request, Response } from 'express';
import Task from '../models/Task';
import { validationResult } from 'express-validator';

export const createTask = async (req: Request, res: Response) => {
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
      user: req.user!.id,
    });
    const task = await newTask.save();
    res.json(task);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find({ user: req.user!.id });
    // Check deadlines to add warnings
    const currentDate = new Date();
    const tasksWithStatus = tasks.map((task) => {
      let status = task.completed ? 'completed' : 'pending';
      let deadlineWarning: string | null = null;
      if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        if (deadlineDate < currentDate && !task.completed) {
          deadlineWarning = 'Task is overdue!';
        } else if (deadlineDate.getTime() - currentDate.getTime() <= 86400000 && !task.completed) {
          deadlineWarning = 'Task is expiring soon!';
        }
      }
      return {
        ...task.toObject(),
        status,
        deadlineWarning,
      };
    });
    res.json(tasksWithStatus);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

export const updateTask = async (req: Request, res: Response) => {
  const { title, description, deadline, completed } = req.body;
  try {
    let task = await Task.findOne({ _id: req.params.id, user: req.user!.id });
    if (!task) return res.status(404).json({ msg: 'Task not found' });

    task.title = title || task.title;
    task.description = description || task.description;
    task.deadline = deadline || task.deadline;
    if (typeof completed !== 'undefined') {
      task.completed = completed;
    }
    task = await task.save();
    res.json(task);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user!.id });
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.json({ msg: 'Task removed' });
  } catch (err: any) {
    console.error('Error deleting task:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
