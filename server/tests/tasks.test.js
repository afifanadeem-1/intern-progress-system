
const request = require("supertest");
const app = require("../src/app");

const User = require("../src/models/User");
const Task = require("../src/models/Task");
const Submission = require("../src/models/Submission");

describe("Task Management API", () => {
    test("Admin should create a task for an intern", async () => {
        const adminEmail = "task-admin-jest@example.com";
        const internEmail = "task-intern-jest@example.com";

        let admin;
        let intern;
        let taskId;

        try {
            // Prepare test users
            await User.deleteMany({
                email: { $in: [adminEmail, internEmail] }
            });

            admin = await User.create({
                name: "Task Test Admin",
                email: adminEmail,
                password: "Password1",
                role: "admin"
            });

            intern = await User.create({
                name: "Task Test Intern",
                email: internEmail,
                password: "Password1",
                role: "intern"
            });

            // Obtain an admin JWT
            const loginResponse = await request(app)
                .post("/api/auth/login")
                .send({
                    email: adminEmail,
                    password: "Password1"
                });

            expect(loginResponse.statusCode).toBe(200);

            const token = loginResponse.body.token;

            // Create a task
            const response = await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Build Login Page",
                    description: "Create the login interface",
                    assignedTo: intern._id.toString(),
                    deadline: "2026-12-31",
                    priority: "high"
                });

            expect(response.statusCode).toBe(201);
            expect(response.body.task.title).toBe(
                "Build Login Page"
            );

            expect(
                response.body.task.assignedTo.toString()
            ).toBe(intern._id.toString());

            taskId = response.body.task._id;

            // Confirm task was saved in MongoDB
            const savedTask = await Task.findById(taskId);

            expect(savedTask).not.toBeNull();
            expect(savedTask.status).toBe("pending");
        } finally {
            // Cleanup even if an assertion fails
            if (admin && intern) {
                await Task.deleteMany({
                    assignedBy: admin._id,
                    assignedTo: intern._id
                });
            }

            await User.deleteMany({
                email: { $in: [adminEmail, internEmail] }
            });
        }
    });
    test("Intern should only see tasks assigned to them", async () => {
    const intern1Email = "intern1-jest@example.com";
    const intern2Email = "intern2-jest@example.com";
    const adminEmail = "task-list-admin-jest@example.com";

    let admin;
    let intern1;
    let intern2;

    try {
        await User.deleteMany({
            email: {
                $in: [adminEmail, intern1Email, intern2Email]
            }
        });

        admin = await User.create({
            name: "Task List Admin",
            email: adminEmail,
            password: "Password1",
            role: "admin"
        });

        intern1 = await User.create({
            name: "Intern One",
            email: intern1Email,
            password: "Password1",
            role: "intern"
        });

        intern2 = await User.create({
            name: "Intern Two",
            email: intern2Email,
            password: "Password1",
            role: "intern"
        });

        // One task for Intern 1
        await Task.create({
            title: "Intern One Task",
            description: "This belongs to Intern One",
            assignedTo: intern1._id,
            assignedBy: admin._id,
            deadline: new Date("2026-12-31"),
            priority: "medium"
        });

        // Another task for Intern 2
        await Task.create({
            title: "Intern Two Task",
            description: "This belongs to Intern Two",
            assignedTo: intern2._id,
            assignedBy: admin._id,
            deadline: new Date("2026-12-31"),
            priority: "medium"
        });

        // Login specifically as Intern 1
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: intern1Email,
                password: "Password1"
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.token;

        const response = await request(app)
            .get("/api/tasks/my-tasks")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.tasks).toHaveLength(1);

        expect(response.body.tasks[0].title).toBe(
            "Intern One Task"
        );

        expect(
            response.body.tasks[0].assignedTo.toString()
        ).toBe(intern1._id.toString());
    } finally {
        if (intern1 && intern2) {
            await Task.deleteMany({
                assignedTo: {
                    $in: [intern1._id, intern2._id]
                }
            });
        }

        await User.deleteMany({
            email: {
                $in: [adminEmail, intern1Email, intern2Email]
            }
        });
    }
});
test("Intern should be able to start their assigned pending task", async () => {
    const adminEmail = "start-admin-jest@example.com";
    const internEmail = "start-intern-jest@example.com";

    let admin;
    let intern;
    let task;

    try {
        await User.deleteMany({
            email: { $in: [adminEmail, internEmail] }
        });

        admin = await User.create({
            name: "Start Test Admin",
            email: adminEmail,
            password: "Password1",
            role: "admin"
        });

        intern = await User.create({
            name: "Start Test Intern",
            email: internEmail,
            password: "Password1",
            role: "intern"
        });

        // Create a pending task assigned to this intern
        task = await Task.create({
            title: "Start Workflow Test",
            description: "Test starting an assigned task",
            assignedTo: intern._id,
            assignedBy: admin._id,
            deadline: new Date("2026-12-31"),
            priority: "medium"
        });

        expect(task.status).toBe("pending");

        // Login as the intern
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: internEmail,
                password: "Password1"
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.token;

        // Start the task
        const response = await request(app)
            .patch(`/api/tasks/${task._id}/start`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.task.status).toBe("in-progress");

        // Verify the change was actually saved in MongoDB
        const updatedTask = await Task.findById(task._id);

        expect(updatedTask.status).toBe("in-progress");

    } finally {
        if (task) {
            await Task.deleteOne({ _id: task._id });
        }

        await User.deleteMany({
            email: { $in: [adminEmail, internEmail] }
        });
    }
});
test("Intern should not be able to start another intern's task", async () => {
    const adminEmail = "ownership-admin-jest@example.com";
    const intern1Email = "ownership-intern1-jest@example.com";
    const intern2Email = "ownership-intern2-jest@example.com";

    let admin;
    let intern1;
    let intern2;
    let task;

    try {
        await User.deleteMany({
            email: {
                $in: [adminEmail, intern1Email, intern2Email]
            }
        });

        admin = await User.create({
            name: "Ownership Test Admin",
            email: adminEmail,
            password: "Password1",
            role: "admin"
        });

        intern1 = await User.create({
            name: "Intern One",
            email: intern1Email,
            password: "Password1",
            role: "intern"
        });

        intern2 = await User.create({
            name: "Intern Two",
            email: intern2Email,
            password: "Password1",
            role: "intern"
        });

        // This task belongs to Intern 2
        task = await Task.create({
            title: "Intern Two Private Task",
            description: "Intern One must not be able to start this",
            assignedTo: intern2._id,
            assignedBy: admin._id,
            deadline: new Date("2026-12-31"),
            priority: "medium"
        });

        // Login as Intern 1
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: intern1Email,
                password: "Password1"
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.token;

        // Intern 1 tries to start Intern 2's task
        const response = await request(app)
            .patch(`/api/tasks/${task._id}/start`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(404);

        // Verify the unauthorized request did NOT change the database
        const unchangedTask = await Task.findById(task._id);

        expect(unchangedTask.status).toBe("pending");

    } finally {
        if (task) {
            await Task.deleteOne({ _id: task._id });
        }

        await User.deleteMany({
            email: {
                $in: [adminEmail, intern1Email, intern2Email]
            }
        });
    }
});
test("Intern should be able to submit an in-progress task", async () => {
    const adminEmail = "submit-admin-jest@example.com";
    const internEmail = "submit-intern-jest@example.com";

    let admin;
    let intern;
    let task;

    try {
        await User.deleteMany({
            email: { $in: [adminEmail, internEmail] }
        });

        admin = await User.create({
            name: "Submission Test Admin",
            email: adminEmail,
            password: "Password1",
            role: "admin"
        });

        intern = await User.create({
            name: "Submission Test Intern",
            email: internEmail,
            password: "Password1",
            role: "intern"
        });

        // The task must already be in-progress
        task = await Task.create({
            title: "Submission Workflow Test",
            description: "Test submitting an in-progress task",
            assignedTo: intern._id,
            assignedBy: admin._id,
            deadline: new Date("2026-12-31"),
            priority: "high",
            status: "in-progress"
        });

        // Login as the intern
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: internEmail,
                password: "Password1"
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.token;

        // Submit the task
        const response = await request(app)
            .post(`/api/tasks/${task._id}/submit`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                submissionUrl: "https://github.com/example/project",
                notes: "Task completed and ready for review."
            });

        expect(response.statusCode).toBe(201);

        // Check that a submission was actually created
        const submission = await Submission.findOne({
            task: task._id,
            intern: intern._id
        });

        expect(submission).not.toBeNull();
        expect(submission.submissionUrl).toBe(
            "https://github.com/example/project"
        );
        expect(submission.reviewStatus).toBe("pending");

        // Check that task status changed in MongoDB
        const updatedTask = await Task.findById(task._id);

        expect(updatedTask.status).toBe("submitted");

    } finally {
        if (task) {
            await Submission.deleteMany({ task: task._id });
            await Task.deleteOne({ _id: task._id });
        }

        await User.deleteMany({
            email: { $in: [adminEmail, internEmail] }
        });
    }
});
test("Intern should not be able to submit a pending task", async () => {
    const adminEmail = "pending-submit-admin-jest@example.com";
    const internEmail = "pending-submit-intern-jest@example.com";

    let admin;
    let intern;
    let task;

    try {
        await User.deleteMany({
            email: { $in: [adminEmail, internEmail] }
        });

        admin = await User.create({
            name: "Pending Submit Admin",
            email: adminEmail,
            password: "Password1",
            role: "admin"
        });

        intern = await User.create({
            name: "Pending Submit Intern",
            email: internEmail,
            password: "Password1",
            role: "intern"
        });

        // Notice: status is left as the default "pending"
        task = await Task.create({
            title: "Pending Submission Test",
            description: "This task has not been started yet",
            assignedTo: intern._id,
            assignedBy: admin._id,
            deadline: new Date("2026-12-31"),
            priority: "medium"
        });

        expect(task.status).toBe("pending");

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: internEmail,
                password: "Password1"
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.token;

        // Try submitting without starting first
        const response = await request(app)
            .post(`/api/tasks/${task._id}/submit`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                submissionUrl: "https://github.com/example/project",
                notes: "Trying to submit without starting."
            });

        expect(response.statusCode).toBe(400);

        // No submission should have been created
        const submission = await Submission.findOne({
            task: task._id
        });

        expect(submission).toBeNull();

        // Task should still be pending
        const unchangedTask = await Task.findById(task._id);

        expect(unchangedTask.status).toBe("pending");

    } finally {
        if (task) {
            await Submission.deleteMany({ task: task._id });
            await Task.deleteOne({ _id: task._id });
        }

        await User.deleteMany({
            email: { $in: [adminEmail, internEmail] }
        });
    }
});
test("Intern should resubmit a revision-required submission", async () => {
    const adminEmail = "resubmit-admin-jest@example.com";
    const internEmail = "resubmit-intern-jest@example.com";

    let admin;
    let intern;
    let task;
    let submission;

    try {
        await User.deleteMany({
            email: { $in: [adminEmail, internEmail] }
        });

        admin = await User.create({
            name: "Resubmit Test Admin",
            email: adminEmail,
            password: "Password1",
            role: "admin"
        });

        intern = await User.create({
            name: "Resubmit Test Intern",
            email: internEmail,
            password: "Password1",
            role: "intern"
        });

        // After revision is requested, the task is in-progress
        task = await Task.create({
            title: "Resubmission Workflow Test",
            description: "Test intern resubmission",
            assignedTo: intern._id,
            assignedBy: admin._id,
            deadline: new Date("2026-12-31"),
            priority: "high",
            status: "in-progress"
        });

        // Existing submission that the admin sent back
        submission = await Submission.create({
            task: task._id,
            intern: intern._id,
            submissionUrl: "https://github.com/example/old-version",
            notes: "Original submission",
            feedback: "Please fix the documentation.",
            reviewedBy: admin._id,
            reviewStatus: "revision-required"
        });

        const originalSubmissionId = submission._id.toString();

        // Login as intern
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: internEmail,
                password: "Password1"
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.token;

        // Resubmit improved work
        const response = await request(app)
            .post(`/api/tasks/${task._id}/submit`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                submissionUrl: "https://github.com/example/improved-version",
                notes: "Documentation has been updated."
            });

        expect(response.statusCode).toBe(200);

        // There should still be only ONE submission for this task
        const submissions = await Submission.find({
            task: task._id,
            intern: intern._id
        });

        expect(submissions).toHaveLength(1);

        const updatedSubmission = submissions[0];

        // Same document — not a new submission
        expect(updatedSubmission._id.toString()).toBe(
            originalSubmissionId
        );

        // New work should replace the old submission data
        expect(updatedSubmission.submissionUrl).toBe(
            "https://github.com/example/improved-version"
        );

        expect(updatedSubmission.notes).toBe(
            "Documentation has been updated."
        );

        // It is waiting for admin review again
        expect(updatedSubmission.reviewStatus).toBe("pending");

        // Old review information should be cleared
        expect(updatedSubmission.feedback).toBe("");

        expect(updatedSubmission.reviewedBy).toBeUndefined();

        // Task should be submitted again
        const updatedTask = await Task.findById(task._id);

        expect(updatedTask.status).toBe("submitted");

    } finally {
        if (task) {
            await Submission.deleteMany({ task: task._id });
            await Task.deleteOne({ _id: task._id });
        }

        await User.deleteMany({
            email: { $in: [adminEmail, internEmail] }
        });
    }
});
test("Admin should not delete an intern who has assigned tasks", async () => {
    const adminEmail = "delete-admin-jest@example.com";
    const internEmail = "delete-protected-intern-jest@example.com";

    let admin;
    let intern;
    let task;

    try {
        await User.deleteMany({
            email: { $in: [adminEmail, internEmail] }
        });

        admin = await User.create({
            name: "Delete Test Admin",
            email: adminEmail,
            password: "Password1",
            role: "admin"
        });

        intern = await User.create({
            name: "Protected Intern",
            email: internEmail,
            password: "Password1",
            role: "intern"
        });

        task = await Task.create({
            title: "Protected Intern Task",
            description: "This task prevents intern deletion",
            assignedTo: intern._id,
            assignedBy: admin._id,
            deadline: new Date("2026-12-31"),
            priority: "medium"
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

        // Try deleting the intern
        const response = await request(app)
            .delete(`/api/interns/${intern._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(409);

        // Most important: intern must still exist
        const existingIntern = await User.findById(intern._id);

        expect(existingIntern).not.toBeNull();

        // Their task must still exist too
        const existingTask = await Task.findById(task._id);

        expect(existingTask).not.toBeNull();

    } finally {
        if (task) {
            await Task.deleteOne({ _id: task._id });
        }

        await User.deleteMany({
            email: { $in: [adminEmail, internEmail] }
        });
    }
});
test("Admin should not delete a task that has a submission", async () => {
    const adminEmail = "task-delete-admin-jest@example.com";
    const internEmail = "task-delete-intern-jest@example.com";

    let admin;
    let intern;
    let task;
    let submission;

    try {
        await User.deleteMany({
            email: { $in: [adminEmail, internEmail] }
        });

        admin = await User.create({
            name: "Task Delete Admin",
            email: adminEmail,
            password: "Password1",
            role: "admin"
        });

        intern = await User.create({
            name: "Task Delete Intern",
            email: internEmail,
            password: "Password1",
            role: "intern"
        });

        task = await Task.create({
            title: "Protected Task",
            description: "This task has a submission",
            assignedTo: intern._id,
            assignedBy: admin._id,
            deadline: new Date("2026-12-31"),
            priority: "medium",
            status: "submitted"
        });

        submission = await Submission.create({
            task: task._id,
            intern: intern._id,
            submissionUrl: "https://github.com/example/protected-task",
            notes: "Submitted work",
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

        // Try deleting a task that already has a submission
        const response = await request(app)
            .delete(`/api/tasks/${task._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(409);

        // Task must still exist
        const existingTask = await Task.findById(task._id);

        expect(existingTask).not.toBeNull();

        // Submission must still exist
        const existingSubmission = await Submission.findById(
            submission._id
        );

        expect(existingSubmission).not.toBeNull();

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