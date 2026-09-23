import { useEffect, useState } from "react";
import API_URL from "../config/api";

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
        return <p>Loading progress...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!progress) {
        return <p>Progress information unavailable.</p>;
    }

    return (
        <div>
            <h2>My Progress</h2>

            <p>
                <strong>Total Tasks:</strong>{" "}
                {progress.totalTasks}
            </p>

            <p>
                <strong>Completed:</strong>{" "}
                {progress.completedTasks}
            </p>

            <p>
                <strong>In Progress:</strong>{" "}
                {progress.inProgressTasks}
            </p>

            <p>
                <strong>Pending:</strong>{" "}
                {progress.pendingTasks}
            </p>

            <p>
                <strong>Submitted:</strong>{" "}
                {progress.submittedTasks}
            </p>

            <p>
                <strong>Overall Progress:</strong>{" "}
                {progress.progressPercentage}%
            </p>
        </div>
    );
}

export default MyProgress;