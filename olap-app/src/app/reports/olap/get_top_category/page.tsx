"use client"

import * as React from "react"
import ChartInteractive from "@/components/chart-interactive"
import Loading from "@/components/loading"
import { DataTable } from "@/components/data-table"
import { useHeaderTitle } from "@/components/header-title-context"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Page() {
  const [level, setLevel] = React.useState<"city" | "country">("city")
  const [data, setData] = React.useState<Record<string, unknown>[] | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const { setTitle } = useHeaderTitle()
  React.useEffect(() => setTitle("OLAP: Top category per location"), [setTitle])

  React.useEffect(() => {
    const abort = new AbortController()
    let active = true

    async function load() {
      setLoading(true)
      setError(null)
      setData(null)

      try {
        const params = new URLSearchParams({ p_level: level })
        const res = await fetch(`/api/olap-get-top-category-location?${params.toString()}`, {
          signal: abort.signal,
        })

        if (!res.ok) {
          const txt = await res.text()
          let parsed = txt
          try {
            const json = JSON.parse(txt)
            parsed = json.error ?? txt
          } catch {}
          throw new Error(parsed || `Fetch failed (${res.status})`)
        }

        const json = await res.json()
        if (active) setData(Array.isArray(json) ? json : [])
      } catch (err: unknown) {
        const hasName = (o: unknown): o is { name: unknown } =>
          typeof o === "object" && o !== null && "name" in o

        const errMessage = err instanceof Error ? err.message : String(err ?? "")

        const isAbort =
          (hasName(err) && String((err as { name: unknown }).name) === "AbortError") ||
          /abort|aborted/i.test(errMessage) ||
          /signal is aborted/i.test(errMessage)

        if (!isAbort) {
          const msg = err instanceof Error ? err.message : String(err)
          if (active) setError(msg)
          if (active) setData([])
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
      abort.abort()
    }
  }, [level])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex items-center justify-between px-4 lg:px-6">
          <h2 className="text-lg font-semibold">Top category per {level}</h2>
          <div className="flex items-center gap-2">
            <Select value={level} onValueChange={(v) => setLevel(v as "city" | "country")}> 
              <SelectTrigger size="sm" className="w-44">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="city">City</SelectItem>
                <SelectItem value="country">Country</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="px-4 lg:px-6">
          {loading ? (
            <Loading />
          ) : (
            <ChartInteractive
              data={data || []}
              chart="bar"
              xKey="location_name"
              yKeys={["total_revenue"]}
              title={`Top category per ${level}`}
              description={`Top product category per ${level}`}
              dayOlap={false}
            />
          )}
        </div>

        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : (
            <DataTable data={data || []} />
          )}
        </div>
      </div>
    </div>
  )
}
