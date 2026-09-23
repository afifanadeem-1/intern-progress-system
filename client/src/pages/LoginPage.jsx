import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

   const handleSubmit = async (event) => {
    event.preventDefault();

    try {
        setLoading(true);
        setError("");
        
        console.log("Email being sent:", JSON.stringify(email));
        console.log("Password being sent:", JSON.stringify(password));
        const response = await fetch(
            "http://localhost:5000/api/auth/login",
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
            throw new Error(data.message || "Login failed");
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

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
        <div>
            <h1>Intern Progress Management System</h1>
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email</label>

                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password">Password</label>

                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />
                </div>
                {error && <p>{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading? "Logging in ..":"Login"}
                </button>
            </form>
        </div>
    );
}

export default LoginPage;