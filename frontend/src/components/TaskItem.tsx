import React, { useState, FormEvent } from 'react';
import axios from 'axios';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  deadline?: string;
  completed: boolean;
  deadlineWarning?: string;
}

interface TaskItemProps {
  task: Task;
  updateTaskInState: (updatedTask: Task) => void;
  deleteTaskFromState: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, updateTaskInState, deleteTaskFromState }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [deadline, setDeadline] = useState(task.deadline ? task.deadline.split('T')[0] : '');
  const [completed, setCompleted] = useState(task.completed);

  const token = localStorage.getItem('token');

  const toggleComplete = async () => {
    try {
      const res = await axios.put<Task>(`${process.env.REACT_APP_API_URL}/tasks/${task._id}`, { completed: !completed }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompleted(res.data.completed);
      updateTaskInState(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.put<Task>(`${process.env.REACT_APP_API_URL}/tasks/${task._id}`, {
        title,
        description,
        deadline,
        completed
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      updateTaskInState(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axios.delete(`${process.env.REACT_APP_API_URL}/tasks/${task._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(res.data.msg);
      deleteTaskFromState(task._id);
    } catch (err: any) {
      console.error("Error deleting task: ", err.response ? err.response.data : err.message);
    }
  };

  return (
    <div className={`task-item ${completed ? 'completed' : ''}`}>
      {isEditing ? (
        <form onSubmit={handleUpdate}>
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          <input 
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      ) : (
        <>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          {task.deadline && <p>Deadline: {new Date(task.deadline).toLocaleDateString()}</p>}
          {task.deadlineWarning && <p className="warning">{task.deadlineWarning}</p>}
          <div className="actions">
            <button onClick={toggleComplete}>{completed ? 'Mark as Pending' : 'Mark as Completed'}</button>
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button onClick={handleDelete}>Delete</button>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskItem;