import { useEffect, useState } from "react";

function TaskList({refreshTasks}) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingTask, setEditingTask] = useState(null);
    const [interns, setInterns] = useState([]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    "http://localhost:5000/api/tasks",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to fetch tasks"
                    );
                }

                setTasks(data.tasks);

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    const fetchInterns = async () => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            "http://localhost:5000/api/interns",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to fetch interns"
            );
        }

        setInterns(data.interns);

    } catch (error) {
        setError(error.message);
    }
};

fetchInterns();
    }, [refreshTasks]);

    if (loading) {
        return <p>Loading tasks...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    const handleDelete = async (taskId) => {
    const confirmed = window.confirm(
        "Are you sure you want to delete this task? This action cannot be undone."
    );

    if (!confirmed) {
        return;
    }

    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            `http://localhost:5000/api/tasks/${taskId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to delete task"
            );
        }

        setTasks((currentTasks) =>
            currentTasks.filter(
                (task) => task._id !== taskId
            )
        );

    } catch (error) {
        setError(error.message);
    }
};
const handleUpdate = async (event) => {
    event.preventDefault();

    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            `http://localhost:5000/api/tasks/${editingTask._id}`,
            {
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
                    priority: editingTask.priority,
                    status: editingTask.status
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to update task"
            );
        }

        setEditingTask(null);

        // Trigger a fresh fetch so populated intern data is restored
        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task._id === editingTask._id
                    ? data.task
                    : task
            )
        );

    } catch (error) {
        setError(error.message);
    }
};
return (
    <div>
        <h2>Tasks</h2>

        {tasks.length === 0 ? (
            <p>No tasks found.</p>
        ) : (
            <ul>
                {tasks.map((task) => (
                    <li key={task._id}>
                        <strong>{task.title}</strong>
                        {" — "}
                        Assigned to: {task.assignedTo?.name}
                        {" — "}
                        Status: {task.status}
                        {" — "}
                        Priority: {task.priority}

                        {" "}

                        <button
                            onClick={() =>
                                setEditingTask({
                                    ...task,
                                    assignedTo:
                                        task.assignedTo?._id || ""
                                })
                            }
                        >
                            Edit
                        </button>

                        <button
                            onClick={() =>
                                handleDelete(task._id)
                            }
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        )}

        {editingTask && (
            <form onSubmit={handleUpdate}>
                <h3>Edit Task</h3>

                <div>
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

                <div>
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

                <div>
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
                            <option
                                key={intern._id}
                                value={intern._id}
                            >
                                {intern.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Deadline</label>
                    <input
                        type="date"
                        value={
                            editingTask.deadline
                                ? editingTask.deadline.split("T")[0]
                                : ""
                        }
                        onChange={(event) =>
                            setEditingTask({
                                ...editingTask,
                                deadline: event.target.value
                            })
                        }
                        required
                    />
                </div>

                <div>
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

                <button type="submit">
                    Save Changes
                </button>

                <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                >
                    Cancel
                </button>
            </form>
        )}
    </div>
);
}

export default TaskList;