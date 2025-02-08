import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import problemRoutes from "./routes/problems.js";
import { auth } from "express-openid-connect";
import uploadRoutes from "./routes/upload.js";
import cors from 'cors';
import jwt from "jsonwebtoken";

// Load environment variables
dotenv.config();
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASEURL,
  clientID: process.env.CLIENTID,
  issuerBaseURL: process.env.ISSUER,
};


const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.json());
app.use("/api/problems", problemRoutes);
app.use("/api/upload", uploadRoutes);
app.use(auth(config));

// CORS config
app.use(cors({
  origin: 'http://localhost:5173', //front-end cors
  credentials: true 
}));
app.use("/api/analyzeFileUrl", analyzeFileUrlRoutes);

// Log all requests (for debugging)
app.use((req, res, next) => {
  console.log(`🔍 [${req.method}] Request - Path: ${req.url}`);
  next();
});

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

app.get('/login', (req, res) => {
  res.oidc.login();
});

// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

// ✅ Add token verification API (called from frontend after login)
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
