const dns = require("dns");
const mongoose = require("mongoose");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

beforeAll(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 15000,
        });

        console.log("CI MongoDB connection successful");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
}, 20000);

afterAll(async () => {
    await mongoose.connection.close();
}, 10000);