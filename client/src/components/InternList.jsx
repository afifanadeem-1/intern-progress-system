import { useEffect, useState } from "react";
import API_URL from "../config/api";
import "./InternList.css";

function InternList() {
    const [interns, setInterns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Stores the intern currently being edited
    const [editingIntern, setEditingIntern] = useState(null);

    // Stores the intern currently selected for deletion
    const [deletingIntern, setDeletingIntern] = useState(null);
    const [originalIntern, setOriginalIntern] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");




    // ================================
    // FETCH INTERNS
    // ================================

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


    // ================================
    // DELETE INTERN
    // ================================

    const handleDelete = async (internId) => {
    try {
        // Clear any previous error
        setError("");

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

        // If backend rejected deletion, stop here
        if (!response.ok) {
            throw new Error(
                data.message || "Failed to delete intern"
            );
        }

        // Backend confirmed deletion
        setInterns((currentInterns) =>
            currentInterns.filter(
                (intern) => intern._id !== internId
            )
        );

        // Close delete dialog
        setDeletingIntern(null);

        // Show success toast
        setSuccessMessage("Intern deleted successfully");

        setTimeout(() => {
            setSuccessMessage("");
        }, 3000);

    } catch (error) {
        // Close dialog
        setDeletingIntern(null);

        // Show backend error
        setError(error.message);
    }
};


    // ================================
    // UPDATE INTERN
    // ================================

    const handleUpdate = async (event) => {
        event.preventDefault();
        if (!hasChanges) {
    return;
}

        try {
            setError("");

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

            // Close edit dialog
            setEditingIntern(null);
            setSuccessMessage("Changes saved successfully");

setTimeout(() => {
    setSuccessMessage("");
}, 3000);

        } catch (error) {
            setError(error.message);
        }
    };


    // ================================
    // LOADING
    // ================================

    if (loading) {
        return <p>Loading interns...</p>;
    }


    // ================================
    // UI
    // ================================
const hasChanges =
    editingIntern &&
    originalIntern &&
    (
        editingIntern.name !== originalIntern.name ||
        editingIntern.email !== originalIntern.email ||
        editingIntern.department !== originalIntern.department
    );

    return (
        <div className="intern-section">
            {successMessage && (
    <div className="success-toast">
        <span className="success-toast-icon">✓</span>

        <div>
            <strong>Success</strong>
            <p>{successMessage}</p>
        </div>
    </div>
)}
            {error && (
    <div className="error-toast">
        <span className="error-toast-icon">!</span>

        <div>
            <strong>Action failed</strong>
            <p>{error}</p>
        </div>

        <button
            className="toast-close"
            onClick={() => setError("")}
        >
            ×
        </button>
    </div>
)}


            {/* Intern Table */}
            {interns.length === 0 ? (
                <div className="empty-state">
                    No interns found.
                </div>
            ) : (
                <div className="intern-table-container">

                    <table className="intern-table">

                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {interns.map((intern) => (
                                <tr key={intern._id}>

                                    <td className="intern-name">
                                        {intern.name}
                                    </td>

                                    <td className="intern-email">
                                        {intern.email}
                                    </td>

                                    <td>
                                        {intern.department || "—"}
                                    </td>

                                    <td>
                                        <div className="intern-actions">

                                            {/* Open Edit Dialog */}
                                            <button
                                                className="edit-button"
                                                onClick={() => {
                                                    setEditingIntern({ ...intern });
                                                    setOriginalIntern({ ...intern });
                                            }}
                                            >
                                                Edit
                                            </button>


                                            {/* Open Delete Dialog */}
                                            <button
                                                className="delete-button"
                                                onClick={() =>
                                                    setDeletingIntern(intern)
                                                }
                                            >
                                                Delete
                                            </button>

                                        </div>
                                    </td>

                                </tr>
                            ))}
                        </tbody>

                    </table>

                </div>
            )}


            {/* ================================
                EDIT INTERN DIALOG
            ================================= */}

            {editingIntern && (
                <div className="modal-overlay">

                    <div className="edit-modal">

                        <div className="modal-header">

                            <div>
                                <h3>Edit Intern</h3>

                                <p>
                                    Update the intern's information.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={() =>
                                    setEditingIntern(null)
                                }
                            >
                                ×
                            </button>

                        </div>


                        <form onSubmit={handleUpdate}>

                            <div className="form-group">
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


                            <div className="form-group">
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


                            <div className="form-group">
                                <label>Department</label>

                                <input
                                    type="text"
                                    value={
                                        editingIntern.department || ""
                                    }
                                    onChange={(event) =>
                                        setEditingIntern({
                                            ...editingIntern,
                                            department: event.target.value
                                        })
                                    }
                                />
                            </div>


                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() =>
                                        setEditingIntern(null)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
    type="submit"
    className="save-button"
    disabled={!hasChanges}
>
    Save Changes
</button>

                            </div>

                        </form>

                    </div>

                </div>
            )}


            {/* ================================
                DELETE CONFIRMATION DIALOG
            ================================= */}

            {deletingIntern && (
                <div className="modal-overlay">

                    <div className="delete-modal">

                        <div className="delete-modal-icon">
                            !
                        </div>

                        <h3>
                            Delete Intern?
                        </h3>

                        <p>
                            Are you sure you want to delete{" "}
                            <strong>
                                {deletingIntern.name}
                            </strong>
                            ? This action cannot be undone.
                        </p>


                        <div className="modal-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() =>
                                    setDeletingIntern(null)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="confirm-delete-button"
                                onClick={() =>
                                    handleDelete(
                                        deletingIntern._id
                                    )
                                }
                            >
                                Delete Intern
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default InternList;