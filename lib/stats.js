const si = require('systeminformation');
const os = require("os");
const disk = require("diskusage");
const osu = require("node-os-utils");
const fs = require("fs").promises;
const path = require("path");
const { formatBytes } = require("./utils");

// Store historical data for timeline graphs
const historyLimit = 20; // Number of data points to keep in history
let cpuHistory = [];
let memoryHistory = [];
let networkHistory = [];

async function getDiskStats(path = "/") {
  try {
    const { available, free, total } = await disk.check(path);
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

async function getNetworkStats() {
  const stats = await osu.netstat.stats();

  // Calculate total input/output for history
  let totalInput = 0;
  let totalOutput = 0;

  const interfaces = stats.map((iface) => {
    totalInput += Number.parseInt(iface.inputBytes) || 0;
    totalOutput += Number.parseInt(iface.outputBytes) || 0;

    return {
      interface: iface.interface,
      inputBytes: formatBytes(iface.inputBytes),
      outputBytes: formatBytes(iface.outputBytes),
      totalBytes: formatBytes(Number.parseInt(iface.inputBytes) + Number.parseInt(iface.outputBytes)),
      rawInputBytes: Number.parseInt(iface.inputBytes) || 0,
      rawOutputBytes: Number.parseInt(iface.outputBytes) || 0,
    };
  });

  // Add to network history
  const timestamp = new Date().toISOString();
  networkHistory.push({
    timestamp,
    input: totalInput,
    output: totalOutput
  });

  // Trim history if needed
  if (networkHistory.length > historyLimit) {
    networkHistory.shift();
  }

  return interfaces;
}

async function getTemperatureInfo() {
  try {
    const platform = os.platform();

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
          const tempPath = path.join(thermalZonesDir, zone, 'temp');
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
      const tempData = await si.cpuTemperature();
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

exports.getStats = async function getStats() {
  const memData = await si.mem();
  const totalMem = memData.total;
  const usedMem = memData.active;
  const usedMemPercent = ((usedMem / totalMem) * 100).toFixed(2);
  const uptime = os.uptime();
  const cpuUsage = await osu.cpu.usage();
  const cpus = os.cpus();
  const diskStats = await getDiskStats();
  const networkStats = await getNetworkStats();
  const tempInfo = await getTemperatureInfo();
  const heapStats = await getHeapStats();

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
    platform: os.platform(),
    architecture: os.arch(),
    cpu_cores: cpus.length,
    hostname: os.hostname(),
    load_average: os.loadavg(),
    temperature: tempInfo,
    disk: diskStats,
    network: networkStats,
    // Add history data for timeline graphs
    cpu_history: cpuHistory,
    memory_history: memoryHistory,
    network_history: networkHistory,
    // Add Node.js heap statistics
    heap: heapStats
  };
};
