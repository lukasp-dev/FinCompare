// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import problemRoutes from "./routes/problems.js";
import analyzeFileUrlRoutes from "./routes/analyzeFileUrl.js";
import uploadRoutes from "./routes/upload.js";
import { auth } from "express-openid-connect";
import cors from "cors";
import jwt from "jsonwebtoken";


dotenv.config();

const app = express();

// Apply CORS middleware first
app.use(
  cors({
    origin: "http://localhost:5173", // allow requests from your frontend
    credentials: true,
  })
);

// Parse JSON requests
app.use(bodyParser.json());

// Apply the OpenID Connect auth middleware (if you need it; otherwise, you could remove it)
app.use(
  auth({
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SECRET,
    baseURL: process.env.BASEURL,
    clientID: process.env.CLIENTID,
    issuerBaseURL: process.env.ISSUER,
  })
);

// Mount API routes
app.use("/api/problems", problemRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/analyzeFileUrl", analyzeFileUrlRoutes);

// Log all requests (only once)
app.use((req, res, next) => {
  console.log(`🔍 [${req.method}] Request - Path: ${req.url}`);
  next();
});

const PORT = process.env.PORT || 8080;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Define basic routes

app.get("/login", (req, res) => {
  res.oidc.login();
});

app.get("/", (req, res) => {
  res.send(req.oidc.isAuthenticated() ? "Logged in" : "Logged out");
});

app.post("/api/auth", async (req, res) => {
  const { token } = req.body; // Receive token from frontend
  try {
    const decoded = jwt.decode(token); // Decode JWT
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.json({ user: decoded }); // Return user information
  } catch (error) {
    res.status(500).json({ error: "Token verification failed" });
  }
});
