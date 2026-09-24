const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");

describe("Authentication API", () => {
    test("POST /api/auth/login should reject an invalid email", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "not-an-email",
                password: "Password1"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Validation failed");
    });
    test("POST /api/auth/register should register a new intern", async () => {
    const testEmail = "jest-intern@example.com";

    // Make the test repeatable
    await User.deleteOne({ email: testEmail });

    const response = await request(app)
        .post("/api/auth/register")
        .send({
            name: "Jest Intern",
            email: testEmail,
            department: "Software Development",
            password: "Password1"
        });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("Registration successful");
    expect(response.body.user.email).toBe(testEmail);
    expect(response.body.user.role).toBe("intern");

    // Cleanup
    await User.deleteOne({ email: testEmail });
});
test("POST /api/auth/register should reject duplicate email", async () => {
    const testEmail = "duplicate-jest@example.com";

    // Start clean
    await User.deleteOne({ email: testEmail });

    // Create an existing user
    await User.create({
        name: "Existing Intern",
        email: testEmail,
        department: "Software Development",
        password: "Password1",
        role: "intern"
    });

    const response = await request(app)
        .post("/api/auth/register")
        .send({
            name: "Another Intern",
            email: testEmail,
            department: "Software Development",
            password: "Password1"
        });

    expect(response.statusCode).toBe(409);
    expect(response.body.message).toBe(
        "An account with this email already exists"
    );

    // Cleanup
    await User.deleteOne({ email: testEmail });
});
test("POST /api/auth/login should login a valid user", async () => {
    const testEmail = "login-jest@example.com";

    // Start clean
    await User.deleteOne({ email: testEmail });

    // Create a user for this test
    await User.create({
        name: "Login Test Intern",
        email: testEmail,
        department: "Software Development",
        password: "Password1",
        role: "intern"
    });

    const response = await request(app)
        .post("/api/auth/login")
        .send({
            email: testEmail,
            password: "Password1"
        });

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveProperty("token");

    expect(response.body.user.email).toBe(testEmail);
    expect(response.body.user.role).toBe("intern");

    // Cleanup
    await User.deleteOne({ email: testEmail });
});
test("GET /api/auth/me should reject request without token", async () => {
    const response = await request(app)
        .get("/api/auth/me");

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe(
        "Not authorized, no token"
    );
});
test("GET /api/auth/me should return authenticated user", async () => {
    const testEmail = "me-jest@example.com";

    await User.deleteOne({ email: testEmail });

    await User.create({
        name: "Protected Route Intern",
        email: testEmail,
        department: "Software Development",
        password: "Password1",
        role: "intern"
    });

    // Login first to obtain a real JWT
    const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
            email: testEmail,
            password: "Password1"
        });

    const token = loginResponse.body.token;

    // Use that JWT on the protected endpoint
    const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.user.email).toBe(testEmail);
    expect(response.body.user.role).toBe("intern");

    await User.deleteOne({ email: testEmail });
});
test("GET /api/interns should reject an intern user", async () => {
    const testEmail = "unauthorized-intern-jest@example.com";

    await User.deleteOne({ email: testEmail });

    await User.create({
        name: "Unauthorized Test Intern",
        email: testEmail,
        department: "Software Development",
        password: "Password1",
        role: "intern"
    });

    // Login as the intern
    const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
            email: testEmail,
            password: "Password1"
        });

    const token = loginResponse.body.token;

    // Try accessing an admin-only route
    const response = await request(app)
        .get("/api/interns")
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe(
        "You do not have permission to access this resource"
    );

    await User.deleteOne({ email: testEmail });
});
test("GET /api/interns should allow an admin user", async () => {
    const testEmail = "admin-jest@example.com";

    await User.deleteOne({ email: testEmail });

    await User.create({
        name: "Test Admin",
        email: testEmail,
        department: "Administration",
        password: "Password1",
        role: "admin"
    });

    // Login as admin
    const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
            email: testEmail,
            password: "Password1"
        });

    const token = loginResponse.body.token;

    // Access admin-only route
    const response = await request(app)
        .get("/api/interns")
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("interns");

    await User.deleteOne({ email: testEmail });
});
});
