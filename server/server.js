require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const db = require("./src/config/db");
const supabase = require("./src/config/supabase");

const app = express();
app.set('trust proxy', 1); 
const PORT = process.env.PORT || 8080;

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "10kb" }));
app.use(hpp());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.status(200).json({ status: "OK", db: "Connected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "Error", db: "Disconnected" });
  }
});

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);

  try {
    await db.query("SELECT 1");
    console.log("✅ Database connected successfully");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }

  if (supabase) {
    console.log("✅ Supabase client initialized");
  } else {
    console.error("❌ Supabase client failed to initialize");
  }
});