import { useState, useCallback, useEffect } from 'react'
import { customFetch } from '@/lib/customFetch'
import { buildApiUrl } from '@/lib/api'
import type { DashboardStats } from '@/lib/dashboard-types'

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await customFetch(buildApiUrl('admin/stats'))
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      const data: DashboardStats = await response.json()
      setStats(data)
    } catch (err) {
      setError('No se pudieron cargar las estadísticas del dashboard.')
      console.error('Dashboard stats error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, isLoading, error, refetch: fetchStats }
}
