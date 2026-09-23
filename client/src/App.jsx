import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import InternDashboard from "./pages/InternDashboard";
import RegisterPage from "./pages/RegisterPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />
                <Route
                    path="/login"
                    element={<LoginPage />}
                />
                <Route
                    path="/admin"
                    element={
                    <ProtectedRoute allowedRole="admin">
                    <AdminDashboard />
                    </ProtectedRoute>}
                />
                <Route
                     path="/register"
                     element={<RegisterPage />}
                />
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