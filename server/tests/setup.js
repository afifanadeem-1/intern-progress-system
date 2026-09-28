const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
    });
}, 20000);

afterAll(async () => {
    await mongoose.connection.close();
}, 10000);