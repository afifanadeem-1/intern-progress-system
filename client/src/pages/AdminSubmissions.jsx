import SubmissionList from "../components/SubmissionList";

function AdminSubmissions() {
    return (
        <div>
            <div className="admin-content-heading">
                <h2>Submissions</h2>

                <p>
                    Review intern work and provide feedback.
                </p>
            </div>

            <SubmissionList />
        </div>
    );
}

export default AdminSubmissions;