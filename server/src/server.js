const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
require("dotenv").config();

const connectDB = require("./config/db");
const healthRoutes = require("./routes/healthRoutes");

const app = express();
connectDB();

app.use(express.json()); 

app.use("/api/health", healthRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});