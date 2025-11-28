"use client"

import React, { useEffect, useState } from "react"
import { GalleryVerticalEnd } from "lucide-react"
import { UpdateUser } from "@/components/update-user"
import UsersPanel from "@/components/users-panel"

type RowData = Record<string, unknown>

export default function Page() {
  const [data, setData] = useState<RowData[] | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // setLoading(true)
    // fetch("/api/example").then(r => r.json()).then(setData).catch(e => setError(String(e))).finally(() => setLoading(false))
  }, [])

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <UpdateUser />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
+      <div className="relative bg-muted lg:block p-4 overflow-auto">
+        <UsersPanel />
+      </div>
      </div>
    </div>
  )
}