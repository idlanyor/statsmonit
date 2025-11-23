# StatsMonit - Next.js Version

This is a refactored version of StatsMonit using **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS 4**.

## 🚀 What Changed

### Architecture
- **Framework**: Migrated from vanilla Express to **Next.js 15** with App Router
- **Frontend**: Converted from vanilla JavaScript to **React 19** with TypeScript
- **Styling**: Updated Tailwind CSS v4 with Next.js integration
- **Real-time**: Socket.IO integrated with custom Next.js server
- **Type Safety**: Full TypeScript support throughout the application

### Project Structure

```
statsmonit/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with fonts and metadata
│   ├── page.tsx           # Main dashboard page
│   └── globals.css        # Global styles with Tailwind
├── components/            # React components
│   ├── LoadingScreen.tsx  # Loading animation
│   ├── Navigation.tsx     # Top navigation bar
│   ├── DoughnutChart.tsx  # Chart.js doughnut charts
│   └── StatsCard.tsx      # Reusable stats cards
├── hooks/                 # Custom React hooks
│   └── useSocket.ts       # Socket.IO connection hook
├── lib/                   # Backend utilities
│   ├── stats.js           # System stats collection
│   └── utils.js           # Utility functions
├── server.js              # Custom Next.js + Socket.IO server
├── next.config.js         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
└── tailwind.config.js     # Tailwind CSS configuration
```

## 📦 Installation

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
```

### Port Configuration
The server runs on port 3000 by default. You can change it via the `PORT` environment variable.

## 🎨 Features

### Current Features
- ✅ Real-time system monitoring via Socket.IO
- ✅ CPU, RAM, Disk, Network speed tracking
- ✅ System information display
- ✅ Responsive design for mobile and desktop
- ✅ Dark/Light theme toggle
- ✅ Fullscreen mode
- ✅ Beautiful glassmorphism UI
- ✅ TypeScript type safety

### Features to Implement
- ⏳ Timeline charts (CPU/Memory/Network history)
- ⏳ Process count and Node.js heap statistics
- ⏳ Network interfaces display
- ⏳ User information tracking
- ⏳ Settings panel
- ⏳ Toast notifications
- ⏳ Temperature monitoring

## 🛠️ Development

### Key Technologies
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with improved hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first CSS framework
- **Socket.IO**: Real-time bidirectional communication
- **Chart.js**: Beautiful charts and graphs
- **systeminformation**: System and hardware information

### Custom Server
The application uses a custom Next.js server (`server.js`) to integrate Socket.IO with Next.js. This allows real-time updates while maintaining Next.js functionality.

## 📊 API

### Socket.IO Events

#### Client → Server
- `connection`: Initial connection from client

#### Server → Client
- `stats`: System statistics update (every 3 seconds)

### Stats Data Structure
```typescript
interface SystemStats {
  cpu: string                    // CPU usage percentage
  cpu_name: string              // CPU model name
  ram: string                   // RAM usage percentage
  uptime: number                // System uptime in seconds
  ram_text: string              // Formatted RAM usage
  platform: string              // Operating system
  architecture: string          // CPU architecture
  cpu_cores: number             // Number of CPU cores
  hostname: string              // System hostname
  load_average: number[]        // Load average [1m, 5m, 15m]
  temperature: string | null    // CPU temperature
  disk: {                       // Disk usage information
    path: string
    total: string
    used: string
    available: string
    usedPercent: string
  }
  network: Array<{              // Network interfaces
    interface: string
    inputBytes: string
    outputBytes: string
    totalBytes: string
  }>
  network_speed: {              // Real-time network speed
    download: string
    upload: string
  }
  user_info?: {                 // Connected user information
    userAgent: string
    ipAddress: string
    language: string
    connectedAt: string
  }
}
```

## 🔄 Migration Notes

### Breaking Changes
1. The application now requires Node.js 18+ for Next.js 15
2. Old HTML files are preserved in `/public` but not used
3. Environment variable `PORT` defaults to 3000 (was 8088)

### Preserved Features
- All system monitoring functionality
- Real-time updates via Socket.IO
- Responsive design
- Dark/Light theme support

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 is already in use, change it:
```bash
PORT=8088 npm run dev
```

### Build Errors
Ensure you're using Node.js 18 or higher:
```bash
node --version
```

### TypeScript Errors
Run the TypeScript compiler to check for errors:
```bash
npx tsc --noEmit
```

## 📝 License

ISC License - Same as the original project

## 👥 Credits

- Original Author: caliph91
- Migrated to Next.js by: Claude (Anthropic)
- Organization: Antidonasi Inc.

## 🔗 Links

- [GitHub Repository](https://github.com/caliph91/statsmonit)
- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.IO Documentation](https://socket.io/docs/)
