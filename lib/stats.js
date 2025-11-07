import { cpuTemperature, processes as _processes, fsSize as _fsSize, networkInterfaces as _networkInterfaces, battery as _battery, mem, currentLoad } from 'systeminformation';
import { platform as _platform, uptime as _uptime, cpus as _cpus, arch, hostname as _hostname, loadavg } from "os";
import { check } from "diskusage";
import { promises as fs } from "fs";
import { join } from "path";
import { formatBytes } from "./utils.js";

// Store historical data for timeline graphs
const historyLimit = 20; // Number of data points to keep in history
let cpuHistory = [];
let memoryHistory = [];
let networkHistory = [];
let lastNetworkHistoryStats = null;

async function getDiskStats(path = "/") {
  try {
    const { available, free, total } = await check(path);
    const used = total - free;
    const usedPercent = ((used / total) * 100).toFixed(2);
    return {
      path,
      total: formatBytes(total),
      used: formatBytes(used),
      available: formatBytes(available),
      usedPercent: `${usedPercent}%`,
    };
  } catch (err) {
    console.error(`Error getting disk stats for path "${path}":`, err);
    return null;
  }
}

// Helper function to read network stats from Linux sysfs
async function readInterfaceStats(interfaceName) {
  try {
    const platform = _platform();

    // On Linux, read from /sys/class/net/[interface]/statistics/
    if (platform === 'linux') {
      const rxBytesPath = `/sys/class/net/${interfaceName}/statistics/rx_bytes`;
      const txBytesPath = `/sys/class/net/${interfaceName}/statistics/tx_bytes`;

      try {
        const rxBytesContent = await fs.readFile(rxBytesPath, 'utf8');
        const txBytesContent = await fs.readFile(txBytesPath, 'utf8');

        const rxBytes = parseInt(rxBytesContent.trim());
        const txBytes = parseInt(txBytesContent.trim());

        return {
          rxBytes: isNaN(rxBytes) ? 0 : rxBytes,
          txBytes: isNaN(txBytes) ? 0 : txBytes
        };
      } catch (err) {
        // If can't read from sysfs, return 0
        return { rxBytes: 0, txBytes: 0 };
      }
    }

    // For non-Linux platforms, return 0
    return { rxBytes: 0, txBytes: 0 };
  } catch (err) {
    return { rxBytes: 0, txBytes: 0 };
  }
}

async function getNetworkStats() {
  try {
    const allInterfaces = await _networkInterfaces();
    const currentTime = Date.now();

    if (!Array.isArray(allInterfaces)) {
      return [];
    }

    // Calculate total input/output
    let totalInput = 0;
    let totalOutput = 0;

    const interfaces = [];

    // Get stats for each interface
    for (const iface of allInterfaces) {
      const interfaceName = iface.iface;
      const stats = await readInterfaceStats(interfaceName);

      const rxBytes = stats.rxBytes;
      const txBytes = stats.txBytes;

      totalInput += rxBytes;
      totalOutput += txBytes;

      interfaces.push({
        interface: interfaceName,
        inputBytes: formatBytes(rxBytes),
        outputBytes: formatBytes(txBytes),
        totalBytes: formatBytes(rxBytes + txBytes),
        rawInputBytes: rxBytes,
        rawOutputBytes: txBytes,
      });
    }

    // Calculate rate for history (bytes per second)
    const timestamp = new Date().toISOString();
    let inputRate = 0;
    let outputRate = 0;

    if (lastNetworkHistoryStats) {
      const timeDiff = (currentTime - lastNetworkHistoryStats.timestamp) / 1000;
      if (timeDiff > 0) {
        inputRate = Math.max(0, (totalInput - lastNetworkHistoryStats.input) / timeDiff);
        outputRate = Math.max(0, (totalOutput - lastNetworkHistoryStats.output) / timeDiff);
      }
    }

    // Store current stats for next calculation
    lastNetworkHistoryStats = {
      input: totalInput,
      output: totalOutput,
      timestamp: currentTime
    };

    // Add rate to network history
    networkHistory.push({
      timestamp,
      input: inputRate,
      output: outputRate
    });

    // Trim history if needed
    if (networkHistory.length > historyLimit) {
      networkHistory.shift();
    }

    return interfaces;
  } catch (err) {
    console.error("Error getting network stats:", err);
    return [];
  }
}

async function getTemperatureInfo() {
  try {
    const platform = _platform();

    if (platform === 'linux') {
      // Logika khusus Linux seperti sebelumnya
      const thermalZonesDir = '/sys/class/thermal';
      try {
        await fs.access(thermalZonesDir);
      } catch (err) {
        console.log("Thermal information directory not accessible");
        return null;
      }

      const thermalItems = await fs.readdir(thermalZonesDir);
      const thermalZones = thermalItems.filter(item => item.startsWith('thermal_zone'));

      if (thermalZones.length === 0) {
        // console.log("No thermal zones found");
        return null;
      }

      const temperatures = [];
      for (const zone of thermalZones) {
        try {
          const tempPath = join(thermalZonesDir, zone, 'temp');
          const tempContent = await fs.readFile(tempPath, 'utf8');
          const temp = parseInt(tempContent.trim()) / 1000;
          if (!isNaN(temp)) {
            temperatures.push(temp);
          }
        } catch (err) {
          continue;
        }
      }

      if (temperatures.length === 0) {
        return null;
      }

      const avgTemp = temperatures.reduce((sum, t) => sum + t, 0) / temperatures.length;
      return `${avgTemp.toFixed(1)}°C`;
    } else {
      // Windows / macOS: gunakan systeminformation
      const tempData = await cpuTemperature();
      if (tempData.main && !isNaN(tempData.main)) {
        return `${tempData.main.toFixed(1)}°C`;
      } else {
        return null;
      }
    }
  } catch (err) {
    console.error("Error getting temperature information:", err);
    return null;
  }
}


// Get Node.js heap memory statistics
async function getHeapStats() {
  const memoryUsage = process.memoryUsage();
  return {
    rss: formatBytes(memoryUsage.rss),
    heapTotal: formatBytes(memoryUsage.heapTotal),
    heapUsed: formatBytes(memoryUsage.heapUsed),
    external: formatBytes(memoryUsage.external),
    arrayBuffers: formatBytes(memoryUsage.arrayBuffers || 0),
    rawHeapUsed: memoryUsage.heapUsed,
    rawHeapTotal: memoryUsage.heapTotal,
    heapUsedPercent: ((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(2)
  };
}

// Get process count
async function getProcessCount() {
  try {
    const processes = await _processes();
    return {
      all: processes.all,
      running: processes.running,
      blocked: processes.blocked,
      sleeping: processes.sleeping
     };
  } catch (err) {
    console.error("Error getting process count:", err);
    return { all: 0, running: 0, blocked: 0, sleeping: 0 };
  }
}

// Get file system info
async function getFileSystemInfo() {
  try {
    const fsSize = await _fsSize();
    if (fsSize && fsSize.length > 0) {
      const rootFs = fsSize.find(fs => fs.mount === '/' || fs.mount === 'C:') || fsSize[0];
      return {
        type: rootFs.fsType || 'Unknown',
        inodes: rootFs.inodes ? `${rootFs.inodes.used}/${rootFs.inodes.total}` : 'N/A',
        blocksize: rootFs.blocksize ? `${formatBytes(rootFs.blocksize)}` : 'N/A',
        mount: rootFs.mount || 'Unknown'
      };
    }
    return { type: 'Unknown', inodes: 'N/A', blocksize: 'N/A', mount: 'Unknown' };
  } catch (err) {
    console.error("Error getting file system info:", err);
    return { type: 'Unknown', inodes: 'N/A', blocksize: 'N/A', mount: 'Unknown' };
  }
}

// Get network speed (bytes per second)
let lastNetworkStats = null;
let networkSpeedHistory = [];

async function getNetworkSpeed() {
  try {
    const allInterfaces = await _networkInterfaces();
    const currentTime = Date.now();

    if (!allInterfaces || allInterfaces.length === 0) {
      return { download: '0 KB/s', upload: '0 KB/s', downloadRaw: 0, uploadRaw: 0 };
    }

    // Calculate total bytes for all interfaces
    let totalRxBytes = 0;
    let totalTxBytes = 0;

    for (const iface of allInterfaces) {
      const stats = await readInterfaceStats(iface.iface);
      totalRxBytes += stats.rxBytes;
      totalTxBytes += stats.txBytes;
    }

    if (lastNetworkStats) {
      // Calculate actual time difference in seconds
      const timeDiff = (currentTime - lastNetworkStats.timestamp) / 1000;

      if (timeDiff > 0) {
        const downloadSpeed = (totalRxBytes - lastNetworkStats.rx) / timeDiff;
        const uploadSpeed = (totalTxBytes - lastNetworkStats.tx) / timeDiff;

        // Add to history for smoothing
        networkSpeedHistory.push({
          download: Math.max(0, downloadSpeed),
          upload: Math.max(0, uploadSpeed),
          timestamp: currentTime
        });

        // Keep only last 5 measurements for averaging
        if (networkSpeedHistory.length > 5) {
          networkSpeedHistory.shift();
        }

        // Calculate average speed
        const avgDownload = networkSpeedHistory.reduce((sum, item) => sum + item.download, 0) / networkSpeedHistory.length;
        const avgUpload = networkSpeedHistory.reduce((sum, item) => sum + item.upload, 0) / networkSpeedHistory.length;

        lastNetworkStats = { rx: totalRxBytes, tx: totalTxBytes, timestamp: currentTime };

        return {
          download: `${formatBytes(avgDownload)}/s`,
          upload: `${formatBytes(avgUpload)}/s`,
          downloadRaw: avgDownload,
          uploadRaw: avgUpload
        };
      }
    }

    // First run or no time difference
    lastNetworkStats = { rx: totalRxBytes, tx: totalTxBytes, timestamp: currentTime };
    return { download: '0 KB/s', upload: '0 KB/s', downloadRaw: 0, uploadRaw: 0 };
  } catch (err) {
    console.error("Error getting network speed:", err);
    return { download: '0 KB/s', upload: '0 KB/s', downloadRaw: 0, uploadRaw: 0 };
  }
}

// Get battery status
async function getBatteryStatus() {
  try {
    const battery = await _battery();
    if (battery && battery.hasBattery) {
      return {
        level: battery.percent || 0,
        isCharging: battery.isCharging || false,
        timeLeft: battery.timeRemaining || 0,
        voltage: battery.voltage || 0,
        cycleCount: battery.cycleCount || 0
      };
    }
    return null;
  } catch (err) {
    console.error("Error getting battery status:", err);
    return null;
  }
}

// Get system time
function getSystemTime() {
  const now = new Date();
  return {
    time: now.toLocaleTimeString(),
    date: now.toLocaleDateString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: now.toISOString()
  };
}

export async function getStats() {
  const memData = await mem();
  const totalMem = memData.total;
  const usedMem = memData.active;
  const usedMemPercent = ((usedMem / totalMem) * 100).toFixed(2);
  const uptime = _uptime();
  const cpuLoad = await currentLoad();
  const cpuUsage = cpuLoad.currentLoad;
  const cpus = _cpus();
  const diskStats = await getDiskStats();
  const networkStats = await getNetworkStats();
  const tempInfo = await getTemperatureInfo();
  const heapStats = await getHeapStats();
  const processCount = await getProcessCount();
  const fileSystemInfo = await getFileSystemInfo();
  const networkSpeed = await getNetworkSpeed();
  const batteryStatus = await getBatteryStatus();
  const systemTime = getSystemTime();

  // Add to CPU history
  const timestamp = new Date().toISOString();
  cpuHistory.push({
    timestamp,
    usage: cpuUsage
  });

  // Add to memory history
  memoryHistory.push({
    timestamp,
    usage: parseFloat(usedMemPercent),
    used: usedMem,
    total: totalMem
  });

  // Trim histories if needed
  if (cpuHistory.length > historyLimit) {
    cpuHistory.shift();
  }

  if (memoryHistory.length > historyLimit) {
    memoryHistory.shift();
  }

  return {
    cpu: `${cpuUsage.toFixed(2)}%`,
    cpu_name: cpus[0]?.model || "Unknown",
    ram: `${usedMemPercent}%`,
    uptime,
    ram_text: `${formatBytes(usedMem)} / ${formatBytes(totalMem)} (${usedMemPercent}%)`,
    platform: _platform(),
    architecture: arch(),
    cpu_cores: cpus.length,
    hostname: _hostname(),
    load_average: loadavg(),
    temperature: tempInfo,
    disk: diskStats,
    network: networkStats,
    // Add history data for timeline graphs
    cpu_history: cpuHistory,
    memory_history: memoryHistory,
    network_history: networkHistory,
    // Add Node.js heap statistics
    heap: heapStats,
    process_count: processCount,
    file_system_info: fileSystemInfo,
    network_speed: networkSpeed,
    battery_status: batteryStatus,
    system_time: systemTime
  };
}
