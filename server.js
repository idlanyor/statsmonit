import 'dotenv/config'
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server } from 'socket.io'
import { getStats } from './lib/stats.js'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 8088

// Create Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize Socket.IO with optimized settings
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    transports: ['websocket'],  // Only use websocket (faster)
    pingTimeout: 3000,          // Faster ping timeout
    pingInterval: 1000,         // Heartbeat every 1 second
    connectTimeout: 5000,       // Connection timeout
    allowUpgrades: false,       // Don't allow transport upgrades
  })

  const clients = new Set()
  let cachedStats = null

  // Pre-fetch stats on startup for faster initial connection
  ;(async () => {
    cachedStats = await getStats()
  })()

  // Send stats to all connected clients every 1 second
  setInterval(async () => {
    cachedStats = await getStats()
    for (const socket of clients) {
      const statsWithUser = { ...cachedStats, user_info: socket.userInfo }
      socket.emit('stats', statsWithUser)
    }
  }, 1000)

  io.on('connection', (socket) => {
    console.log('A client connected')

    // Get user information from socket handshake
    const userAgent = socket.handshake.headers['user-agent'] || 'Unknown'
    const ipAddress = socket.handshake.address || socket.handshake.headers['x-forwarded-for'] || 'Unknown'
    const language = socket.handshake.headers['accept-language']?.split(',')[0] || 'Unknown'

    // Store user info with socket
    socket.userInfo = {
      userAgent,
      ipAddress,
      language,
      connectedAt: new Date().toISOString()
    }

    clients.add(socket)

    // Send initial data immediately using cached stats (faster)
    if (cachedStats) {
      socket.emit('stats', { ...cachedStats, user_info: socket.userInfo })
    } else {
      // Fallback if cache not ready yet
      ;(async () => {
        const stats = await getStats()
        socket.emit('stats', { ...stats, user_info: socket.userInfo })
      })()
    }

    // Remove from clients list on disconnect
    socket.on('disconnect', () => {
      console.log('A client disconnected')
      clients.delete(socket)
    })
  })

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
