import express from "express";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { firestore } from "./firebaseAdmin";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client (server-side only)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy-key" });

// MongoDB Connection with fallback
let isMongoConnected = false;
const rawMongoUri = process.env.MONGODB_URI;
const MONGODB_URI = rawMongoUri && typeof rawMongoUri === "string" && (rawMongoUri.startsWith("mongodb://") || rawMongoUri.startsWith("mongodb+srv://")) ? rawMongoUri.trim() : "";

if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      isMongoConnected = true;
      console.log("Connected to MongoDB successfully");
    })
    .catch((err) => {
      console.warn("MongoDB connection failed, running with in-memory persistence fallback:", err.message);
    });
} else {
  console.log("No MONGODB_URI provided. Running with robust in-memory database store.");
}

// Mongoose Schemas & Models
const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String },
  displayName: { type: String },
  coins: { type: Number, default: 500 },
  gems: { type: Number, default: 50 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

const characterSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  className: { type: String, required: true }, // Warrior, Mage, Rogue
  level: { type: Number, default: 1 },
  exp: { type: Number, default: 0 },
  expToNext: { type: Number, default: 100 },
  hp: { type: Number, default: 150 },
  maxHp: { type: Number, default: 150 },
  mana: { type: Number, default: 100 },
  maxMana: { type: Number, default: 100 },
  strength: { type: Number, default: 15 },
  intelligence: { type: Number, default: 10 },
  agility: { type: Number, default: 12 },
  vitality: { type: Number, default: 15 },
  statPoints: { type: Number, default: 0 },
  equipment: {
    weapon: { type: Object, default: null },
    armor: { type: Object, default: null },
    accessory: { type: Object, default: null },
  },
  inventory: { type: Array, default: [] },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Character = mongoose.models.Character || mongoose.model("Character", characterSchema);

// In-memory fallback stores
const memoryUsers = new Map<string, any>();
const memoryCharacters = new Map<string, any>();

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mongoConnected: isMongoConnected });
});

// Get or create user
app.post("/api/user", async (req, res) => {
  try {
    const { uid, email, displayName } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    if (isMongoConnected) {
      let user = await (User as any).findOne({ uid });
      if (!user) {
        user = await (User as any).create({ uid, email, displayName, coins: 500, gems: 50 });
      }
      return res.json(user);
    } else {
      let user = memoryUsers.get(uid);
      if (!user) {
        user = { uid, email, displayName, coins: 500, gems: 50, wins: 0, losses: 0 };
        memoryUsers.set(uid, user);
      }
      return res.json(user);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get character
app.get("/api/character/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    if (isMongoConnected) {
      const char = await (Character as any).findOne({ uid });
      return res.json(char || null);
    } else {
      return res.json(memoryCharacters.get(uid) || null);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update character
app.post("/api/character", async (req, res) => {
  try {
    const data = req.body;
    if (!data.uid || !data.name || !data.className) {
      return res.status(400).json({ error: "Missing required character fields" });
    }

    if (isMongoConnected) {
      let char = await (Character as any).findOneAndUpdate({ uid: data.uid }, data, { upsert: true, new: true });
      return res.json(char);
    } else {
      memoryCharacters.set(data.uid, data);
      return res.json(data);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Leaderboard
app.get("/api/leaderboard", async (req, res) => {
  try {
    if (isMongoConnected) {
      const chars = await (Character as any).find().sort({ level: -1, exp: -1 }).limit(10);
      return res.json(chars);
    } else {
      const chars = Array.from(memoryCharacters.values()).sort((a, b) => b.level - a.level);
      return res.json(chars.slice(0, 10));
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// AI Dungeon Master / Lore generator
app.post("/api/ai/flavor", async (req, res) => {
  try {
    const { prompt, context } = req.body;
    const model = "gemini-2.5-flash";
    const response = await ai.models.generateContent({
      model,
      contents: `You are an immersive Dungeon Master for a fantasy RPG game. ${context || ""}. Generate a short, thrilling atmospheric description for: ${prompt}`,
    });
    res.json({ text: response.text });
  } catch (err: any) {
    res.json({ text: "The dungeon shadows whisper dark secrets..." });
  }
});

// Real-time multiplayer rooms & matchmaking (Co-op & PvP)
interface Room {
  id: string;
  type: "coop" | "pvp";
  dungeonId?: string;
  difficulty?: string;
  host: { uid: string; name: string; className: string; level: number };
  players: any[];
  status: "waiting" | "in-game" | "finished";
  state?: any;
}

const activeRooms = new Map<string, Room>();

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  socket.on("get-rooms", () => {
    socket.emit("rooms-list", Array.from(activeRooms.values()));
  });

  socket.on("create-room", (roomData) => {
    const roomId = Math.random().toString(36).substring(2, 8);
    const newRoom: Room = {
      id: roomId,
      type: roomData.type,
      dungeonId: roomData.dungeonId,
      difficulty: roomData.difficulty,
      host: roomData.player,
      players: [roomData.player],
      status: "waiting",
    };
    activeRooms.set(roomId, newRoom);
    socket.join(roomId);
    socket.emit("room-created", newRoom);
    io.emit("rooms-list", Array.from(activeRooms.values()));
  });

  socket.on("join-room", ({ roomId, player }) => {
    const room = activeRooms.get(roomId);
    if (room && room.status === "waiting") {
      if (!room.players.some((p: any) => p.uid === player.uid)) {
        room.players.push(player);
      }
      socket.join(roomId);
      io.to(roomId).emit("room-updated", room);
      io.emit("rooms-list", Array.from(activeRooms.values()));
    } else {
      socket.emit("error-msg", "Room not found or game already started.");
    }
  });

  socket.on("start-room-game", ({ roomId }) => {
    const room = activeRooms.get(roomId);
    if (room) {
      room.status = "in-game";
      io.to(roomId).emit("game-started", room);
      io.emit("rooms-list", Array.from(activeRooms.values()));
    }
  });

  socket.on("combat-action", ({ roomId, actionData }) => {
    io.to(roomId).emit("combat-update", actionData);
  });

  socket.on("chat-message", async (msg) => {
    try {
      const docRef = await firestore.collection("global_chat").add({
        senderName: msg.senderName,
        senderUid: msg.senderUid,
        text: msg.text,
        timestamp: new Date(),
      });

      const snapshot = await docRef.get();

      io.emit("chat-broadcast", {
        id: snapshot.id,
        senderName: msg.senderName,
        senderUid: msg.senderUid,
        text: msg.text,
        timestamp: snapshot.get("timestamp"),
      });
    } catch (err) {
      console.error(err);

      socket.emit("chat-error", {
        message: "Failed to send message.",
      });
    }
  });

  socket.on("leave-room", ({ roomId, uid }) => {
    const room = activeRooms.get(roomId);
    if (room) {
      room.players = room.players.filter((p: any) => p.uid !== uid);
      if (room.players.length === 0 || room.host.uid === uid) {
        activeRooms.delete(roomId);
      } else {
        io.to(roomId).emit("room-updated", room);
      }
      socket.leave(roomId);
      io.emit("rooms-list", Array.from(activeRooms.values()));
    }
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
  });
});

// Vite Middleware setup for dev and production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, () => {
    console.log(`Realm of Legends RPG Server running on port ${PORT}`);
  });
}

startServer();
