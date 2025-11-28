"use client"

import React, { useEffect, useState } from "react"

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
    <main className="p-4">
      <h1 className="text-xl font-semibold">Delete User</h1>
    </main>
  )
}