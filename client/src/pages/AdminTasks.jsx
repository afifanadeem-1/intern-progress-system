import { useState } from "react";
import TaskList from "../components/TaskList";
import CreateTaskForm from "../components/CreateTaskForm";
import "./AdminTasks.css";

function AdminTasks() {
    const [refreshTasks, setRefreshTasks] = useState(0);
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const handleTaskCreated = () => {
    setRefreshTasks((previous) => previous + 1);
    setShowCreateTask(false);

    setSuccessMessage("Task created successfully");

    setTimeout(() => {
        setSuccessMessage("");
    }, 3000);
};

    return (
        <div>

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
            <div className="task-page-header">
                <div className="admin-content-heading">
                    <h2>Tasks</h2>

                    <p>
                        Create, assign and manage intern tasks.
                    </p>
                </div>

                <button
                    className="create-task-button"
                    onClick={() => setShowCreateTask(true)}
                >
                    + Create Task
                </button>
            </div>

            <TaskList refreshTasks={refreshTasks} />

            {showCreateTask && (
                <div className="modal-overlay">
                    <div className="task-form-modal">

                        <CreateTaskForm
                            onTaskCreated={handleTaskCreated}
                            onCancel={() =>
                                setShowCreateTask(false)
                            }
                        />

                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminTasks;