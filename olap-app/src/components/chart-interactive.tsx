"use client"

import * as React from "react"
import { Bar, ComposedChart, CartesianGrid, XAxis, Line, Area } from "recharts"
import { useRouter } from "next/navigation"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

// Clean, focused ChartInteractive implementation.

const chartConfig = {
  visitors: { label: "Visitors" },
  desktop: { label: "Desktop", color: "hsl(var(--chart-1))" },
  mobile: { label: "Mobile", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig

export interface ChartInteractiveProps {
  data?: Array<Record<string, unknown>>
  chart?: "bar" | "line" | "area"
  xKey?: string
  yKeys?: string[]
  title?: string
  description?: string
  stacked?: boolean
  dayOlap?: boolean
  // routeButtons may now provide either an href (navigate) or an api path
  routeButtons?: { label: string; href?: string; api?: string }[]
  // optional callback invoked when a button with an `api` is clicked
  onRouteClick?: (apiPath: string) => void
}

export default function ChartInteractive({
  data: propData,
  chart: propChart = "bar",
  xKey: propXKey,
  yKeys: propYKeys,
  title,
  description,
  stacked = false,
  dayOlap = false,
  routeButtons = [],
  onRouteClick,
}: ChartInteractiveProps) {
  const router = useRouter()

  // If no data is provided, render nothing (user requested no template/fallback)
  if (!propData || propData.length === 0) return null

  const sourceData = React.useMemo(() => propData!, [propData])

  const inferredXKey = React.useMemo(() => {
    if (propXKey) return propXKey
    const sample = (sourceData[0] || {}) as Record<string, unknown>
    if (Object.prototype.hasOwnProperty.call(sample, "date")) return "date"
    if (Object.prototype.hasOwnProperty.call(sample, "x")) return "x"
    return Object.keys(sample)[0] ?? ""
  }, [propXKey, sourceData])

  const inferredYKeys = React.useMemo(() => {
    if (propYKeys && propYKeys.length) return propYKeys
    const sample = (sourceData[0] || {}) as Record<string, unknown>
    return Object.keys(sample).filter((k) => k !== inferredXKey)
  }, [propYKeys, sourceData, inferredXKey])

  const looksLikeDate = (v: unknown) => {
    if (v == null) return false
    return !Number.isNaN(Date.parse(String(v)))
  }

  type Granularity = "year" | "month" | "day"
  const [granularity, setGranularity] = React.useState<Granularity>("month")

  const aggregated = React.useMemo(() => {
    if (!dayOlap) return sourceData
    const sampleX = sourceData.length ? (sourceData[0] as Record<string, unknown>)[inferredXKey] : null
    if (!looksLikeDate(sampleX)) return sourceData

    const buckets = new Map<string, Record<string, unknown>>()

    const getBucketKey = (d: Date) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, "0")
      const dd = String(d.getDate()).padStart(2, "0")
      if (granularity === "year") return `${y}`
      if (granularity === "month") return `${y}-${m}`
      return `${y}-${m}-${dd}`
    }

    for (const row of sourceData) {
      const raw = (row as Record<string, unknown>)[inferredXKey]
      const d = new Date(String(raw))
      if (Number.isNaN(d.getTime())) continue
      const key = getBucketKey(d)
      if (!buckets.has(key)) buckets.set(key, { [inferredXKey]: key })
      const bucket = buckets.get(key) as Record<string, unknown>
      for (const yk of inferredYKeys) {
        const val = Number((row as Record<string, unknown>)[yk] ?? 0)
        if (Number.isNaN(val)) continue
        bucket[yk] = (Number(bucket[yk] ?? 0) || 0) + val
      }
    }

    return Array.from(buckets.entries())
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([, v]) => v)
  }, [sourceData, dayOlap, granularity, inferredXKey, inferredYKeys])

  const finalData = dayOlap ? aggregated : sourceData
  const finalXKey = inferredXKey

  const formatX = (val: unknown) => {
    if (!dayOlap) return String(val)
    const s = String(val)
    const parts = s.split("-")
    if (parts.length === 1) return parts[0]
    if (parts.length === 2) {
      const [y, m] = parts
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      return `${monthNames[Number(m) - 1] ?? m} ${y}`
    }
    const [y, m, d] = parts
    return `${d}/${m}/${y}`
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </div>

        <div className="flex items-center gap-2">
          {dayOlap && (
            <ToggleGroup type="single" value={granularity} onValueChange={(v) => v && setGranularity(v as Granularity)}>
              <ToggleGroupItem value="year">Y</ToggleGroupItem>
              <ToggleGroupItem value="month">M</ToggleGroupItem>
              <ToggleGroupItem value="day">D</ToggleGroupItem>
            </ToggleGroup>
          )}

          {routeButtons && routeButtons.length > 0 && (
            <div className="flex items-center gap-2">
              {routeButtons.map((b, idx) => {
                const key = b.href ?? b.api ?? String(idx)
                return (
                  <Button
                    key={key}
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      // Prefer api callback when provided (page-level handler)
                      if (b.api && onRouteClick) return onRouteClick(b.api)
                      // If no callback provided but an api path exists, fall back to a full-page reload
                      if (b.api && !onRouteClick) {
                        try {
                          const url = new URL(window.location.href)
                          url.searchParams.set("api", b.api)
                          // navigate to the same page with ?api=... (full reload)
                          window.location.href = url.toString()
                          return
                        } catch (e) {
                          // fallback: just set location
                          window.location.href = `?api=${encodeURIComponent(b.api)}`
                          return
                        }
                      }
                      // Fallback to navigation when href provided
                      if (b.href) return router.push(b.href)
                    }}
                  >
                    {b.label}
                  </Button>
                )
              })}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <ComposedChart data={finalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={finalXKey} tickFormatter={formatX} />
            {inferredYKeys.map((key, idx) => {
              const cfg = (chartConfig as Record<string, { label?: string; color?: string }>)[key] || {}
              const color = (cfg.color as string) || (idx === 0 ? "var(--color-desktop)" : "var(--color-mobile)")
              if (propChart === "line") return <Line key={key} dataKey={key} stroke={color} strokeWidth={2} dot={false} />
              if (propChart === "area") return <Area key={key} dataKey={key} stroke={color} fill={color} stackId={stacked ? "a" : undefined} />
              return <Bar key={key} dataKey={key} fill={color} radius={[4, 4, 0, 0]} stackId={stacked ? "a" : undefined} />
            })}

            <ChartTooltip content={<ChartTooltipContent />} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>

      <CardAction />
    </Card>
  )
}