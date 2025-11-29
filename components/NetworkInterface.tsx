'use client'

interface NetworkInterfaceData {
  interface: string
  inputBytes: string
  outputBytes: string
  totalBytes: string
  rawInputBytes?: number
  rawOutputBytes?: number
}

interface NetworkInterfaceProps {
  interfaces: NetworkInterfaceData[]
}

export default function NetworkInterface({ interfaces }: NetworkInterfaceProps) {
  if (!interfaces || interfaces.length === 0) {
    return (
      <div className="text-center text-secondary py-8">
        <i className="fas fa-network-wired text-3xl mb-3 opacity-50"></i>
        <p>No network interfaces detected</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-300 dark:border-gray-700/50">
            <th className="text-left py-3 px-2 sm:px-4 text-primary font-semibold">
              <i className="fas fa-network-wired mr-2"></i>
              Interface
            </th>
            <th className="text-right py-3 px-2 sm:px-4 text-primary font-semibold">
              <i className="fas fa-download mr-1"></i>
              <span className="hidden sm:inline">Download</span>
              <span className="inline sm:hidden">RX</span>
            </th>
            <th className="text-right py-3 px-2 sm:px-4 text-primary font-semibold">
              <i className="fas fa-upload mr-1"></i>
              <span className="hidden sm:inline">Upload</span>
              <span className="inline sm:hidden">TX</span>
            </th>
            <th className="text-right py-3 px-2 sm:px-4 text-primary font-semibold hidden md:table-cell">
              <i className="fas fa-exchange-alt mr-1"></i>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {interfaces.map((iface, index) => (
            <tr
              key={index}
              className="border-b border-gray-200 dark:border-gray-700/30 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-200"
            >
              <td className="py-3 px-2 sm:px-4">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      iface.interface.startsWith('lo')
                        ? 'bg-yellow-400'
                        : iface.interface.startsWith('docker') ||
                          iface.interface.startsWith('veth')
                        ? 'bg-blue-400'
                        : 'bg-green-400'
                    }`}
                  ></div>
                  <span className="font-mono font-semibold text-primary">
                    {iface.interface}
                  </span>
                </div>
              </td>
              <td className="py-3 px-2 sm:px-4 text-right font-mono text-primary">
                {iface.inputBytes}
              </td>
              <td className="py-3 px-2 sm:px-4 text-right font-mono text-primary">
                {iface.outputBytes}
              </td>
              <td className="py-3 px-2 sm:px-4 text-right font-mono text-primary hidden md:table-cell">
                {iface.totalBytes}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-secondary">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          <span>Active</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
          <span>Loopback</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
          <span>Virtual</span>
        </div>
      </div>
    </div>
  )
}
