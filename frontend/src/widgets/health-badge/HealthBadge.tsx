import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchHealth } from '@/shared/api/health'
import { Activity } from 'lucide-react'

export const HealthBadge: React.FC = () => {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['system-health'],
    queryFn: fetchHealth,
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border-0">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
        <span>Tekshirilmoqda...</span>
      </div>
    )
  }

  if (isError || !data?.success) {
    return (
      <div className="flex items-center space-x-1.5 text-xs text-amber-300 bg-amber-950/40 px-2.5 py-1 rounded-md border-0" title="Backend ulanishi kutilmoqda">
        <Activity className="w-3.5 h-3.5 text-amber-400" />
        <span>Lokal rejim</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-1.5 text-xs text-emerald-300 bg-emerald-950/40 px-2.5 py-1 rounded-md border-0" title={`API: ${data.data.application} v${data.data.version}`}>
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      <span className="font-medium">Backend: {data.data.status}</span>
    </div>
  )
}

export default HealthBadge
