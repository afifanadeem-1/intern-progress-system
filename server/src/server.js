const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
require("dotenv").config();

const connectDB = require("./config/db");
const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const internRoutes = require("./routes/internRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
connectDB();

app.use(express.json()); 

console.log("healthRoutes type:", typeof healthRoutes);
console.log("authRoutes type:", typeof authRoutes);

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/interns", internRoutes);
app.use("/api/tasks", taskRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

