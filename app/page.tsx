'use client'

import { useSocket } from '@/hooks/useSocket'
import Navigation from '@/components/Navigation'
import StatsCard from '@/components/StatsCard'
import LineChart from '@/components/LineChart'
import NetworkInterface from '@/components/NetworkInterface'

export default function Home() {
  const { isConnected, stats } = useSocket()

  const formatBytes = (bytes: string) => bytes || '0 Bytes'

  const getCpuPercent = () => {
    if (!stats?.cpu) return 0
    return parseFloat(stats.cpu.replace('%', ''))
  }

  const getRamPercent = () => {
    if (!stats?.ram) return 0
    return parseFloat(stats.ram.replace('%', ''))
  }

  const getDiskPercent = () => {
    if (!stats?.disk?.usedPercent) return 0
    return parseFloat(stats.disk.usedPercent.replace('%', ''))
  }

  const getTemperature = () => {
    return stats?.temperature || '--'
  }

  return (
    <>
      <div className="min-h-screen">
        <Navigation isConnected={isConnected} uptime={stats?.uptime} />

        <div className="container mx-auto px-4 sm:px-6 pb-8 sm:pb-12">
          {/* Quick Stats Summary Bar */}
          <div className="gradient-bg rounded-2xl p-4 sm:p-6 shadow-xl mb-6 card-hover border-gray-300/80">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-primary flex items-center">
                <i className="fas fa-tachometer-alt text-blue-500 mr-3"></i>
                System Overview
              </h2>
              <div className="status-pill">
                <i className="fas fa-pulse text-xs mr-1"></i>Live
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 ">
              <div className="text-center p-3 rounded-xl border border-blue-200/60 hover:border-blue-300/80 transition-all duration-300">
                <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {stats?.cpu || '--'}
                </div>
                <div className="text-xs sm:text-sm text-secondary">CPU Usage</div>
              </div>
              <div className="text-center p-3 rounded-xl border border-green-200/60 hover:border-green-300/80 transition-all duration-300">
                <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {stats?.ram || '--'}
                </div>
                <div className="text-xs sm:text-sm text-secondary">RAM Usage</div>
              </div>
              <div className="text-center p-3 rounded-xl border border-purple-200/60 hover:border-purple-300/80 transition-all duration-300">
                <div className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                  {stats?.disk?.usedPercent || '--'}
                </div>
                <div className="text-xs sm:text-sm text-secondary">Disk Usage</div>
              </div>
              <div className="text-center p-3 rounded-xl border border-orange-200/60 hover:border-orange-300/80 transition-all duration-300">
                <div className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                  {getTemperature()}
                </div>
                <div className="text-xs sm:text-sm text-secondary">Temperature</div>
              </div>
            </div>
          </div>

          {/* Real-time Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {/* CPU History Chart */}
            <div className="gradient-bg rounded-xl p-4 sm:p-6 shadow-lg border border-gray-300/80 dark:border-gray-700/50 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 card-hover backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-50/80 dark:bg-blue-500/20 rounded-lg border border-blue-200/60 dark:border-0">
                    <i className="fas fa-chart-line text-blue-600 dark:text-blue-400"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-primary">CPU History</h3>
                </div>
                <div className="status-pill text-xs">
                  <i className="fas fa-pulse mr-1 text-blue-500 dark:text-blue-400"></i>Live
                </div>
              </div>
              <div className="h-40 sm:h-48">
                {stats?.cpu_history && stats.cpu_history.length > 0 ? (
                  <LineChart
                    data={stats.cpu_history}
                    label="CPU Usage"
                    color="#60A5FA"
                    dataKey="usage"
                    maxValue={100}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-secondary">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Loading...
                  </div>
                )}
              </div>
            </div>

            {/* Memory History Chart */}
            <div className="gradient-bg rounded-xl p-4 sm:p-6 shadow-lg border border-gray-300/80 dark:border-gray-700/50 hover:border-green-500/50 dark:hover:border-green-500/50 transition-all duration-300 card-hover backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-50/80 dark:bg-green-500/20 rounded-lg border border-green-200/60 dark:border-0">
                    <i className="fas fa-chart-area text-green-600 dark:text-green-400"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-primary">Memory History</h3>
                </div>
                <div className="status-pill text-xs">
                  <i className="fas fa-pulse mr-1 text-green-500 dark:text-green-400"></i>Live
                </div>
              </div>
              <div className="h-40 sm:h-48">
                {stats?.memory_history && stats.memory_history.length > 0 ? (
                  <LineChart
                    data={stats.memory_history}
                    label="Memory Usage"
                    color="#34D399"
                    dataKey="usage"
                    maxValue={100}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-secondary">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Loading...
                  </div>
                )}
              </div>
            </div>

            {/* Network History Chart */}
            <div className="gradient-bg rounded-xl p-4 sm:p-6 shadow-lg border border-gray-300/80 dark:border-gray-700/50 hover:border-purple-500/50 dark:hover:border-cyan-500/50 transition-all duration-300 card-hover backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-50/80 dark:bg-cyan-500/20 rounded-lg border border-purple-200/60 dark:border-0">
                    <i className="fas fa-signal text-purple-600 dark:text-cyan-400"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-primary">Network Traffic</h3>
                </div>
                <div className="status-pill text-xs">
                  <i className="fas fa-pulse mr-1 text-purple-500 dark:text-cyan-400"></i>Live
                </div>
              </div>
              <div className="h-40 sm:h-48">
                {stats?.network_history && stats.network_history.length > 0 ? (
                  <LineChart
                    data={stats.network_history.map((item) => ({
                      value: (item.input || 0) + (item.output || 0),
                    }))}
                    label="Network Traffic"
                    color="#22D3EE"
                    dataKey="value"
                    formatAsBytes={true}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-secondary">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Loading...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Network Interfaces Section */}
          <div className="gradient-bg rounded-xl p-4 sm:p-6 shadow-lg border border-gray-300/80 dark:border-gray-700/50 hover:border-purple-500/50 dark:hover:border-cyan-500/50 transition-all duration-300 card-hover backdrop-blur-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-50/80 dark:bg-cyan-500/20 rounded-lg border border-purple-200/60 dark:border-0">
                  <i className="fas fa-network-wired text-purple-600 dark:text-cyan-400 text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-primary">Network Interfaces</h3>
                  <p className="text-xs text-secondary">All active network adapters</p>
                </div>
              </div>
              <div className="status-pill">
                <i className="fas fa-ethernet mr-1 text-purple-500 dark:text-cyan-400"></i>
                {stats?.network?.length || 0} Interfaces
              </div>
            </div>
            <NetworkInterface interfaces={stats?.network || []} />
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* CPU Usage Card */}
            <div className="gradient-bg rounded-xl p-4 sm:p-6 shadow-lg border border-gray-300/80 dark:border-gray-700/50 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 card-hover backdrop-blur-sm">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-blue-50/80 dark:bg-blue-500/20 rounded-lg border border-blue-200/60 dark:border-0">
                    <i className="fas fa-microchip text-blue-600 dark:text-blue-400 text-sm sm:text-lg"></i>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-primary">CPU Usage</h2>
                    <p className="text-xs text-secondary">{stats?.cpu_name || 'Loading...'}</p>
                  </div>
                </div>
                <div className="status-pill text-xs sm:text-sm">
                  <i className="fas fa-eye text-xs mr-1 text-blue-500 dark:text-blue-400"></i>Live
                </div>
              </div>
              <div className="text-2xl sm:text-4xl font-bold mb-2 text-primary">
                {stats?.cpu || '0%'}
              </div>
              <div className="flex items-center text-xs sm:text-sm text-secondary mb-3">
                <i className="fas fa-layer-group text-xs mr-1"></i>
                <span>{stats?.cpu_cores || '--'} cores</span>
              </div>
              <div className="mt-3 sm:mt-4 space-y-2">
                <div className="flex justify-between text-xs text-secondary">
                  <span>Load Average</span>
                </div>
                <div className="grid grid-cols-3 gap-1 sm:gap-2">
                  <div className=" rounded p-1.5 sm:p-2 text-center">
                    <div className="text-xs text-secondary">1m</div>
                    <div className="font-semibold text-primary text-xs sm:text-sm">
                      {stats?.load_average?.[0]?.toFixed(2) || '--'}
                    </div>
                  </div>
                  <div className=" rounded p-1.5 sm:p-2 text-center">
                    <div className="text-xs text-secondary">5m</div>
                    <div className="font-semibold text-primary text-xs sm:text-sm">
                      {stats?.load_average?.[1]?.toFixed(2) || '--'}
                    </div>
                  </div>
                  <div className=" rounded p-1.5 sm:p-2 text-center">
                    <div className="text-xs text-secondary">15m</div>
                    <div className="font-semibold text-primary text-xs sm:text-sm">
                      {stats?.load_average?.[2]?.toFixed(2) || '--'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RAM Usage Card */}
            <div className="gradient-bg rounded-xl p-4 sm:p-6 shadow-lg border border-gray-300/80 dark:border-gray-700/50 hover:border-green-500/50 dark:hover:border-green-500/50 transition-all duration-300 card-hover backdrop-blur-sm">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-green-50/80 dark:bg-green-500/20 rounded-lg border border-green-200/60 dark:border-0">
                    <i className="fas fa-memory text-green-600 dark:text-green-400 text-sm sm:text-lg"></i>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-primary">RAM Usage</h2>
                    <p className="text-xs text-secondary">System Memory</p>
                  </div>
                </div>
                <div className="status-pill text-xs sm:text-sm">
                  <i className="fas fa-eye text-xs mr-1 text-green-500 dark:text-green-400"></i>Live
                </div>
              </div>
              <div className="text-2xl sm:text-4xl font-bold mb-2 text-primary">
                {stats?.ram || '0%'}
              </div>
              <p className="text-xs sm:text-sm text-secondary mb-3">
                {stats?.ram_text || 'Calculating...'}
              </p>
              <div className="mt-3 sm:mt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-500 dark:to-emerald-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getRamPercent()}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Disk Usage Card */}
            <div className="gradient-bg rounded-xl p-4 sm:p-6 shadow-lg border border-gray-300/80 dark:border-gray-700/50 hover:border-orange-500/50 dark:hover:border-purple-500/50 transition-all duration-300 card-hover backdrop-blur-sm">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-orange-50/80 dark:bg-purple-500/20 rounded-lg border border-orange-200/60 dark:border-0">
                    <i className="fas fa-hdd text-orange-600 dark:text-purple-400 text-sm sm:text-lg"></i>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-primary">Disk Usage</h2>
                    <p className="text-xs text-secondary">Storage Space</p>
                  </div>
                </div>
                <div className="status-pill text-xs sm:text-sm">
                  <i className="fas fa-eye text-xs mr-1 text-orange-500 dark:text-purple-400"></i>Live
                </div>
              </div>
              <div className="text-2xl sm:text-4xl font-bold mb-2 text-primary">
                {stats?.disk?.usedPercent || '0%'}
              </div>
              <p className="text-xs sm:text-sm text-secondary mb-1">
                Used: {stats?.disk?.used || '--'} / {stats?.disk?.total || '--'}
              </p>
              <p className="text-xs sm:text-sm text-secondary mb-3">
                Free: {stats?.disk?.available || '--'}
              </p>
              <div className="mt-3 sm:mt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-amber-500 dark:from-purple-500 dark:to-violet-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getDiskPercent()}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* System Info Card */}
            <div className="gradient-bg rounded-xl p-4 sm:p-6 shadow-lg border border-gray-300/80 dark:border-gray-700/50 hover:border-yellow-500/50 dark:hover:border-yellow-500/50 transition-all duration-300 card-hover backdrop-blur-sm">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-yellow-50/80 dark:bg-yellow-500/20 rounded-lg border border-yellow-200/60 dark:border-0">
                    <i className="fas fa-info-circle text-yellow-600 dark:text-yellow-400 text-sm sm:text-lg"></i>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-primary">System Info</h2>
                    <p className="text-xs text-secondary">Hardware Details</p>
                  </div>
                </div>
                <div className="status-pill text-xs sm:text-sm">
                  <i className="fas fa-desktop text-xs mr-1 text-yellow-600 dark:text-yellow-400"></i>Details
                </div>
              </div>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex justify-between items-center p-1.5 sm:p-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-server text-xs text-secondary"></i>
                    <span className="text-secondary text-xs sm:text-sm">Hostname:</span>
                  </div>
                  <span className="font-semibold text-primary text-xs sm:text-sm">
                    {stats?.hostname || '--'}
                  </span>
                </li>
                <li className="flex justify-between items-center p-1.5 sm:p-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <i className="fab fa-linux text-xs text-secondary"></i>
                    <span className="text-secondary text-xs sm:text-sm">Platform:</span>
                  </div>
                  <span className="font-semibold text-primary text-xs sm:text-sm">
                    {stats?.platform || '--'}
                  </span>
                </li>
                <li className="flex justify-between items-center p-1.5 sm:p-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-cogs text-xs text-secondary"></i>
                    <span className="text-secondary text-xs sm:text-sm">Architecture:</span>
                  </div>
                  <span className="font-semibold text-primary text-xs sm:text-sm">
                    {stats?.architecture || '--'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Network Speed Card */}
            <div className="gradient-bg rounded-xl p-4 sm:p-6 shadow-lg border border-gray-300/80 dark:border-gray-700/50 hover:border-purple-500/50 dark:hover:border-cyan-500/50 transition-all duration-300 card-hover backdrop-blur-sm">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-purple-50/80 dark:bg-cyan-500/20 rounded-lg border border-purple-200/60 dark:border-0">
                    <i className="fas fa-wifi text-purple-600 dark:text-cyan-500 text-sm sm:text-lg"></i>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-primary">Network Speed</h2>
                    <p className="text-xs text-secondary">Real-time Traffic</p>
                  </div>
                </div>
                <div className="status-pill text-xs sm:text-sm">
                  <i className="fas fa-broadcast-tower text-xs mr-1 text-purple-500 dark:text-cyan-400"></i>Live
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700/50">
                  <div className="flex justify-between items-center mb-2 sm:mb-3">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-download text-purple-600 dark:text-cyan-500 text-xs sm:text-sm"></i>
                      <span className="text-secondary text-xs sm:text-sm">Download</span>
                    </div>
                    <span className="text-purple-600 dark:text-cyan-300 font-semibold text-xs sm:text-sm">
                      {stats?.network_speed?.download || '0 KB/s'}
                    </span>
                  </div>
                </div>
                <div className="p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700/50">
                  <div className="flex justify-between items-center mb-2 sm:mb-3">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-upload text-orange-500 dark:text-emerald-400 text-xs sm:text-sm"></i>
                      <span className="text-secondary text-xs sm:text-sm">Upload</span>
                    </div>
                    <span className="text-orange-600 dark:text-emerald-300 font-semibold text-xs sm:text-sm">
                      {stats?.network_speed?.upload || '0 KB/s'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 bg-white/95 dark:bg-gray-900/80 backdrop-blur-md glass-effect border-t border-gray-300/80 dark:border-gray-700/50 mt-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <i className="fas fa-chart-line text-blue-600 dark:text-blue-400 text-xl"></i>
                <h3 className="text-xl font-bold animated-text">StatsMonit</h3>
              </div>
              <p className="text-secondary text-sm mb-3">
                Real-time System Monitoring Dashboard
              </p>

              <div className="mb-4">
                <a
                  href="https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-green-600 dark:to-green-700 hover:opacity-90 rounded-lg transition-all duration-300 text-white text-sm font-medium"
                >
                  <i className="fab fa-whatsapp text-lg"></i>
                  <span>Antidonasi Inc.</span>
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-secondary">
                <span>© 2025 Antidonasi Inc.</span>
                <span>•</span>
                <span>Powered by Next.js</span>
                <span>•</span>
                <span>Built with ❤️</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
