import { useNavigate } from "react-router-dom";
import MyTaskList from "../components/MyTaskList";
import MyProgress from "../components/MyProgress";
import "./InternDashboard.css";

function InternDashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <div className="intern-dashboard">

            {/* TOP NAVIGATION */}
            <header className="intern-header">
                <div className="intern-header-content">

                    <div className="intern-brand">
                        <div className="intern-brand-icon">
                            IF
                        </div>

                        <div>
                            <h1>InternFlow</h1>
                            <span>Intern Portal</span>
                        </div>
                    </div>

                    <div className="intern-user-area">
                        <div className="intern-user-info">
                            <div className="intern-avatar">
                                {user?.name
                                    ?.charAt(0)
                                    .toUpperCase() || "I"}
                            </div>

                            <div>
                                <strong>
                                    {user?.name || "Intern"}
                                </strong>
                                <span>Intern</span>
                            </div>
                        </div>

                        <button
                            className="intern-logout-button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>

                </div>
            </header>

            {/* MAIN DASHBOARD */}
            <main className="intern-main">

                <section className="intern-welcome">
                    <div>
                        <p className="intern-welcome-label">
                            INTERN DASHBOARD
                        </p>

                        <h2>
                            Welcome back, {user?.name || "Intern"}
                        </h2>

                        <p>
                            View your assigned tasks, submit your
                            work and track your overall progress.
                        </p>
                    </div>
                </section>

                <section className="intern-dashboard-section">
                    <div className="intern-section-heading">
                        <div>
                            <h3>Your Progress</h3>
                            <p>
                                Track your current internship
                                performance.
                            </p>
                        </div>
                    </div>

                    <MyProgress />
                </section>

                <section className="intern-dashboard-section">
                    <div className="intern-section-heading">
                        <div>
                            <h3>My Tasks</h3>
                            <p>
                                Manage your assigned work and
                                submissions.
                            </p>
                        </div>
                    </div>

                    <MyTaskList />
                </section>

            </main>

        </div>
    );
}

export default InternDashboard;