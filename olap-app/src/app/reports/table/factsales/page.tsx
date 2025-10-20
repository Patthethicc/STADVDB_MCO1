 
"use client"
import { DataTable } from "@/components/data-table"
import Loading from "@/components/loading"
import { useHeaderTitle } from "@/components/header-title-context"

import { useEffect, useState, useRef } from "react"

export default function Page() {
  const [data, setData] = useState<Record<string, unknown>[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchingAll, setFetchingAll] = useState(false);
  const [batchesFetched, setBatchesFetched] = useState(0);
  const [rowsFetched, setRowsFetched] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const { setTitle } = useHeaderTitle();
  useEffect(() => {
    setTitle("Database: FactSales Table");
  }, [setTitle]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    abortRef.current = controller;
    fetch("/api/table-factsales", { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to fetch");
        }
        return res.json();
      })
      .then((res) => {
        // Normalize response shapes from the API route
        // Possible shapes:
        // - { initialized: true, data: [...] }
        // - [{ batch_no: n, data: [...] }]  (RPC returns array)
        // - [{...}, {...}]  (direct rows)
        if (res && typeof res === "object") {
          const obj = res as Record<string, unknown>;
          // initialized shape
          if (obj.initialized && Array.isArray(obj.data)) {
            setData(obj.data as Record<string, unknown>[]);
            return;
          }

          // RPC array shape where top-level is array
          if (Array.isArray(res)) {
            const arr = res as unknown[];
            // If first element has a `data` array, use that
            if (arr.length > 0 && arr[0] && typeof arr[0] === "object") {
              const first = arr[0] as Record<string, unknown>;
              if (Array.isArray(first.data)) {
                setData(first.data as Record<string, unknown>[]);
                return;
              }
            }
            // Otherwise assume it's an array of row objects
            setData(arr as Record<string, unknown>[]);
            return;
          }

          // If response has a `data` property that's an array, use it
          if (Array.isArray(obj.data)) {
            setData(obj.data as Record<string, unknown>[]);
            return;
          }
        }

        // Fallback: empty array
        setData([]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const fetchAllBatches = async (batchSize = 1000) => {
    if (fetchingAll) return;
    setFetchingAll(true);
    setBatchesFetched(0);
    setRowsFetched(0);
    setError(null);

    let batchNo = 1;
    const accumulated: Record<string, unknown>[] = [];
    try {
      while (true) {
        const controller = new AbortController();
        abortRef.current = controller;
        const res = await fetch(`/api/table-factsales?p_batch_no=${batchNo}&p_batch_size=${batchSize}`, { signal: controller.signal });
        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: "unknown upstream" }));
          throw new Error(body.error || JSON.stringify(body));
        }
        const payload = await res.json();

        // Normalize payload to array of rows
        let rows: Record<string, unknown>[] = [];
        if (payload && typeof payload === "object") {
          const p = payload as Record<string, unknown> | unknown[];
          if (Array.isArray(p)) {
            const arr = p as unknown[];
            if (arr.length > 0 && arr[0] && typeof arr[0] === "object") {
              const first = arr[0] as Record<string, unknown>;
              // If payload is RPC wrapper [{batch_no, data}], extract inner data
              if (first.data !== undefined) {
                const raw = first.data;
                if (Array.isArray(raw)) {
                  rows = raw as Record<string, unknown>[];
                } else if (typeof raw === "string") {
                  try {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) rows = parsed as Record<string, unknown>[];
                    else rows = [];
                  } catch {
                    rows = [];
                  }
                } else {
                  // unknown shape inside data
                  rows = [];
                }
              } else {
                // not a wrapper, assume arr is rows
                rows = arr as Record<string, unknown>[];
              }
            } else {
              rows = arr as Record<string, unknown>[];
            }
          } else {
            // p is an object
            if (p.initialized && Array.isArray((p as Record<string, unknown>).data)) {
              rows = (p as Record<string, unknown>).data as Record<string, unknown>[];
            } else if (Array.isArray((p as Record<string, unknown>).data)) {
              rows = (p as Record<string, unknown>).data as Record<string, unknown>[];
            }
          }
        }

        accumulated.push(...rows);
        setBatchesFetched(batchNo);
        setRowsFetched(accumulated.length);

        const hasMore = rows.length >= batchSize;
        if (!hasMore) break;
        batchNo += 1;
      }

      setData(accumulated);
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string } | undefined;
      if (e && e.name === 'AbortError') {
        setError('Fetch cancelled');
      } else {
        setError((e && e.message) || String(err));
      }
    } finally {
      setFetchingAll(false);
      abortRef.current = null;
    }
  }

  const cancelFetchAll = () => {
    abortRef.current?.abort();
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center gap-4 px-4">
            <button
              className="btn btn-primary"
              onClick={() => fetchAllBatches(50000)}
              disabled={fetchingAll}
            >
              {fetchingAll ? 'Fetching...' : 'Fetch all rows (batch)'}
            </button>
            {fetchingAll && (
              <button className="btn btn-ghost" onClick={cancelFetchAll}>Cancel</button>
            )}
            <div className="ml-auto text-sm text-muted-foreground">
              Batches: {batchesFetched} • Rows: {rowsFetched}
            </div>
          </div>

          {loading ? (
            <Loading />
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