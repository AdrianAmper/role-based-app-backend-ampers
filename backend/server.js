const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const SECRET = "BSIT_SECRET_2026";

// =========================
// USERS DB
// =========================
let users = [
  {
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    password: bcrypt.hashSync("Password123!", 10),
    role: "Admin"
  }
];

// =========================
// REGISTER
// =========================
app.post("/api/register", (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: "Email already exists" });
  }

  users.push({
    firstName,
    lastName,
    email,
    password: bcrypt.hashSync(password, 10),
    role: "User"
  });

  res.json({ message: "Registration successful" });
});

// =========================
// LOGIN
// =========================
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const match = bcrypt.compareSync(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { email: user.email, role: user.role },
    SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    token,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role
  });
});

// =========================
// AUTH MIDDLEWARE
// =========================
function verifyToken(req, res, next) {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  // ✅ support Bearer token (safe fix)
  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(403).json({ message: "Invalid token" });
  }
}

// =========================
// ADMIN CHECK
// =========================
function isAdmin(req, res, next) {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
}

// =========================
// PROFILE
// =========================
app.get("/api/profile", verifyToken, (req, res) => {
  const user = users.find(u => u.email === req.user.email);

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role
  });
});

// =========================
// ADMIN TEST ROUTE (FOR SCREENSHOT)
// =========================
app.get("/api/admin-test", verifyToken, isAdmin, (req, res) => {
  res.json({ message: "Admin access granted ✅" });
});

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});