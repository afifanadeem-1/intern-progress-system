import { useEffect, useState } from "react";
import API_URL from "../config/api";
import "./TaskList.css";

function TaskList({ refreshTasks }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingTask, setEditingTask] = useState(null);
    const [originalTask, setOriginalTask] = useState(null);
    const [interns, setInterns] = useState([]);
    const [deletingTask, setDeletingTask] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${API_URL}/api/tasks`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to fetch tasks");
                }

                setTasks(data.tasks);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchInterns = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${API_URL}/api/interns`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to fetch interns");
                }

                setInterns(data.interns);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchTasks();
        fetchInterns();
    }, [refreshTasks]);

    const handleDelete = async (taskId) => {
        try {
            setError("");

            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete task");
            }

            setTasks((currentTasks) =>
                currentTasks.filter((task) => task._id !== taskId)
            );

            setDeletingTask(null);
            setSuccessMessage("Task deleted successfully");

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (error) {
            setDeletingTask(null);
            setError(error.message);
        }
    };

    const hasChanges =
        editingTask &&
        originalTask &&
        (editingTask.title !== originalTask.title ||
            editingTask.description !== originalTask.description ||
            editingTask.assignedTo !== originalTask.assignedTo ||
            editingTask.deadline !== originalTask.deadline ||
            editingTask.priority !== originalTask.priority);

    const handleUpdate = async (event) => {
        event.preventDefault();

        if (!hasChanges) return;

        try {
            setError("");
            const token = localStorage.getItem("token");
            const taskId = editingTask._id;

            const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: editingTask.title,
                    description: editingTask.description,
                    assignedTo: editingTask.assignedTo,
                    deadline: editingTask.deadline,
                    priority: editingTask.priority
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update task");
            }

            setTasks((currentTasks) =>
                currentTasks.map((task) =>
                    task._id === taskId ? data.task : task
                )
            );

            setEditingTask(null);
            setOriginalTask(null);

            setSuccessMessage("Task updated successfully");

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (error) {
            setError(error.message);
        }
    };

    const openEditModal = (task) => {
        const taskToEdit = {
            ...task,
            assignedTo: task.assignedTo?._id || "",
            deadline: task.deadline ? task.deadline.split("T")[0] : ""
        };

        setEditingTask({ ...taskToEdit });
        setOriginalTask({ ...taskToEdit });
    };

    const closeEditModal = () => {
        setEditingTask(null);
        setOriginalTask(null);
    };

    if (loading) {
        return <p>Loading tasks...</p>;
    }

    return (
        <div>
            {successMessage && (
                <div className="success-toast">
                    <span className="success-toast-icon">✓</span>
                    <div>
                        <strong>Success</strong>
                        <p>{successMessage}</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="error-toast">
                    <span className="error-toast-icon">!</span>
                    <div>
                        <strong>Action failed</strong>
                        <p>{error}</p>
                    </div>
                    <button
                        type="button"
                        className="toast-close"
                        onClick={() => setError("")}
                    >
                        ×
                    </button>
                </div>
            )}

            {tasks.length === 0 ? (
                <div className="empty-state">
                    <p>No tasks found.</p>
                </div>
            ) : (
                <div className="task-table-container">
                    <table className="task-table">
                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>Assigned To</th>
                                <th>Deadline</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {tasks.map((task) => (
                                <tr key={task._id}>
                                    <td>
                                        <div className="task-title">{task.title}</div>
                                        <div className="task-description">
                                            {task.description}
                                        </div>
                                    </td>
                                    <td>{task.assignedTo?.name || "Unassigned"}</td>
                                    <td>
                                        {task.deadline
                                            ? new Date(task.deadline).toLocaleDateString()
                                            : "—"}
                                    </td>
                                    <td>
                                        <span
                                            className={`priority-badge priority-${task.priority}`}
                                        >
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                            className={`status-badge status-${task.status}`}
                                        >
                                            {task.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="task-actions">
                                            <button
                                                className="edit-button"
                                                onClick={() => openEditModal(task)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="delete-button"
                                                onClick={() => setDeletingTask(task)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {editingTask && (
                <div className="modal-overlay">
                    <div className="edit-task-modal">
                        <div className="modal-header">
                            <div>
                                <h3>Edit Task</h3>
                                <p>Update task information and assignment.</p>
                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={closeEditModal}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={editingTask.title}
                                    onChange={(event) =>
                                        setEditingTask({
                                            ...editingTask,
                                            title: event.target.value
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={editingTask.description}
                                    onChange={(event) =>
                                        setEditingTask({
                                            ...editingTask,
                                            description: event.target.value
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Assign To</label>
                                <select
                                    value={editingTask.assignedTo}
                                    onChange={(event) =>
                                        setEditingTask({
                                            ...editingTask,
                                            assignedTo: event.target.value
                                        })
                                    }
                                    required
                                >
                                    {interns.map((intern) => (
                                        <option key={intern._id} value={intern._id}>
                                            {intern.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Deadline</label>
                                <input
                                    type="date"
                                    value={editingTask.deadline}
                                    onChange={(event) =>
                                        setEditingTask({
                                            ...editingTask,
                                            deadline: event.target.value
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Priority</label>
                                <select
                                    value={editingTask.priority}
                                    onChange={(event) =>
                                        setEditingTask({
                                            ...editingTask,
                                            priority: event.target.value
                                        })
                                    }
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={closeEditModal}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-button"
                                    disabled={!hasChanges}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deletingTask && (
                <div className="modal-overlay">
                    <div className="delete-task-modal">
                        <div className="delete-modal-icon">!</div>

                        <h3>Delete Task?</h3>

                        <p>
                            Are you sure you want to delete{" "}
                            <strong>{deletingTask.title}</strong>? This action
                            cannot be undone.
                        </p>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() => setDeletingTask(null)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="confirm-delete-button"
                                onClick={() => handleDelete(deletingTask._id)}
                            >
                                Delete Task
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default TaskList;
