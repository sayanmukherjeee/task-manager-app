import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskItem from '../components/TaskItem';
import TaskForm from '../components/TaskForm';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchTasks = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/tasks`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(res.data);
        } catch (err) {
            setError('Failed to fetch tasks');
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const addTask = (newTask) => {
        setTasks([...tasks, newTask]);
    };

    const updateTaskInState = (updatedTask) => {
        setTasks(tasks.map(task => task._id === updatedTask._id ? updatedTask : task));
    };

    const deleteTaskFromState = (taskId) => {
        setTasks(tasks.filter(task => task._id !== taskId));
    };

    return (
        <div className="dashboard">
            <h2>Task Dashboard</h2>
            {error && <p className="error">{error}</p>}
            <TaskForm addTask={addTask} fetchTasks={fetchTasks} />
            <div className="tasks-list">
                {tasks.map(task => (
                    <TaskItem key={task._id} task={task} updateTaskInState={updateTaskInState} deleteTaskFromState={deleteTaskFromState} />
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
