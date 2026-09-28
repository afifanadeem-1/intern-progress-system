import { useEffect, useState } from "react";
import API_URL from "../config/api";
import "./MyTaskList.css";

function MyTaskList() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

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

    const showSuccess = (message) => {
        setSuccessMessage(message);

        setTimeout(() => {
            setSuccessMessage("");
        }, 3000);
    };

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

            showSuccess("Task started successfully");

        } catch (error) {
            setError(error.message);
        }
    };

    const handleSubmitWork = async (event) => {
        event.preventDefault();

        try {
            setError("");

            if (!submissionUrl.trim() && !notes.trim()) {
                setError(
                    "Submission URL or notes are required"
                );
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
                        submissionUrl: submissionUrl.trim(),
                        notes: notes.trim()
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

            showSuccess("Work submitted successfully");

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
                    data.message ||
                        "Failed to retrieve submission"
                );
            }

            setViewingSubmission(data.submission);

        } catch (error) {
            setError(error.message);
        } finally {
            setSubmissionLoading(false);
        }
    };

    const closeSubmitModal = () => {
        setSubmittingTask(null);
        setSubmissionUrl("");
        setNotes("");
    };

    const formatStatus = (status) => {
        if (status === "in-progress") {
            return "In Progress";
        }

        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    if (loading) {
        return (
            <div className="task-state">
                Loading your tasks...
            </div>
        );
    }

    return (
        <div className="my-task-list">

            {/* TOASTS */}

            {successMessage && (
                <div className="success-toast">
                    <span>✓</span>

                    <div>
                        <strong>Success</strong>
                        <p>{successMessage}</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="error-toast">
                    <span>!</span>

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

            {/* TASKS */}

            {tasks.length === 0 ? (
                <div className="task-empty-state">
                    <div className="task-empty-icon">
                        ✓
                    </div>

                    <h4>No tasks assigned</h4>

                    <p>
                        You don't have any assigned tasks right now.
                    </p>
                </div>
            ) : (
                <div className="intern-task-grid">

                    {tasks.map((task) => (
                        <article
                            className="intern-task-card"
                            key={task._id}
                        >

                            <div className="task-card-top">

                                <div className="task-card-title-area">
                                    <h4>{task.title}</h4>

                                    <p>
                                        {task.description ||
                                            "No description provided."}
                                    </p>
                                </div>

                                <span
                                    className={`intern-status-badge status-${task.status}`}
                                >
                                    {formatStatus(task.status)}
                                </span>

                            </div>

                            <div className="task-card-meta">

                                <div className="task-meta-item">
                                    <span>Priority</span>

                                    <strong
                                        className={`intern-priority priority-${task.priority}`}
                                    >
                                        {task.priority}
                                    </strong>
                                </div>

                                <div className="task-meta-item">
                                    <span>Deadline</span>

                                    <strong>
                                        {task.deadline
                                            ? new Date(
                                                  task.deadline
                                              ).toLocaleDateString()
                                            : "No deadline"}
                                    </strong>
                                </div>

                            </div>

                            <div className="task-card-footer">

                                <div className="task-status-text">
                                    {task.status === "pending" &&
                                        "Ready to begin"}

                                    {task.status === "in-progress" &&
                                        "Work in progress"}

                                    {task.status === "submitted" &&
                                        "Waiting for review"}

                                    {task.status === "completed" &&
                                        "Task completed"}
                                </div>

                                <div className="task-card-actions">

                                    {task.status === "pending" && (
                                        <button
                                            className="start-task-button"
                                            onClick={() =>
                                                handleStartTask(
                                                    task._id
                                                )
                                            }
                                        >
                                            Start Task
                                        </button>
                                    )}

                                    {task.status === "in-progress" && (
                                        <button
                                            className="submit-work-button"
                                            onClick={() => {
                                                setError("");
                                                setSubmittingTask(task);
                                                setSubmissionUrl("");
                                                setNotes("");
                                            }}
                                        >
                                            Submit Work
                                        </button>
                                    )}

                                    {[
                                        "submitted",
                                        "completed"
                                    ].includes(task.status) && (
                                        <button
                                            className="view-submission-button"
                                            onClick={() =>
                                                handleViewSubmission(
                                                    task._id
                                                )
                                            }
                                            disabled={submissionLoading}
                                        >
                                            {submissionLoading
                                                ? "Loading..."
                                                : "View Submission"}
                                        </button>
                                    )}

                                </div>

                            </div>

                        </article>
                    ))}

                </div>
            )}

            {/* SUBMIT WORK MODAL */}

            {submittingTask && (
                <div className="intern-modal-overlay">

                    <form
                        className="intern-submit-modal"
                        onSubmit={handleSubmitWork}
                    >

                        <div className="intern-modal-header">

                            <div>
                                <span className="modal-label">
                                    SUBMIT WORK
                                </span>

                                <h3>{submittingTask.title}</h3>

                                <p>
                                    Add a link to your work, notes,
                                    or both.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="intern-modal-close"
                                onClick={closeSubmitModal}
                            >
                                ×
                            </button>

                        </div>

                        <div className="intern-form-group">
                            <label>
                                Submission URL
                            </label>

                            <input
                                type="url"
                                value={submissionUrl}
                                onChange={(event) =>
                                    setSubmissionUrl(
                                        event.target.value
                                    )
                                }
                                placeholder="https://github.com/..."
                            />

                            <small>
                                GitHub repository, deployed project
                                or another work link.
                            </small>
                        </div>

                        <div className="intern-form-group">
                            <label>
                                Notes
                            </label>

                            <textarea
                                value={notes}
                                onChange={(event) =>
                                    setNotes(
                                        event.target.value
                                    )
                                }
                                placeholder="Describe the work you completed..."
                            />
                        </div>

                        <div className="intern-modal-actions">

                            <button
                                type="button"
                                className="intern-cancel-button"
                                onClick={closeSubmitModal}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="intern-submit-button"
                            >
                                Submit Work
                            </button>

                        </div>

                    </form>

                </div>
            )}

            {/* VIEW SUBMISSION MODAL */}

            {viewingSubmission && (
                <div className="intern-modal-overlay">

                    <div className="intern-view-modal">

                        <div className="intern-modal-header">

                            <div>
                                <span className="modal-label">
                                    YOUR SUBMISSION
                                </span>

                                <h3>
                                    {viewingSubmission.task?.title ||
                                        "Submission"}
                                </h3>
                            </div>

                            <button
                                type="button"
                                className="intern-modal-close"
                                onClick={() =>
                                    setViewingSubmission(null)
                                }
                            >
                                ×
                            </button>

                        </div>

                        <div className="submission-status-section">

                            <span>Review Status</span>

                            <span
                                className={`submission-review-badge review-${viewingSubmission.reviewStatus}`}
                            >
                                {viewingSubmission.reviewStatus ===
                                "revision-required"
                                    ? "Revision Required"
                                    : viewingSubmission.reviewStatus}
                            </span>

                        </div>

                        {viewingSubmission.submissionUrl && (
                            <div className="submission-detail">
                                <span>Submitted Work</span>

                                <a
                                    href={
                                        viewingSubmission.submissionUrl
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Open submission ↗
                                </a>
                            </div>
                        )}

                        {viewingSubmission.notes && (
                            <div className="submission-detail">
                                <span>Your Notes</span>

                                <p>
                                    {viewingSubmission.notes}
                                </p>
                            </div>
                        )}

                        {viewingSubmission.feedback && (
                            <div className="admin-feedback-box">
                                <span>Admin Feedback</span>

                                <p>
                                    {viewingSubmission.feedback}
                                </p>
                            </div>
                        )}

                        <div className="intern-modal-actions">
                            <button
                                type="button"
                                className="intern-cancel-button"
                                onClick={() =>
                                    setViewingSubmission(null)
                                }
                            >
                                Close
                            </button>
                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default MyTaskList;