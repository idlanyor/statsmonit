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
    socket.emit("stats", stats)
  }
}, 3000)

io.on("connection", (socket) => {
  console.log("A client connected")
  clients.add(socket)

  // Kirim data awal saat pertama connect
  ;(async () => {
    const stats = await getStats()
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
