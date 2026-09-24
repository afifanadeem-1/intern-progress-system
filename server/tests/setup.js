const dns = require("dns");
const mongoose = require("mongoose");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
    await mongoose.connection.close();
});