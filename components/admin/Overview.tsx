"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { name: "Ene", entradas: 40, usuarios: 24 },
  { name: "Feb", entradas: 30, usuarios: 13 },
  { name: "Mar", entradas: 20, usuarios: 98 },
  { name: "Abr", entradas: 27, usuarios: 39 },
  { name: "May", entradas: 18, usuarios: 48 },
  { name: "Jun", entradas: 23, usuarios: 38 },
  { name: "Jul", entradas: 34, usuarios: 43 },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Bar dataKey="entradas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="usuarios" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

