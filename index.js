import 'dotenv'
import express from "express";
import { static as expressStatic } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { getStats } from "./lib/stats.js";


const app = express()
const server = createServer(app)
const io = new Server(server)

app.use(express.static("public"))

const clients = new Set()

setInterval(async () => {
  const stats = await getStats()
  for (const socket of clients) {
    const statsWithUser = { ...stats, user_info: socket.userInfo };
    socket.emit("stats", statsWithUser)
  }
}, 3000)

io.on("connection", (socket) => {
  console.log("A client connected")

  // Get user information from socket handshake
  const userAgent = socket.handshake.headers['user-agent'] || 'Unknown';
  const ipAddress = socket.handshake.address || socket.handshake.headers['x-forwarded-for'] || 'Unknown';
  const language = socket.handshake.headers['accept-language']?.split(',')[0] || 'Unknown';

  // Store user info with socket
  socket.userInfo = {
    userAgent,
    ipAddress,
    language,
    connectedAt: new Date().toISOString()
  };

  clients.add(socket)

  // Kirim data awal saat pertama connect
  ;(async () => {
    const stats = await getStats()
    stats.user_info = socket.userInfo;
    socket.emit("stats", stats)
  })()

  // Hapus dari daftar saat disconnect
  socket.on("disconnect", () => {
    console.log("A client disconnected")
    clients.delete(socket)
  })
})


const PORT = process.env.PORT || 8088
server.listen(PORT, () => {
  console.log(`The Server Is Running On http://localhost:${PORT}`)
})
