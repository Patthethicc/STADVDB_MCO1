"use client"

import * as React from "react"
import ChartInteractive from "@/components/chart-interactive"
import Loading from "@/components/loading"
import { DataTable } from "@/components/data-table"
import { useHeaderTitle } from "@/components/header-title-context"
import { Button } from "@/components/ui/button"

export default function Page() {
  const [gender, setGender] = React.useState<"M" | "F">("M")
  const [data, setData] = React.useState<Record<string, unknown>[] | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const { setTitle } = useHeaderTitle()
  React.useEffect(() => setTitle("OLAP: Gender-specific Sales"), [setTitle])

  React.useEffect(() => {
    const abort = new AbortController()
    let active = true

    async function load() {
      setLoading(true)
      setError(null)
      setData(null)

      try {
        const params = new URLSearchParams({ gender })
        const res = await fetch(`/api/olap-get-slice-gender?${params.toString()}`, {
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
        // Use type guards instead of `any` to satisfy eslint's no-explicit-any rule.
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
  }, [gender])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex items-center justify-between px-4 lg:px-6">
          <h2 className="text-lg font-semibold">Gender-specific Sales</h2>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={gender === "M" ? "default" : "outline"}
              onClick={() => setGender("M")}
            >
              Male
            </Button>
            <Button
              size="sm"
              variant={gender === "F" ? "default" : "outline"}
              onClick={() => setGender("F")}
            >
              Female
            </Button>
          </div>
        </div>

        <div className="px-4 lg:px-6">
          {loading ? (
            <Loading />
          ) : (
            <ChartInteractive
              data={data || []}
              chart="bar"
              xKey="gender"
              yKeys={["total_revenue"]}
              title={`Sales (${gender === "M" ? "Male" : "Female"})`}
              description={`Aggregated revenue for ${gender === "M" ? "Male" : "Female"} users`}
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