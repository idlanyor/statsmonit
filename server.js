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

  // Initialize Socket.IO
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  const clients = new Set()

  // Send stats to all connected clients every 3 seconds
  setInterval(async () => {
    const stats = await getStats()
    for (const socket of clients) {
      const statsWithUser = { ...stats, user_info: socket.userInfo }
      socket.emit('stats', statsWithUser)
    }
  }, 3000)

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

    // Send initial data when client connects
    ;(async () => {
      const stats = await getStats()
      stats.user_info = socket.userInfo
      socket.emit('stats', stats)
    })()

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
