"use client"

import type React from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { data as mockData, type DataEntry } from "@/lib/mock-overview"

const useChartData = () => {
  return mockData
}

const Chart = ({
  children,
  data,
}: {
  children: React.ReactNode
  data: DataEntry[]
}) => {
  return (
    <div className="w-full" style={{ height: "400px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
              boxShadow: "var(--shadow-sm)",
            }}
            labelStyle={{ color: "hsl(var(--popover-foreground))" }}
            itemStyle={{ color: "hsl(var(--popover-foreground))" }}
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
          />
          {children}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function Overview() {
  const data = useChartData()

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Chart data={data}>
        <Bar dataKey="entradas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="usuarios" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
      </Chart>
    </div>
  )
}

