const mongoose = require("mongoose");

const url = process.env.DATABASE_URL;

const connect = async () => {
    if (!url) {
        throw new Error("DATABASE_URL is not configured");
    }

    try {
        await mongoose.connect(url);
        console.log("Database is connected");
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = { connect };