"use client"

/**
 * Sparkline Component
 * - Minimal Recharts line chart used inside DetailDrawer
 * - Renders a 7-day price curve without axes, grid, or labels
 * - Stroke color changes based on positive (green) vs negative (red) trend
 */

import { LineChart, Line, ResponsiveContainer } from "recharts"

interface SparklineProps {
  data: number[]
  positive: boolean
}

export function Sparkline({ data, positive }: SparklineProps) {
  const chartData = data.map((price, i) => ({ index: i, price }))
  const strokeColor = positive ? "#22c55e" : "#ef4444"

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="price"
          stroke={strokeColor}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
