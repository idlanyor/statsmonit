'use client'

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export interface SystemStats {
  cpu: string
  cpu_name: string
  ram: string
  uptime: number
  ram_text: string
  platform: string
  architecture: string
  cpu_cores: number
  hostname: string
  load_average: number[]
  temperature: string | null
  disk: any
  network: any[]
  cpu_history: any[]
  memory_history: any[]
  network_history: any[]
  heap: any
  process_count: any
  file_system_info: any
  network_speed: any
  battery_status: any
  system_time: any
  user_info?: any
}

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [stats, setStats] = useState<SystemStats | null>(null)

  useEffect(() => {
    // Initialize socket connection with optimized settings
    const socketInstance = io({
      path: '/socket.io',
      transports: ['websocket'], // Skip polling, connect directly via websocket
      reconnectionDelay: 500,    // Faster reconnection
      reconnectionDelayMax: 2000,
      timeout: 5000,             // Connection timeout
      forceNew: false,
      upgrade: false,            // Don't upgrade from polling
    })

    socketInstance.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server')
      setIsConnected(false)
    })

    socketInstance.on('stats', (data: SystemStats) => {
      setStats(data)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  return { socket, isConnected, stats }
}
