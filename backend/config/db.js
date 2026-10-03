const mongoose = require("mongoose");

const getMongoUri = () => {
  const { MONGO_URI, MONGO_HOSTS, MONGO_OPTIONS } = process.env;

  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  if (!MONGO_URI.startsWith("mongodb+srv://") || !MONGO_HOSTS) {
    return MONGO_URI;
  }

  const match = MONGO_URI.match(/^mongodb\+srv:\/\/([^@]+)@[^/]+\/?(.*)$/);

  if (!match) {
    throw new Error("MONGO_URI is not a valid MongoDB connection string");
  }

  const [, credentials, database = ""] = match;
  const options = MONGO_OPTIONS || "authSource=admin&replicaSet=atlas-7lznyq-shard-0&retryWrites=true&w=majority&tls=true";

  return `mongodb://${credentials}@${MONGO_HOSTS}/${database.split("?")[0]}?${options}`;
};

const connectDB = async () => {
  try {
    await mongoose.connect(getMongoUri(), {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

module.exports = connectDB;
