import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import TaskItem from '../components/TaskItem';
import TaskForm from '../components/TaskForm';
import { useNavigate } from 'react-router-dom';

interface Task {
  _id: string;
  title: string;
  description?: string;
  deadline?: string;
  completed: boolean;
  deadlineWarning?: string;
}

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  // Wrap fetchTasks in useCallback so it can be safely used as a dependency
  const fetchTasks = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await axios.get<Task[]>(`${process.env.REACT_APP_API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (err) {
      setError('Failed to fetch tasks');
    }
  }, [navigate]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = (newTask: Task): void => {
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const updateTaskInState = (updatedTask: Task): void => {
    setTasks(prevTasks =>
      prevTasks.map(task => (task._id === updatedTask._id ? updatedTask : task))
    );
  };

  const deleteTaskFromState = (taskId: string): void => {
    setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
  };

  return (
    <div className="dashboard">
      <h2>Task Dashboard</h2>
      {error && <p className="error">{error}</p>}
      <TaskForm addTask={addTask} fetchTasks={fetchTasks} />
      <div className="tasks-list">
        {tasks.map(task => (
          <TaskItem
            key={task._id}
            task={task}
            updateTaskInState={updateTaskInState}
            deleteTaskFromState={deleteTaskFromState}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
