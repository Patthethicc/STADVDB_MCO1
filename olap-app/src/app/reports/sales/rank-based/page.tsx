"use client"
import { ChartAreaInteractive } from "@/components/chart-regular-area-interactive"
import ChartBarInteractive from "@/components/chart-bar-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import data from "@/app/data.json"
import { useHeaderTitle } from "@/components/header-title-context"
import { useEffect } from "react"

export default function Page() {
  const { setTitle } = useHeaderTitle();
  useEffect(() => {
    setTitle("Reports: Rank-based Sales");
  }, [setTitle]);
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartBarInteractive />
          </div>
          <DataTable data={data} />
        </div>
      </div>
    </div>
  )
}