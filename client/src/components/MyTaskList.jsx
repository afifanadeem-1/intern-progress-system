import { useEffect, useState } from "react";
import API_URL from "../config/api";

function MyTaskList() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [submittingTask, setSubmittingTask] = useState(null);
    const [submissionUrl, setSubmissionUrl] = useState("");
    const [notes, setNotes] = useState("");
    const [viewingSubmission, setViewingSubmission] = useState(null);
    const [submissionLoading, setSubmissionLoading] = useState(false);

    useEffect(() => {
        const fetchMyTasks = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    `${API_URL}/api/tasks/my-tasks`,
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

        fetchMyTasks();
    }, []);
const handleStartTask = async (taskId) => {
    try {
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch(
            `${API_URL}/api/tasks/${taskId}/start`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to start task"
            );
        }

        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task._id === taskId
                    ? data.task
                    : task
            )
        );

    } catch (error) {
        setError(error.message);
    }
};

    if (loading) {
        return <p>Loading your tasks...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }
const handleSubmitWork = async (event) => {
    event.preventDefault();

    try {
        setError("");

        if (!submissionUrl.trim() && !notes.trim()) {
            setError("Submission URL or notes are required");
            return;
        }

        const token = localStorage.getItem("token");

        const response = await fetch(
            `${API_URL}/api/tasks/${submittingTask._id}/submit`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    submissionUrl,
                    notes
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to submit work"
            );
        }

        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task._id === submittingTask._id
                    ? { ...task, status: "submitted" }
                    : task
            )
        );

        setSubmittingTask(null);
        setSubmissionUrl("");
        setNotes("");

    } catch (error) {
        setError(error.message);
    }
};

const handleViewSubmission = async (taskId) => {
    try {
        setError("");
        setSubmissionLoading(true);

        const token = localStorage.getItem("token");

        const response = await fetch(
            `${API_URL}/api/tasks/${taskId}/submission`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to retrieve submission"
            );
        }

        setViewingSubmission(data.submission);

    } catch (error) {
        setError(error.message);
    } finally {
        setSubmissionLoading(false);
    }
};

    return (
        <div>
            <h2>My Tasks</h2>

            {tasks.length === 0 ? (
                <p>No tasks assigned to you.</p>
            ) : (
                <ul>
                    {submittingTask && (
    <form onSubmit={handleSubmitWork}>
        <h3>
            Submit Work: {submittingTask.title}
        </h3>

        <div>
            <label>Submission URL</label>

            <input
                type="url"
                value={submissionUrl}
                onChange={(event) =>
                    setSubmissionUrl(event.target.value)
                }
                placeholder="https://github.com/..."
            />
        </div>

        <div>
            <label>Notes</label>

            <textarea
                value={notes}
                onChange={(event) =>
                    setNotes(event.target.value)
                }
                placeholder="Describe the work you completed"
            />
        </div>

        <button type="submit">
            Submit
        </button>

        <button
            type="button"
            onClick={() => {
                setSubmittingTask(null);
                setSubmissionUrl("");
                setNotes("");
            }}
        >
            Cancel
        </button>
    </form>
)}
{submissionLoading && (
    <p>Loading submission...</p>
)}

{viewingSubmission && (
    <div>
        <h3>
            Submission: {viewingSubmission.task?.title}
        </h3>

        <p>
            <strong>Review Status:</strong>{" "}
            {viewingSubmission.reviewStatus}
        </p>

        {viewingSubmission.submissionUrl && (
            <p>
                <strong>Submitted Work:</strong>{" "}
                <a
                    href={viewingSubmission.submissionUrl}
                    target="_blank"
                    rel="noreferrer"
                >
                    View Work
                </a>
            </p>
        )}

        {viewingSubmission.notes && (
            <p>
                <strong>Notes:</strong>{" "}
                {viewingSubmission.notes}
            </p>
        )}

        {viewingSubmission.feedback && (
            <p>
                <strong>Admin Feedback:</strong>{" "}
                {viewingSubmission.feedback}
            </p>
        )}

        <button
            onClick={() => setViewingSubmission(null)}
        >
            Close
        </button>
    </div>
)}
                    {tasks.map((task) => (
                        <li key={task._id}>
                            <h3>{task.title}</h3>

                            <p>
                                {task.description}
                            </p>

                            <p>
                                <strong>Status:</strong>{" "}
                                {task.status}
                            </p>

                            <p>
                                <strong>Priority:</strong>{" "}
                                {task.priority}
                            </p>

                            <p>
                                <strong>Deadline:</strong>{" "}
                                {new Date(
                                    task.deadline
                                ).toLocaleDateString()}
                            </p>
                            {task.status === "pending" && (
                                <button
                                    onClick={() => handleStartTask(task._id)}
                                >
                                    Start Task
                                </button>
                                )}
                            {task.status === "in-progress" && (
                                <button
                                    onClick={() => {
                                        setSubmittingTask(task);
                                        setSubmissionUrl("");
                                        setNotes("");
                                    }}
                                    >
                                        Submit Work
                                </button>
                            )}
                            {["submitted", "completed"].includes(task.status) && (
                                <button
                                    onClick={() => handleViewSubmission(task._id)}
                                >
                                     View Submission
                                </button>
                            )}
                            
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default MyTaskList;