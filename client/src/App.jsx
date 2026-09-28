import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";


import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminInterns from "./pages/AdminInterns";
import AdminTasks from "./pages/AdminTasks";
import AdminSubmissions from "./pages/AdminSubmissions";
import InternDashboard from "./pages/InternDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public routes */}
                <Route
                    path="/"
                    element={
                        <Navigate to="/login" replace />
                    }
                />

                <Route
                    path="/login"
                    element={<LoginPage />}
                />

                <Route
                    path="/register"
                    element={<RegisterPage />}
                />


                {/* Admin routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRole="admin">
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route
                        index
                        element={<AdminDashboard />}
                    />

                    <Route
                        path="interns"
                        element={<AdminInterns />}
                    />

                    <Route
                        path="tasks"
                        element={<AdminTasks />}
                    />

                    <Route
                        path="submissions"
                        element={<AdminSubmissions />}
                    />
                </Route>


                {/* Intern routes */}
                <Route
                    path="/intern"
                    element={
                        <ProtectedRoute allowedRole="intern">
                            <InternDashboard />
                        </ProtectedRoute>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;