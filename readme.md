# StatsMonit

<div align="center">

[![Antidonasi Inc.](https://img.shields.io/badge/Organization-Antidonasi%20Inc.-green?style=for-the-badge&logo=whatsapp)](https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m)

</div>

[![License: MIT](https://img.shields.io/github/license/cabrata/statsmonit)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js->=18.x-brightgreen.svg)](https://nodejs.org/)
[![Platform Support](https://img.shields.io/badge/platform-linux%20|%20windows%20|%20macos-lightgrey)](#features)
[![Node.js CI](https://github.com/cabrata/statsmonit/actions/workflows/nodejs.yml/badge.svg)](https://github.com/cabrata/statsmonit/actions/workflows/nodejs.yml)

[![GitHub Stars](https://img.shields.io/github/stars/cabrata/statsmonit?style=social)](https://github.com/cabrata/statsmonit/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/cabrata/statsmonit?style=social)](https://github.com/cabrata/statsmonit/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/cabrata/statsmonit)](https://github.com/cabrata/statsmonit/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/cabrata/statsmonit)](https://github.com/cabrata/statsmonit/pulls)

**StatsMonit** is a powerful, lightweight server monitoring dashboard built with **Node.js** and **Socket.io**. It provides comprehensive real-time system statistics with a beautiful, responsive UI, including **CPU usage, RAM usage, disk space, all network interfaces, user information**, and much more.

## Demo
[![Image](https://api.microlink.io/?url=https%3A%2F%2Fnode2.antidonasi.web.id&amp;screenshot=true&amp;meta=true&amp;embed=screenshot.url&amp;overlay.browser=dark&amp;waitForTimeout=30000&amp;overlay.background=linear-gradient(90deg%2C%20%23FF9A8B%200%25%2C%20%23FF6A88%2055%25%2C%20%23FF99AC%20100%25))](https://monitor.kanata.web.id)


## ✨ Features

### 📊 System Monitoring
- **Real-time Monitoring**: Get live updates every 3 seconds via WebSocket
- **CPU Monitoring**:
  - Current usage percentage with visual gauge
  - CPU model and core count
  - Load average (1m, 5m, 15m)
  - Historical usage timeline chart
- **Memory/RAM Usage**:
  - Real-time RAM consumption with percentage
  - Detailed memory breakdown (used/total)
  - Progress bar visualization
  - Historical memory usage timeline
- **Disk Statistics**:
  - Total, used, and available disk space
  - Usage percentage with visual indicators
  - File system type and mount point information
- **CPU Temperature**:
  - Real-time temperature monitoring
  - Status indicator (Normal/Moderate/High)
  - Cross-platform support (Linux thermal zones, systeminformation API)

### 🌐 Network Monitoring
- **All Network Interfaces**:
  - Displays **ALL** network interfaces (eth0, lo, wlan0, docker, veth, etc.)
  - RX (received) and TX (transmitted) bytes for each interface
  - Real-time network traffic statistics
  - Interface-specific data (not just eth0!)
- **Network Speed**:
  - Real-time download/upload speed
  - Historical network traffic timeline
  - Smoothed speed calculations (5-point average)

### 👤 User Information
- **Browser Detection**: Automatic detection of browser name and version (Chrome, Firefox, Edge, Safari)
- **Operating System**: Detects OS and version (Windows, macOS, Linux, Android, iOS)
- **Device Type**: Identifies device type (Desktop, Mobile, Tablet, iPad)
- **IP Address**: Shows client IP address
- **Language**: Displays browser language preference
- **Session Info**:
  - Connection timestamp and duration
  - Screen resolution

### 🔧 Runtime & Process Info
- **Node.js Heap Statistics**:
  - Heap used/total memory
  - RSS (Resident Set Size)
  - External memory usage
  - Visual chart representation
- **Process Information**:
  - Total process count
  - Running, sleeping, and blocked processes

### 🎨 UI/UX Features
- **Dark/Light Theme**: Toggle between dark and light themes
- **Responsive Design**: Mobile-friendly, works on all screen sizes
- **Beautiful UI**: Modern glass-morphism design with smooth animations
- **Toast Notifications**: Real-time alerts for high CPU, memory, or temperature
- **Customizable Settings**:
  - Adjustable update interval (1-10 seconds)
  - Enable/disable alerts for CPU, memory, temperature
- **Timeline Charts**: Historical data visualization with Chart.js
- **Fullscreen Mode**: Dedicated fullscreen toggle
- **Keyboard Shortcuts**:
  - `Ctrl+F`: Toggle fullscreen
  - `Ctrl+T`: Toggle theme
  - `Ctrl+,`: Open settings

### 🔋 Battery Monitoring (if available)
- Battery level percentage
- Charging status
- Estimated time remaining
- Visual battery indicator

### 🖥 Cross-platform Support
- **Linux**: Full support with direct sysfs access for enhanced performance
- **Windows**: Complete monitoring via systeminformation API
- **macOS**: Full support for all metrics

## Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **NPM** (comes with Node.js)
- **g++** (to compile some packages)
- **cmake** (to compile some packages)

### Steps
1. Clone this repository:
   ```bash
   git clone https://github.com/cabrata/statsmonit
   ```

2. Navigate into the project folder:

   ```bash
   cd statsmonit
   ```
3. Install dependencies:

   ```bash
   npm install
   ```
4. (Optional) Configure environment variables:
   Create a `.env` file and specify the port (default: `8088`).

   ```env
   PORT=8088
   ```

## Usage

### Start the Server

Run the following command to start the monitoring service:

```bash
npm start
```

or manually using:

```bash
node index.js
```

### Access the Dashboard

Once the server is running, open your browser and visit:

```
http://localhost:8088
```

The server will continuously send system statistics to the client using **WebSockets (Socket.io)**.

## 🔧 How It Works

### Architecture

```
┌─────────────────┐         WebSocket          ┌─────────────────┐
│                 │ ◄────────────────────────► │                 │
│  Web Browser    │    Real-time Updates       │   Node.js       │
│  (Dashboard)    │      Every 3 seconds       │   Server        │
│                 │                             │                 │
└─────────────────┘                             └────────┬────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │  System APIs    │
                                                │  - OS Module    │
                                                │  - sysinfo      │
                                                │  - /sys/class   │
                                                │  - diskusage    │
                                                └─────────────────┘
```

### 1. **Server Setup**
   - **Express.js**: Serves static frontend files (HTML, CSS, JS)
   - **HTTP Server**: Handles client connections
   - **Socket.io**: Provides bidirectional WebSocket communication for real-time updates
   - **Client Tracking**: Manages multiple connected clients simultaneously

### 2. **Data Collection**
   - **OS Module** (Node.js native): CPU cores, architecture, hostname, uptime, load average
   - **systeminformation**: CPU temperature, battery info, network interfaces list
   - **diskusage**: Disk space statistics (total, used, available)
   - **Linux sysfs** (direct read): Network interface statistics (`/sys/class/net/*/statistics/`)
   - **Thermal zones** (Linux): CPU temperature from `/sys/class/thermal/`
   - **process.memoryUsage()**: Node.js heap statistics

### 3. **Client Information Extraction**
   - **Socket Handshake**: Captures user-agent, IP address, language from HTTP headers
   - **User Agent Parsing**: Extracts browser, OS, and device information
   - **Session Tracking**: Monitors connection time and screen resolution

### 4. **Real-time Updates**
   - Server collects system stats **every 3 seconds**
   - Data packaged with user info and sent to each connected client via WebSocket
   - Historical data maintained (last 20 data points) for timeline charts
   - Smooth network speed calculation using 5-point moving average

### 5. **Frontend Rendering**
   - **Chart.js**: Renders doughnut charts and timeline graphs
   - **Dynamic Updates**: Updates DOM elements without page refresh
   - **Responsive UI**: Tailwind CSS for mobile-first design
   - **Theme System**: LocalStorage-persisted dark/light mode

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web server framework
- **Socket.io** - WebSocket library for real-time communication
- **systeminformation** - Cross-platform system information
- **diskusage** - Disk usage statistics

### Frontend
- **HTML5/CSS3** - Structure and styling
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Data visualization library
- **Socket.io Client** - WebSocket client
- **SweetAlert2** - Beautiful modal dialogs
- **Font Awesome** - Icon library

### Build Tools
- **Tailwind CLI** - CSS compilation
- **NPM** - Package management

## 📸 Dashboard Sections

The dashboard includes the following monitoring sections:

1. **System Overview** - Quick stats bar with CPU, RAM, Disk, Temperature
2. **CPU Usage** - Real-time gauge, load average, core count
3. **RAM Usage** - Memory consumption with progress bar
4. **Disk Usage** - Storage statistics with visualization
5. **Temperature** - CPU temperature with status indicator
6. **System Info** - Hostname, platform, architecture, uptime
7. **Network Speed** - Real-time download/upload speed with progress bars
8. **Timeline Graphs** - Historical CPU, Memory, and Network charts
9. **Process & Runtime** - Process count and Node.js heap statistics
10. **User Information** - Browser, device, OS, IP, session details
11. **Network Interfaces** - All network interfaces with RX/TX data

## 🏗 Build Tailwind CSS

If you want to customize the Tailwind CSS styling, compile the CSS using:

```bash
npm run build
```

This will generate a minified CSS file for production.

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Port (default: 8088)
PORT=8088
```

### Customization

**Update Interval**: Change the refresh rate in `index.js`:
```javascript
setInterval(async () => {
  // Your interval in milliseconds (default: 3000 = 3 seconds)
}, 3000)
```

**Dashboard Settings**: Users can customize:
- Update interval (1-10 seconds)
- Alert thresholds (CPU > 80%, Memory > 85%, Temperature > 70°C)
- Enable/disable specific alerts

Settings are persisted in browser localStorage.

## 🐛 Troubleshooting

### Temperature shows "N/A"
- **Linux**: Ensure `/sys/class/thermal/` is accessible
- **Windows/macOS**: Temperature may not be available on all systems
- Some virtual machines don't expose temperature sensors

### Network interfaces show 0 bytes
- On first run, counters start at 0
- After a few seconds, real data will appear
- Ensure you have proper read permissions for `/sys/class/net/`

### High CPU usage from StatsMonit
- Reduce update interval in settings (default: 3s)
- Close browser dev tools if open
- Consider running on a dedicated monitoring server

### Port 8088 already in use
```bash
# Find process using port 8088
lsof -i :8088  # or: netstat -tulpn | grep 8088

# Kill the process
kill -9 <PID>

# Or use a different port in .env
PORT=9999
```

## ❓ FAQ

**Q: Can I monitor remote servers?**
A: Yes! Deploy StatsMonit on the target server and access it via `http://server-ip:8088`. Consider using nginx as reverse proxy with SSL.

**Q: Does it store historical data?**
A: Currently, only the last 20 data points are kept in memory for timeline charts. For long-term storage, consider integrating with InfluxDB or Prometheus.

**Q: Can multiple users view the dashboard simultaneously?**
A: Yes! Each connected client receives real-time updates independently via WebSocket.

**Q: Why does it show all network interfaces, not just active ones?**
A: This is by design to monitor all interfaces including Docker containers, virtual networks, etc. You can filter interfaces in code if needed.

**Q: Is there an API to get stats programmatically?**
A: Currently, data is sent via WebSocket. You can add REST API endpoints in `index.js` if needed.

**Q: Can I customize the dashboard colors/theme?**
A: Yes! Edit `public/css/styles.css` or customize Tailwind configuration in `tailwind.config.js`.

## 🚀 Production Deployment

### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start index.js --name statsmonit

# Auto-start on system reboot
pm2 startup
pm2 save

# Monitor logs
pm2 logs statsmonit

# Restart application
pm2 restart statsmonit
```

### Using systemd (Linux)

Create `/etc/systemd/system/statsmonit.service`:

```ini
[Unit]
Description=StatsMonit Server
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/statsmonit
ExecStart=/usr/bin/node index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable statsmonit
sudo systemctl start statsmonit
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name monitor.yourdomain.com;

    location / {
        proxy_pass http://localhost:8088;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 🤝 Contributing

Contributions are welcome! Feel free to:
- 🐛 Report bugs by opening an issue
- 💡 Suggest new features
- 🔧 Submit pull requests
- ⭐ Star this repository if you find it useful!

### Development Setup

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🏢 Organization

This project is maintained under **[Antidonasi Inc.](https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m)**

[![Antidonasi Inc.](https://img.shields.io/badge/Antidonasi-Inc-green?style=for-the-badge&logo=whatsapp)](https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m)

Join our WhatsApp channel for:
- 📢 Latest updates and announcements
- 💬 Community discussions
- 🐛 Bug reports and feature requests
- 🤝 Collaboration opportunities

## 📜 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Antidonasi Inc.](https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m)** - Project organization and support
- [systeminformation](https://github.com/sebhildebrandt/systeminformation) - System information library
- [Chart.js](https://www.chartjs.org/) - Beautiful charts
- [Socket.io](https://socket.io/) - Real-time engine
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- All contributors and users of this project!

---

<div align="center">

Made with ❤️ by **Antidonasi Inc.**

[![WhatsApp Channel](https://img.shields.io/badge/Join%20Our-WhatsApp%20Channel-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m)

**[⬆ back to top](#statsmonit)**

</div>
