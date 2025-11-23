'use client'

export default function LoadingScreen({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full animate-ping opacity-75"></div>
          <div className="absolute top-2 left-2 w-16 h-16 border-4 border-purple-500 rounded-full animate-pulse opacity-60"></div>
          <div className="absolute top-4 left-4 w-12 h-12 border-4 border-green-500 rounded-full animate-bounce opacity-80"></div>
        </div>
        <h2 className="text-3xl font-bold animated-text mb-2">StatsMonit</h2>
        <p className="text-secondary text-lg">Initializing monitoring systems...</p>
        <div className="mt-4 w-48 h-1 bg-gray-700 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
