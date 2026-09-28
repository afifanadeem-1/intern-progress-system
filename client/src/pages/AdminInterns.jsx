import InternList from "../components/InternList";

function AdminInterns() {
    return (
        <div>
            <div className="admin-content-heading">
                <h2>Interns</h2>

                <p>
                    View and manage registered interns.
                </p>
            </div>

            <InternList />
        </div>
    );
}

export default AdminInterns;