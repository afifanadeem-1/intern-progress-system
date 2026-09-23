import { useEffect, useState } from "react";
import API_URL from "../config/api";

function SubmissionList() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedSubmission, setSelectedSubmission] = useState(null);
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
                        data.message || "Failed to fetch submissions"
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

    if (loading) {
        return <p>Loading submissions...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }
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
                    feedback
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to review submission"
            );
        }

        setSubmissions((currentSubmissions) =>
            currentSubmissions.map((submission) =>
                submission._id === selectedSubmission._id
                    ? data.submission
                    : submission
            )
        );

        setSelectedSubmission(null);
        setFeedback("");

    } catch (error) {
        setError(error.message);
    }
};

    return (
        <div>
            <h2>Submissions</h2>

            {submissions.length === 0 ? (
                <p>No submissions found.</p>
            ) : (
                <ul>
                    {selectedSubmission && (
    <div>
        <h3>
            Review: {selectedSubmission.task?.title}
        </h3>

        <div>
            <label>Feedback</label>

            <textarea
                value={feedback}
                onChange={(event) =>
                    setFeedback(event.target.value)
                }
                placeholder="Enter feedback for the intern"
            />
        </div>

        <button
            onClick={() => handleReview("approved")}
        >
            Approve
        </button>

        <button
            onClick={() =>
                handleReview("revision-required")
            }
        >
            Request Revision
        </button>

        <button
            onClick={() => {
                setSelectedSubmission(null);
                setFeedback("");
            }}
        >
            Cancel
        </button>
    </div>
)}
                    {submissions.map((submission) => (
                        <li key={submission._id}>
                            <strong>
                                {submission.task?.title}
                            </strong>

                            {" — "}
                            Intern: {submission.intern?.name}

                            {" — "}
                            Review: {submission.reviewStatus}

                            {submission.submissionUrl && (
                                <>
                                    {" — "}
                                    <a
                                        href={submission.submissionUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        View Work
                                    </a>
                                </>
                            )}

                            {submission.notes && (
                                <p>
                                    Notes: {submission.notes}
                                </p>
                            )}

                            {submission.feedback && (
                                <p>
                                    Feedback: {submission.feedback}
                                </p>
                            )}
                            {submission.reviewStatus === "pending"&&(
                                <button
                                    onClick={() =>{
                                        setSelectedSubmission(submission);
                                        setFeedback("");
                                    }}
                                >
                                    Review
                                </button>

                            )
                            }
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default SubmissionList;