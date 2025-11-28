"use client"
import { DataTable } from "@/components/data-table"
import Loading from "@/components/loading"
import { useHeaderTitle } from "@/components/header-title-context"

import { useEffect, useMemo, useState } from "react"
import { Field } from "@/components/ui/field"
import UserModal from "@/components/user-modal"
import EditUserForm from "@/components/edit-user-form"

export default function Page() {
  // ...existing code...
  const [data, setData] = useState<Record<string, unknown>[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  const { setTitle } = useHeaderTitle();
  useEffect(() => {
    setTitle("Database: User Directory");
  }, [setTitle]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/table-users")
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

  // client-side filtering logic
  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim();
    if (!q) return data;
    const qLower = q.toLowerCase();

    // gender must be queried with single quotes exactly e.g. 'M' or 'F'
    const isGenderQuery = /^'([mfMF])'$/.test(q);

    return data.filter((row) => {
      for (const [k, v] of Object.entries(row)) {
        if (v == null) continue;
        const s = String(v).toLowerCase();

        if (k.toLowerCase() === "gender") {
          if (isGenderQuery) {
            // match only if query equals the gender wrapped in single quotes
            const raw = q.replace(/'/g, "").toLowerCase();
            if (s === raw) return true;
          }
          continue; // skip gender when not using quoted form
        }

        // normal substring match for other columns
        if (s.includes(qLower)) return true;
      }
      return false;
    });
  }, [data, query]);

  // handlers
  function handleRowClick(row: Record<string, unknown>) {
    setSelected(row);
  }
  async function handleDelete(id: string | number | undefined) {
    if (!id) return;
    // adapt endpoint to your API
    const ok = confirm("Delete this user?");
    if (!ok) return;
    try {
      const res = await fetch(`/api/table-users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      // remove locally
      setData((d) => d?.filter((r) => r.id !== id) ?? null);
      setSelected(null);
    } catch (e) {
      alert("Delete failed");
    }
  }
  function onEditSaved(updated: Record<string, unknown>) {
    // update local data and close edit
    setData((prev) => prev?.map((r) => (r.id === updated.id ? updated : r)) ?? null);
    setShowEdit(false);
    setSelected(updated);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4">
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="Search all columns (gender requires quotes e.g. 'M')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <Loading />
          ) : error ? (
            <div className="px-4 text-red-500">Error: {error}</div>
          ) : (
            <>
              <DataTable data={filtered} onRowClick={handleRowClick} />
              {selected && (
                <UserModal
                  user={selected}
                  onClose={() => setSelected(null)}
                  onEdit={() => setShowEdit(true)}
                  onDelete={() => handleDelete(selected.id as any)}
                />
              )}

              {showEdit && selected && (
                <EditUserForm
                  user={selected}
                  onCancel={() => setShowEdit(false)}
                  onSaved={onEditSaved}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}