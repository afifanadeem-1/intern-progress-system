import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../config/api";
import "./Auth.css";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Login failed"
                );
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            if (data.user.role === "admin") {
                navigate("/admin");
            } else if (data.user.role === "intern") {
                navigate("/intern");
            }

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
                        Track progress.
                        <br />
                        Build momentum.
                    </h1>

                    <p>
                        A simple workspace for interns and
                        administrators to manage tasks,
                        submissions and progress.
                    </p>

                    <div className="auth-features">

                        <div>
                            <span>✓</span>
                            Manage assigned tasks
                        </div>

                        <div>
                            <span>✓</span>
                            Submit and review work
                        </div>

                        <div>
                            <span>✓</span>
                            Track internship progress
                        </div>

                    </div>

                </div>
            </section>


            {/* RIGHT SIDE */}

            <section className="auth-form-panel">

                <div className="auth-form-container">

                    <div className="auth-mobile-brand">
                        <div className="auth-logo">
                            IF
                        </div>

                        <strong>InternFlow</strong>
                    </div>

                    <div className="auth-heading">
                        <span>WELCOME BACK</span>

                        <h2>Sign in to your account</h2>

                        <p>
                            Enter your credentials to continue
                            to InternFlow.
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
                            <label htmlFor="email">
                                Email address
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="password-field">
                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
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
                        </div>

                        <button
                            className="auth-submit-button"
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign In"}
                        </button>

                    </form>

                    <p className="auth-switch">
                        Don't have an account?{" "}
                        <Link to="/register">
                            Create an account
                        </Link>
                    </p>

                </div>

            </section>

        </div>
    );
}

export default LoginPage;