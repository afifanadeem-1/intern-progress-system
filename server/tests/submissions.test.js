const request = require("supertest");
const app = require("../src/app");

const User = require("../src/models/User");
const Task = require("../src/models/Task");
const Submission = require("../src/models/Submission");

describe("Submission Review API", () => {
    test("Admin should approve a pending submission", async () => {
        const adminEmail = "review-admin-jest@example.com";
        const internEmail = "review-intern-jest@example.com";

        let admin;
        let intern;
        let task;
        let submission;

        try {
            await User.deleteMany({
                email: { $in: [adminEmail, internEmail] }
            });

            admin = await User.create({
                name: "Review Test Admin",
                email: adminEmail,
                password: "Password1",
                role: "admin"
            });

            intern = await User.create({
                name: "Review Test Intern",
                email: internEmail,
                password: "Password1",
                role: "intern"
            });

            task = await Task.create({
                title: "Review Workflow Test",
                description: "Test admin approval",
                assignedTo: intern._id,
                assignedBy: admin._id,
                deadline: new Date("2026-12-31"),
                priority: "high",
                status: "submitted"
            });

            submission = await Submission.create({
                task: task._id,
                intern: intern._id,
                submissionUrl: "https://github.com/example/review-test",
                notes: "Ready for review",
                reviewStatus: "pending"
            });

            // Login as admin
            const loginResponse = await request(app)
                .post("/api/auth/login")
                .send({
                    email: adminEmail,
                    password: "Password1"
                });

            expect(loginResponse.statusCode).toBe(200);

            const token = loginResponse.body.token;

            // Approve the submission
            const response = await request(app)
                .patch(`/api/submissions/${submission._id}/review`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    reviewStatus: "approved",
                    feedback: "Excellent work."
                });

            expect(response.statusCode).toBe(200);

            // Check submission in MongoDB
            const updatedSubmission = await Submission.findById(
                submission._id
            );

            expect(updatedSubmission.reviewStatus).toBe("approved");
            expect(updatedSubmission.feedback).toBe("Excellent work.");

            expect(
                updatedSubmission.reviewedBy.toString()
            ).toBe(admin._id.toString());

            // Check related task in MongoDB
            const updatedTask = await Task.findById(task._id);

            expect(updatedTask.status).toBe("completed");

        } finally {
            if (submission) {
                await Submission.deleteOne({
                    _id: submission._id
                });
            }

            if (task) {
                await Task.deleteOne({
                    _id: task._id
                });
            }

            await User.deleteMany({
                email: { $in: [adminEmail, internEmail] }
            });
        }
    });
    test("Admin should request revision for a pending submission", async () => {
    const adminEmail = "revision-admin-jest@example.com";
    const internEmail = "revision-intern-jest@example.com";

    let admin;
    let intern;
    let task;
    let submission;

    try {
        await User.deleteMany({
            email: { $in: [adminEmail, internEmail] }
        });

        admin = await User.create({
            name: "Revision Test Admin",
            email: adminEmail,
            password: "Password1",
            role: "admin"
        });

        intern = await User.create({
            name: "Revision Test Intern",
            email: internEmail,
            password: "Password1",
            role: "intern"
        });

        task = await Task.create({
            title: "Revision Workflow Test",
            description: "Test revision request workflow",
            assignedTo: intern._id,
            assignedBy: admin._id,
            deadline: new Date("2026-12-31"),
            priority: "medium",
            status: "submitted"
        });

        submission = await Submission.create({
            task: task._id,
            intern: intern._id,
            submissionUrl: "https://github.com/example/revision-test",
            notes: "First attempt",
            reviewStatus: "pending"
        });

        // Login as admin
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: adminEmail,
                password: "Password1"
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.token;

        // Request revision
        const response = await request(app)
            .patch(`/api/submissions/${submission._id}/review`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                reviewStatus: "revision-required",
                feedback: "Please improve the documentation."
            });

        expect(response.statusCode).toBe(200);

        // Verify submission
        const updatedSubmission = await Submission.findById(
            submission._id
        );

        expect(updatedSubmission.reviewStatus).toBe(
            "revision-required"
        );

        expect(updatedSubmission.feedback).toBe(
            "Please improve the documentation."
        );

        expect(
            updatedSubmission.reviewedBy.toString()
        ).toBe(admin._id.toString());

        // Verify task returned to in-progress
        const updatedTask = await Task.findById(task._id);

        expect(updatedTask.status).toBe("in-progress");

    } finally {
        if (submission) {
            await Submission.deleteOne({
                _id: submission._id
            });
        }

        if (task) {
            await Task.deleteOne({
                _id: task._id
            });
        }

        await User.deleteMany({
            email: { $in: [adminEmail, internEmail] }
        });
    }
});
});