import { useEffect, useState } from "react"

type RowData = Record<string, unknown>

function UsersPanel() {
  const [users, setUsers] = useState<RowData[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<RowData | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})

  async function fetchUsers() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/table-users", { cache: "no-store" })
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
      const json = await res.json()
      setUsers(json)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (selected) {
      const map: Record<string, string> = {}
      Object.keys(selected).forEach((k) => (map[k] = String(selected[k] ?? "")))
      setForm(map)
    } else {
      setForm({})
    }
  }, [selected])

  async function handleUpdate(e?: React.FormEvent) {
    e?.preventDefault()
    if (!selected || !selected["id"]) return
    const id = String(selected["id"])
    try {
      setLoading(true)
      const res = await fetch(`/api/table-users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const body = await res.text()
        throw new Error(body || `Update failed ${res.status}`)
      }
      await fetchUsers()
      setSelected(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  if (loading && !users) return <div className="p-4">Loading users…</div>
  if (error && !users) return <div className="p-4 text-red-600">Error: {error}</div>
  if (!users || users.length === 0) return <div className="p-4">No users</div>

  const columns = Object.keys(users[0])

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Select</th>
              {columns.map((c) => (
                <th key={c} className="p-2 text-left">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr
                key={idx}
                className={`cursor-pointer border-t ${selected === u ? "bg-slate-100" : ""}`}
                onClick={() => setSelected(u)}
              >
                <td className="p-2">
                  <input
                    type="radio"
                    name="selectedUser"
                    checked={selected === u}
                    onChange={() => setSelected(u)}
                  />
                </td>
                {columns.map((c) => (
                  <td key={c} className="p-2">{String(u[c] ?? "")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <form onSubmit={handleUpdate} className="space-y-2 rounded border p-3 bg-white">
          <div className="flex items-center justify-between">
            <strong>Edit user</strong>
            <button
              type="button"
              className="text-sm text-gray-600"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.keys(form).map((key) => (
              <div key={key}>
                <label className="block text-xs text-gray-600">{key}</label>
                <input
                  className="w-full rounded border px-2 py-1"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded bg-primary px-3 py-1 text-white"
              disabled={loading}
            >
              {loading ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className="rounded border px-3 py-1"
              onClick={() => {
                setForm(Object.keys(selected!).reduce((acc, k) => ({ ...acc, [k]: String(selected![k] ?? "") }), {}))
              }}
            >
              Reset
            </button>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
        </form>
      )}
    </div>
  )
}

export default UsersPanel