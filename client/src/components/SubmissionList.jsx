import { useEffect, useState } from "react";
import API_URL from "../config/api";
import "./SubmissionList.css";

function SubmissionList() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [selectedSubmission, setSelectedSubmission] =
        useState(null);

    const [feedback, setFeedback] = useState("");

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    `${API_URL}/api/submissions`,
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
                            "Failed to fetch submissions"
                    );
                }

                setSubmissions(data.submissions);

            } catch (error) {
                setError(error.message);

            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, []);

    const closeReviewModal = () => {
        setSelectedSubmission(null);
        setFeedback("");
    };

    const handleReview = async (reviewStatus) => {
        try {
            setError("");

            if (!feedback.trim()) {
                setError("Feedback is required");
                return;
            }

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/api/submissions/${selectedSubmission._id}/review`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        reviewStatus,
                        feedback: feedback.trim()
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to review submission"
                );
            }

            setSubmissions((currentSubmissions) =>
                currentSubmissions.map((submission) =>
                    submission._id ===
                    selectedSubmission._id
                        ? data.submission
                        : submission
                )
            );

            closeReviewModal();

            if (reviewStatus === "approved") {
                setSuccessMessage(
                    "Submission approved successfully"
                );
            } else {
                setSuccessMessage(
                    "Revision requested successfully"
                );
            }

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);

        } catch (error) {
            setError(error.message);
        }
    };

    if (loading) {
        return <p>Loading submissions...</p>;
    }

    return (
        <div className="submission-section">

            {/* SUCCESS TOAST */}

            {successMessage && (
                <div className="success-toast">
                    <span className="success-toast-icon">
                        ✓
                    </span>

                    <div>
                        <strong>Success</strong>
                        <p>{successMessage}</p>
                    </div>
                </div>
            )}

            {/* ERROR TOAST */}

            {error && (
                <div className="error-toast">
                    <span className="error-toast-icon">
                        !
                    </span>

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

            {/* SUBMISSION TABLE */}

            {submissions.length === 0 ? (
                <div className="empty-state">
                    <p>No submissions found.</p>
                </div>
            ) : (
                <div className="submission-table-container">

                    <table className="submission-table">

                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>Intern</th>
                                <th>Submitted</th>
                                <th>Status</th>
                                <th>Work</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {submissions.map(
                                (submission) => (
                                    <tr
                                        key={submission._id}
                                    >
                                        <td>
                                            <div className="submission-task-title">
                                                {submission.task
                                                    ?.title ||
                                                    "Unknown Task"}
                                            </div>

                                            {submission.notes && (
                                                <div className="submission-notes">
                                                    {
                                                        submission.notes
                                                    }
                                                </div>
                                            )}
                                        </td>

                                        <td>
                                            <div className="submission-intern">
                                                {submission.intern
                                                    ?.name ||
                                                    "Unknown Intern"}
                                            </div>

                                            {submission.intern
                                                ?.email && (
                                                <div className="submission-email">
                                                    {
                                                        submission
                                                            .intern
                                                            .email
                                                    }
                                                </div>
                                            )}
                                        </td>

                                        <td>
                                            {submission.submittedAt
                                                ? new Date(
                                                      submission.submittedAt
                                                  ).toLocaleDateString()
                                                : "—"}
                                        </td>

                                        <td>
                                            <span
                                                className={`review-badge review-${submission.reviewStatus}`}
                                            >
                                                {submission.reviewStatus ===
                                                "revision-required"
                                                    ? "Revision Required"
                                                    : submission.reviewStatus}
                                            </span>
                                        </td>

                                        <td>
                                            {submission.submissionUrl ? (
                                                <a
                                                    className="view-work-button"
                                                    href={
                                                        submission.submissionUrl
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    View Work
                                                </a>
                                            ) : (
                                                <span className="no-link">
                                                    No link
                                                </span>
                                            )}
                                        </td>

                                        <td>
                                            {submission.reviewStatus ===
                                            "pending" ? (
                                                <button
                                                    className="review-button"
                                                    onClick={() => {
                                                        setError(
                                                            ""
                                                        );

                                                        setSelectedSubmission(
                                                            submission
                                                        );

                                                        setFeedback(
                                                            ""
                                                        );
                                                    }}
                                                >
                                                    Review
                                                </button>
                                            ) : (
                                                <span className="reviewed-label">
                                                    Reviewed
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>

                    </table>
                </div>
            )}

            {/* REVIEW MODAL */}

            {selectedSubmission && (
                <div className="modal-overlay">

                    <div className="review-modal">

                        <div className="modal-header">

                            <div>
                                <h3>
                                    Review Submission
                                </h3>

                                <p>
                                    {
                                        selectedSubmission
                                            .task?.title
                                    }
                                    {" — "}
                                    {
                                        selectedSubmission
                                            .intern?.name
                                    }
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={
                                    closeReviewModal
                                }
                            >
                                ×
                            </button>

                        </div>

                        {/* SUBMISSION DETAILS */}

                        <div className="review-details">

                            {selectedSubmission
                                .submissionUrl && (
                                <div className="review-detail-row">
                                    <span>
                                        Submitted work
                                    </span>

                                    <a
                                        href={
                                            selectedSubmission
                                                .submissionUrl
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Open submission ↗
                                    </a>
                                </div>
                            )}

                            {selectedSubmission.notes && (
                                <div className="review-notes">
                                    <span>
                                        Intern Notes
                                    </span>

                                    <p>
                                        {
                                            selectedSubmission
                                                .notes
                                        }
                                    </p>
                                </div>
                            )}

                        </div>

                        {/* FEEDBACK */}

                        <div className="form-group">
                            <label>
                                Feedback
                            </label>

                            <textarea
                                value={feedback}
                                onChange={(event) =>
                                    setFeedback(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter feedback for the intern..."
                            />
                        </div>

                        {/* ACTIONS */}

                        <div className="review-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={
                                    closeReviewModal
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="revision-button"
                                onClick={() =>
                                    handleReview(
                                        "revision-required"
                                    )
                                }
                            >
                                Request Revision
                            </button>

                            <button
                                type="button"
                                className="approve-button"
                                onClick={() =>
                                    handleReview(
                                        "approved"
                                    )
                                }
                            >
                                Approve
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

export default SubmissionList;