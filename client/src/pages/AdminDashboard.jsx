import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InternList from "../components/InternList";
import TaskList from "../components/TaskList";
import CreateTaskForm from "../components/CreateTaskForm";
import SubmissionList from "../components/SubmissionList";

function AdminDashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    //const [refreshInterns, setRefreshInterns] = useState(0);
    const [refreshTasks, setRefreshTasks] = useState(0);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <div>
            <header>
                <h1>Intern Progress Management System</h1>

                <div>
                    <span>Welcome, {user?.name}</span>

                    <button onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            <nav>
                <button>Dashboard</button>
                <button>Interns</button>
                <button>Tasks</button>
                <button>Submissions</button>
            </nav>

            <main>
                <h2>Admin Dashboard</h2>

                <p>
                    Manage interns, tasks, submissions and progress.
                </p>

                <InternList />

                <TaskList refreshTasks={refreshTasks} />

                <CreateTaskForm
                    onTaskCreated={() =>
                     setRefreshTasks((previous) => previous + 1)
                    }
                />
                <SubmissionList />
            </main>
        </div>
    );
}

export default AdminDashboard;