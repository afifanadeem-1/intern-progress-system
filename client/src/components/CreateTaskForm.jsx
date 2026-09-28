import { useEffect, useState } from "react";
import API_URL from "../config/api";

function CreateTaskForm({ onTaskCreated, onCancel }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [deadline, setDeadline] = useState("");
    const [priority, setPriority] = useState("medium");

    const [interns, setInterns] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchInterns = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    `${API_URL}/api/interns`,
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
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setError("");
            

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/api/tasks`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        assignedTo,
                        deadline,
                        priority
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to create task"
                );
            }

            

            setTitle("");
            setDescription("");
            setAssignedTo("");
            setDeadline("");
            setPriority("medium");

            onTaskCreated();

        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div>
            <div className="task-form-header">
    <div>
        <h3>Create Task</h3>
        <p>Assign a new task to an intern.</p>
    </div>

    <button
        type="button"
        className="modal-close"
        onClick={onCancel}
    >
        ×
    </button>
</div>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(event) =>
                            setTitle(event.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label>Description</label>
                    <textarea
                        value={description}
                        onChange={(event) =>
                            setDescription(event.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label>Assign To</label>

                    <select
                        value={assignedTo}
                        onChange={(event) =>
                            setAssignedTo(event.target.value)
                        }
                        required
                    >
                        <option value="">
                            Select an intern
                        </option>

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
                        value={deadline}
                        onChange={(event) =>
                            setDeadline(event.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label>Priority</label>

                    <select
                        value={priority}
                        onChange={(event) =>
                            setPriority(event.target.value)
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
        onClick={onCancel}
    >
        Cancel
    </button>

    <button
        type="submit"
        className="save-button"
    >
        Create Task
    </button>
</div>
            </form>

            {error && <p>{error}</p>}
        </div>
    );
}

export default CreateTaskForm;