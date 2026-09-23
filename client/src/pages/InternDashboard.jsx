import { useNavigate } from "react-router-dom";
import MyTaskList from "../components/MyTaskList";
import MyProgress from "../components/MyProgress";

function InternDashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

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

            <main>
                <h2>Intern Dashboard</h2>

                <p>
                    View your tasks, submit work and track your progress.
                </p>

                <MyProgress/>
                <MyTaskList />
            </main>
        </div>
    );
}

export default InternDashboard;