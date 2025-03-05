import React, { useState } from 'react';
import axios from 'axios';

const TaskForm = ({ addTask, fetchTasks }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/tasks`, {
                title,
                description,
                deadline
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            addTask(res.data);
            setTitle('');
            setDescription('');
            setDeadline('');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <form className="task-form" onSubmit={handleSubmit}>
            <input 
                type="text"
                placeholder="Task Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <textarea 
                placeholder="Task Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            <input 
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
            />
            <button type="submit">Add Task</button>
        </form>
    );
};

export default TaskForm;