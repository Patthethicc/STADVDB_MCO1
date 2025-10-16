 
"use client"
import ChartInteractive from "@/components/chart-interactive"
import { DataTable } from "@/components/data-table"
 
import { useHeaderTitle } from "@/components/header-title-context"

import { useEffect, useState } from "react"

export default function Page() {
  const [data, setData] = useState<Record<string, unknown>[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  
  const [apiPath] = useState<string>(() => {
    try {
      if (typeof window === "undefined") return '/api/sales-by-age'
      const url = new URL(window.location.href)
      const q = url.searchParams.get('api')
      return q || '/api/sales-by-age'
    } catch (e) {
      console.log(e);
      return '/api/sales-by-age'
    }
  })

  const { setTitle } = useHeaderTitle();
  useEffect(() => {
    setTitle("Reports: Age-wise Sales");
  }, [setTitle]);

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(apiPath)
      .then(async (res) => {
        if (!res.ok) {
          
          let errText = await res.text()
          try {
            const parsed = JSON.parse(errText)
            errText = parsed.error || errText
          } catch (_) {
            console.log(_);
          }
          throw new Error(errText || "Failed to fetch")
        }
        return res.json()
      })
      .then((res) => setData(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [apiPath]);

  
  const routeButtons = [
    { label: "Age", api: "/api/sales-by-age" },
    { label: "Age Group", api: "/api/sales-by-age-group" },
  ]

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          
          <div className="px-4 lg:px-6">
            <ChartInteractive
              data={data || []}
              chart="bar"
              title="Age-wise Sales"
              description="Age used as metric for sales"
              dayOlap={false}
              routeButtons={routeButtons}
            />
          </div>
          {loading ? (
            <div className="px-4">Loading...</div>
          ) : error ? (
            <div className="px-4 text-red-500">Error: {error}</div>
          ) : (
            <DataTable data={data || []} />
          )}
        </div>
      </div>
    </div>
  );
}