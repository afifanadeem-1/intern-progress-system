import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../config/api";
import "./Auth.css";

function RegisterPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        department: "",
        password: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (
            formData.password !==
            formData.confirmPassword
        ) {
            setError("Passwords do not match");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/api/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        department: formData.department,
                        password: formData.password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Registration failed"
                );
            }

            navigate("/login");

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            {/* LEFT SIDE */}

            <section className="auth-brand-panel">
                <div className="auth-brand-content">

                    <div className="auth-logo">
                        IF
                    </div>

                    <div className="auth-brand-name">
                        InternFlow
                    </div>

                    <h1>
                        Start your
                        <br />
                        internship journey.
                    </h1>

                    <p>
                        Create your intern account to receive
                        tasks, submit your work and monitor your
                        progress.
                    </p>

                    <div className="auth-features">

                        <div>
                            <span>✓</span>
                            View assigned tasks
                        </div>

                        <div>
                            <span>✓</span>
                            Receive admin feedback
                        </div>

                        <div>
                            <span>✓</span>
                            Monitor your progress
                        </div>

                    </div>

                </div>
            </section>


            {/* RIGHT SIDE */}

            <section className="auth-form-panel">

                <div className="auth-form-container register-container">

                    <div className="auth-mobile-brand">
                        <div className="auth-logo">
                            IF
                        </div>

                        <strong>InternFlow</strong>
                    </div>

                    <div className="auth-heading">
                        <span>INTERN REGISTRATION</span>

                        <h2>Create your account</h2>

                        <p>
                            Enter your details to join your
                            internship workspace.
                        </p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            <span>!</span>
                            <p>{error}</p>
                        </div>
                    )}

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="auth-field">
                            <label htmlFor="name">
                                Full name
                            </label>

                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your full name"
                                autoComplete="name"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="email">
                                Email address
                            </label>

                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="department">
                                Department
                            </label>

                            <input
                                id="department"
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                placeholder="e.g. Software Development"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="register-password">
                                Password
                            </label>

                            <div className="password-field">
                                <input
                                    id="register-password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>
                            </div>

                            <small className="password-hint">
                                At least 8 characters with uppercase,
                                lowercase and a number.
                            </small>
                        </div>

                        <div className="auth-field">
                            <label htmlFor="confirm-password">
                                Confirm password
                            </label>

                            <div className="password-field">
                                <input
                                    id="confirm-password"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="confirmPassword"
                                    value={
                                        formData.confirmPassword
                                    }
                                    onChange={handleChange}
                                    placeholder="Repeat your password"
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                >
                                    {showConfirmPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>
                            </div>
                        </div>

                        <button
                            className="auth-submit-button"
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating account..."
                                : "Create Account"}
                        </button>

                    </form>

                    <p className="auth-switch">
                        Already have an account?{" "}
                        <Link to="/login">
                            Sign in
                        </Link>
                    </p>

                </div>

            </section>

        </div>
    );
}

export default RegisterPage;