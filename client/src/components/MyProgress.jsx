import { useEffect, useState } from "react";
import API_URL from "../config/api";
import "./MyProgress.css";

function MyProgress() {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    `${API_URL}/api/interns/me/progress`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to fetch progress"
                    );
                }

                setProgress(data.progress);

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProgress();
    }, []);

    if (loading) {
        return (
            <div className="progress-state">
                Loading progress...
            </div>
        );
    }

    if (error) {
        return (
            <div className="progress-state progress-error">
                {error}
            </div>
        );
    }

    if (!progress) {
        return (
            <div className="progress-state">
                Progress information unavailable.
            </div>
        );
    }

    const percentage = Math.min(
        100,
        Math.max(0, progress.progressPercentage || 0)
    );

    return (
        <div className="progress-card">

            <div className="progress-overview">

                <div
    className="progress-wheel"
    style={{
        "--progress": `${percentage * 3.6}deg`
    }}
>
                    <div className="progress-wheel-inner">
                        <strong>{percentage}%</strong>
                        <span>Completed</span>
                    </div>
                </div>

                <div className="progress-summary">
                    <span className="progress-summary-label">
                        OVERALL PROGRESS
                    </span>

                    <h4>
                        {progress.completedTasks} of{" "}
                        {progress.totalTasks} tasks completed
                    </h4>

                    <p>
                        Keep working through your assigned tasks.
                        Your progress updates as tasks are completed.
                    </p>
                </div>

            </div>

            <div className="progress-divider" />

            <div className="progress-stats">

                <div className="progress-stat">
                    <div className="stat-icon stat-total">
                        T
                    </div>

                    <div>
                        <span>Total Tasks</span>
                        <strong>{progress.totalTasks}</strong>
                    </div>
                </div>

                <div className="progress-stat">
                    <div className="stat-icon stat-completed">
                        ✓
                    </div>

                    <div>
                        <span>Completed</span>
                        <strong>{progress.completedTasks}</strong>
                    </div>
                </div>

                <div className="progress-stat">
                    <div className="stat-icon stat-progress">
                        ↗
                    </div>

                    <div>
                        <span>In Progress</span>
                        <strong>{progress.inProgressTasks}</strong>
                    </div>
                </div>

                <div className="progress-stat">
                    <div className="stat-icon stat-submitted">
                        ↑
                    </div>

                    <div>
                        <span>Submitted</span>
                        <strong>{progress.submittedTasks}</strong>
                    </div>
                </div>

                <div className="progress-stat">
                    <div className="stat-icon stat-pending">
                        ○
                    </div>

                    <div>
                        <span>Pending</span>
                        <strong>{progress.pendingTasks}</strong>
                    </div>
                </div>

            </div>

        </div>
    );
}

export default MyProgress;