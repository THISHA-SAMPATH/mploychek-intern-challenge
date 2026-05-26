import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server as SocketServer } from "socket.io";

import connectDB from "./config/db";
import seedData from "./config/seed";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import recordRoutes from "./routes/record.routes";
import documentRoutes from "./routes/document.routes";

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:4200",
  "http://localhost:4300",
  "https://mploychek-intern-challenge.vercel.app",
  process.env.FRONTEND_URL || "",
].filter(Boolean);

// Socket.io setup
const io = new SocketServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/documents", documentRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "MPloyChek API is running",
    timestamp: new Date().toISOString(),
  });
});

// Socket.io
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.on("join", (userId: string) => {
    socket.join(userId);
  });
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

export { io };

const PORT = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
  await connectDB();
  await seedData();
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`✅ Allowed origins: ${allowedOrigins.join(", ")}`);
  });
};

startServer();
