const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/connect_db.js");
const { userSchema } = require("../models/Schema.js");
const { eq } = require("drizzle-orm");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(userSchema)
      .where(eq(userSchema.email, email));
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await db
      .insert(userSchema)
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .returning();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser[0].id, email: newUser[0].email },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const existingUser = await db
      .select()
      .from(userSchema)
      .where(eq(userSchema.email, email));
    if (existingUser.length === 0) {
      return res.status(404).json({
        message: "User not found",
        requiresSignup: true,
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser[0].password,
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: existingUser[0].id, email: existingUser[0].email },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: existingUser[0].id,
        name: existingUser[0].name,
        email: existingUser[0].email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Middleware to verify JWT token

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

module.exports = {
  register,
  login,
  authenticateToken,
};
