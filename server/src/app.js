const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const internRoutes = require("./routes/internRoutes");
const taskRoutes = require("./routes/taskRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL
}));

app.use(express.json());

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/interns", internRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/submissions", submissionRoutes);

// Error handling middleware must remain after routes
app.use(errorHandler);

module.exports = app;