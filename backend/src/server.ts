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

dotenv.config();

const app = express();
const server = http.createServer(app);
const allowedOrigins = (
  process.env.FRONTEND_URL || "http://localhost:4200,http://localhost:4300"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

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
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "MPloyChek API is running",
    timestamp: new Date().toISOString(),
  });
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("join", (userId: string) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Export io for use in routes later
export { io };

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
  await connectDB();
  await seedData();

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Socket.io ready`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
};

startServer();
