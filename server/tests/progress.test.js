const request = require("supertest");
const app = require("../src/app");

const User = require("../src/models/User");
const Task = require("../src/models/Task");

describe("Progress API", () => {
    test("Intern should see correctly calculated progress", async () => {
        const adminEmail = "progress-admin-jest@example.com";
        const internEmail = "progress-intern-jest@example.com";

        let admin;
        let intern;

        try {
            await User.deleteMany({
                email: { $in: [adminEmail, internEmail] }
            });

            admin = await User.create({
                name: "Progress Test Admin",
                email: adminEmail,
                password: "Password1",
                role: "admin"
            });

            intern = await User.create({
                name: "Progress Test Intern",
                email: internEmail,
                password: "Password1",
                role: "intern"
            });

            // Create four tasks with different statuses
            await Task.create([
                {
                    title: "Pending Task",
                    description: "Pending progress test",
                    assignedTo: intern._id,
                    assignedBy: admin._id,
                    deadline: new Date("2026-12-31"),
                    priority: "medium",
                    status: "pending"
                },
                {
                    title: "In Progress Task",
                    description: "In-progress progress test",
                    assignedTo: intern._id,
                    assignedBy: admin._id,
                    deadline: new Date("2026-12-31"),
                    priority: "medium",
                    status: "in-progress"
                },
                {
                    title: "Submitted Task",
                    description: "Submitted progress test",
                    assignedTo: intern._id,
                    assignedBy: admin._id,
                    deadline: new Date("2026-12-31"),
                    priority: "medium",
                    status: "submitted"
                },
                {
                    title: "Completed Task",
                    description: "Completed progress test",
                    assignedTo: intern._id,
                    assignedBy: admin._id,
                    deadline: new Date("2026-12-31"),
                    priority: "medium",
                    status: "completed"
                }
            ]);

            // Login as the intern
            const loginResponse = await request(app)
                .post("/api/auth/login")
                .send({
                    email: internEmail,
                    password: "Password1"
                });

            expect(loginResponse.statusCode).toBe(200);

            const token = loginResponse.body.token;

            const response = await request(app)
                .get("/api/interns/me/progress")
                .set("Authorization", `Bearer ${token}`);

            expect(response.statusCode).toBe(200);

            expect(response.body.progress.totalTasks).toBe(4);
            expect(response.body.progress.completedTasks).toBe(1);
            expect(response.body.progress.inProgressTasks).toBe(1);
            expect(response.body.progress.pendingTasks).toBe(1);
            expect(response.body.progress.submittedTasks).toBe(1);
            expect(response.body.progress.progressPercentage).toBe(25);

        } finally {
            if (intern) {
                await Task.deleteMany({
                    assignedTo: intern._id
                });
            }

            await User.deleteMany({
                email: { $in: [adminEmail, internEmail] }
            });
        }
    });
    test("Intern with no tasks should have zero progress", async () => {
    const internEmail = "zero-progress-intern-jest@example.com";

    let intern;

    try {
        await User.deleteOne({ email: internEmail });

        intern = await User.create({
            name: "Zero Progress Intern",
            email: internEmail,
            password: "Password1",
            role: "intern"
        });

        // Make sure this intern genuinely has no tasks
        await Task.deleteMany({
            assignedTo: intern._id
        });

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: internEmail,
                password: "Password1"
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.token;

        const response = await request(app)
            .get("/api/interns/me/progress")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.progress.totalTasks).toBe(0);
        expect(response.body.progress.completedTasks).toBe(0);
        expect(response.body.progress.inProgressTasks).toBe(0);
        expect(response.body.progress.pendingTasks).toBe(0);
        expect(response.body.progress.submittedTasks).toBe(0);

        expect(
            response.body.progress.progressPercentage
        ).toBe(0);

    } finally {
        if (intern) {
            await Task.deleteMany({
                assignedTo: intern._id
            });
        }

        await User.deleteOne({
            email: internEmail
        });
    }
});
});