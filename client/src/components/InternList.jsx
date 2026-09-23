import { useEffect, useState } from "react";
import API_URL from "../config/api";

function InternList() {
    const [interns, setInterns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingIntern, setEditingIntern] = useState(null);

    useEffect(() => {
        const fetchInterns = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    `${API_URL}/api/interns`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to fetch interns"
                    );
                }

                setInterns(data.interns);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInterns();
    }, []);

    if (loading) {
        return <p>Loading interns...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    const handleDelete = async (internId) => {
    const confirmed = window.confirm(
        "Are you sure you want to delete this intern? This action cannot be undone."
    );

    if (!confirmed) {
        return;
    }

    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            `${API_URL}/api/interns/${internId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to delete intern"
            );
        }

        // Refresh the intern list
        setInterns((currentInterns) =>
            currentInterns.filter(
                (intern) => intern._id !== internId
            )
        );

    } catch (error) {
        setError(error.message);
    }
};
const handleUpdate = async (event) => {
    event.preventDefault();

    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            `${API_URL}/api/interns/${editingIntern._id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: editingIntern.name,
                    email: editingIntern.email,
                    department: editingIntern.department
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to update intern"
            );
        }

        setInterns((currentInterns) =>
            currentInterns.map((intern) =>
                intern._id === editingIntern._id
                    ? data.intern
                    : intern
            )
        );

        setEditingIntern(null);

    } catch (error) {
        setError(error.message);
    }
};
return (
    <div>
        <h2>Interns</h2>

        {interns.length === 0 ? (
            <p>No interns found.</p>
        ) : (
            <ul>
                {interns.map((intern) => (
                    <li key={intern._id}>
                        <strong>{intern.name}</strong>
                        {" — "}
                        {intern.email}
                        {" — "}
                        {intern.department || "No department"}

                        {" "}

                        <button
                            onClick={() => setEditingIntern(intern)}
                        >
                            Edit
                        </button>

                        <button
                            onClick={() => handleDelete(intern._id)}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        )}

        {editingIntern && (
            <form onSubmit={handleUpdate}>
                <h3>Edit Intern</h3>

                <div>
                    <label>Name</label>
                    <input
                        type="text"
                        value={editingIntern.name}
                        onChange={(event) =>
                            setEditingIntern({
                                ...editingIntern,
                                name: event.target.value
                            })
                        }
                        required
                    />
                </div>

                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={editingIntern.email}
                        onChange={(event) =>
                            setEditingIntern({
                                ...editingIntern,
                                email: event.target.value
                            })
                        }
                        required
                    />
                </div>

                <div>
                    <label>Department</label>
                    <input
                        type="text"
                        value={editingIntern.department || ""}
                        onChange={(event) =>
                            setEditingIntern({
                                ...editingIntern,
                                department: event.target.value
                            })
                        }
                    />
                </div>

                <button type="submit">
                    Save Changes
                </button>

                <button
                    type="button"
                    onClick={() => setEditingIntern(null)}
                >
                    Cancel
                </button>
            </form>
        )}
    </div>
);
}

export default InternList;