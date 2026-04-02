const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ─── DB CONNECTION ────────────────────────────────────────────────────────────
let db;

(async () => {
  try {
    db = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      connectTimeout: 10000,
    });

    await db.query("SELECT 1");
    console.log("✅ Connected to AWS RDS MySQL");
  } catch (err) {
    console.error("❌ DB CONNECTION ERROR:", err.message);
  }
})();

// ─── DATA ────────────────────────────────────────────────────────────────────
let services = [
  {
    id: 1,
    name: "EC2",
    category: "Compute",
    desc: "Scalable virtual servers in the cloud.",
    price: "$0.023/hr",
    rating: 4.8,
    icon: "🖥️",
    tags: ["virtual-machines", "autoscaling", "compute"],
  },
  {
    id: 2,
    name: "S3",
    category: "Storage",
    desc: "Object storage service.",
    price: "$0.023/GB",
    rating: 4.9,
    icon: "🪣",
    tags: ["object-storage", "backup", "static-assets"],
  },
  {
    id: 3,
    name: "RDS",
    category: "Database",
    desc: "Managed relational database.",
    price: "$0.017/hr",
    rating: 4.7,
    icon: "🗄️",
    tags: ["mysql", "postgres", "managed-db"],
  },
];

let users = [];

// ─── ROOT ────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("CloudCatalog API is running 🚀");
});

// ─── HEALTH ──────────────────────────────────────────────────────────────────
app.get("/health", async (req, res) => {
  let dbStatus = "in-memory";

  try {
    if (db) {
      await db.query("SELECT 1");
      dbStatus = "AWS RDS MySQL connected";
    }
  } catch (err) {
    dbStatus = "RDS connection failed";
  }

  res.json({
    status: "ok",
    server: "CloudCatalog API",
    db: dbStatus,
  });
});

// ─── SERVICES ────────────────────────────────────────────────────────────────
app.get("/services", (req, res) => {
  const { category, search } = req.query;

  let filteredServices = [...services];

  if (category) {
    filteredServices = filteredServices.filter(
      service => service.category.toLowerCase() === String(category).toLowerCase()
    );
  }

  if (search) {
    const query = String(search).toLowerCase();
    filteredServices = filteredServices.filter(service =>
      service.name.toLowerCase().includes(query) ||
      service.category.toLowerCase().includes(query) ||
      service.desc.toLowerCase().includes(query) ||
      service.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }

  res.json(filteredServices);
});

// ─── STATS ───────────────────────────────────────────────────────────────────
app.get("/stats", (req, res) => {
  const categories = new Set(services.map(service => service.category));

  res.json({
    totalServices: services.length,
    totalCategories: categories.size,
    totalUsers: users.length,
  });
});

// ─── AUTH ────────────────────────────────────────────────────────────────────
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields required" });
  }

  const user = { id: users.length + 1, name, email, password };
  users.push(user);

  res.json({ success: true, message: "Registered", user });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  res.json({ success: true, message: "Login success", user });
});

// ─── 🤖 UPDATED GEMINI AI (LATEST WORKING) ───────────────────────────────

app.post("/api/ai", async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.json({ reply: "Please enter a message." });
  }

  const msg = message.toLowerCase();

  try {
    // 🔥 TRY GEMINI FIRST
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: message }] }]
      }
    );

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response";

    return res.json({ reply });

  } catch (err) {
    console.error("AI ERROR:", err.response?.data || err.message);

    // 🚨 FALLBACK (VERY IMPORTANT)
    let fallback = "";

    if (msg.includes("storage")) {
      fallback = "For storage, AWS S3 is best. It offers high durability and scalability.";
    } 
    else if (msg.includes("compute")) {
      fallback = "For compute, AWS EC2 is widely used. It provides scalable virtual servers.";
    } 
    else if (msg.includes("database")) {
      fallback = "For databases, AWS RDS is recommended. It supports MySQL, PostgreSQL, etc.";
    } 
    else if (msg.includes("serverless")) {
      fallback = "For serverless, AWS Lambda is ideal. No need to manage servers.";
    } 
    else if (msg.includes("ai") || msg.includes("ml")) {
      fallback = "For AI/ML, AWS SageMaker is commonly used.";
    } 
    else {
      fallback = "I'm Chintu AI 🤖. I can help you with AWS services like EC2, S3, RDS, Lambda, and more.";
    }

    return res.json({
      reply: fallback + " (fallback response)"
    });
  }
});
// ─── START ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);