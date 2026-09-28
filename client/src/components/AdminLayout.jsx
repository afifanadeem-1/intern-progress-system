import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./AdminLayout.css";

function AdminLayout() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <div className="admin-layout">

            <aside className="admin-sidebar">
                <div className="sidebar-brand">
                    InternFlow
                </div>

                <nav className="sidebar-nav">
                    <NavLink
                        to="/admin"
                        end
                        className={({ isActive }) =>
                            isActive ? "active" : ""
                        }
                    >
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/admin/interns"
                        className={({ isActive }) =>
                            isActive ? "active" : ""
                        }
                    >
                        Interns
                    </NavLink>

                    <NavLink
                        to="/admin/tasks"
                        className={({ isActive }) =>
                            isActive ? "active" : ""
                        }
                    >
                        Tasks
                    </NavLink>

                    <NavLink
                        to="/admin/submissions"
                        className={({ isActive }) =>
                            isActive ? "active" : ""
                        }
                    >
                        Submissions
                    </NavLink>
                </nav>

                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </aside>

            <div className="admin-main">

                <header className="admin-header">
                    <h1>
                        Intern Progress Management System
                    </h1>

                    <div className="admin-user">
                        <span className="admin-user-name">
                            {user?.name}
                        </span>

                        <span className="admin-user-role">
                            Administrator
                        </span>
                    </div>
                </header>

                <main className="admin-content">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default AdminLayout;