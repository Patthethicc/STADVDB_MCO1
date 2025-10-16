 
"use client"
import ChartInteractive from "@/components/chart-interactive"
import { DataTable } from "@/components/data-table"
import { useHeaderTitle } from "@/components/header-title-context"

import { useEffect, useState } from "react"

export default function Page() {
  const [data, setData] = useState<Record<string, unknown>[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { setTitle } = useHeaderTitle();
  useEffect(() => {
    setTitle("Database: FactSales Table");
  }, [setTitle]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/table-factsales")
      .then(async (res) => {
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to fetch");
        }
        return res.json();
      })
      .then((res) => setData(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
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