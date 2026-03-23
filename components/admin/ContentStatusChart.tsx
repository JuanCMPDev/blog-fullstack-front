'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { ContentStatus } from '@/lib/dashboard-types'

interface Props {
  data: ContentStatus
}

const COLORS = {
  published: 'hsl(var(--chart-2))',
  draft: 'hsl(var(--muted-foreground))',
  scheduled: 'hsl(var(--chart-4))',
}

const LABELS = {
  published: 'Publicados',
  draft: 'Borradores',
  scheduled: 'Programados',
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0]
    return (
      <div className="rounded-lg border border-border/50 bg-card px-3 py-2 shadow-md text-sm">
        <p style={{ color: item.payload.color }} className="font-medium">{item.name}</p>
        <p className="text-muted-foreground">{item.value} posts</p>
      </div>
    )
  }
  return null
}

export function ContentStatusChart({ data }: Props) {
  const chartData = [
    { name: LABELS.published, value: data.published, color: COLORS.published },
    { name: LABELS.draft, value: data.draft, color: COLORS.draft },
    { name: LABELS.scheduled, value: data.scheduled, color: COLORS.scheduled },
  ].filter((d) => d.value > 0)

  const total = data.published + data.draft + data.scheduled

  return (
    <Card className="border-border/50 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Estado del contenido</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {total === 0 ? (
          <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">
            Sin datos disponibles
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="space-y-1.5 mt-1">
              {chartData.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-muted-foreground">{entry.name}</span>
                  </div>
                  <span className="font-medium tabular-nums">{entry.value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
