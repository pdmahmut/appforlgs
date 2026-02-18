import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from "recharts";

function formatDateTR(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("tr-TR");
}

export default function SchoolNetTrendChart({ endpoint = "/dashboard/school-analytics" }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(endpoint, { signal: controller.signal });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const json = await res.json();
        const trend = Array.isArray(json?.data?.netTrend) ? json.data.netTrend : [];
        setRows(
          trend.map((item) => ({
            ...item,
            averageNet: Number(item.averageNet || 0),
            katilanOgrenciSayisi: Number(item.katilanOgrenciSayisi || 0),
            dateLabel: formatDateTR(item.date),
          }))
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Trend verisi alinamadi");
          setRows([]);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [endpoint]);

  const hasData = useMemo(() => rows.length > 0, [rows]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Okul Geneli Net Trendi</h3>
        <p className="text-sm text-slate-500">Sadece ortak sinavlar dahil edilir.</p>
      </div>

      {loading && <div className="h-80 animate-pulse rounded-xl bg-slate-100" />}

      {!loading && error && (
        <div className="h-80 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 flex items-center justify-center">
          {error}
        </div>
      )}

      {!loading && !error && !hasData && (
        <div className="h-80 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 flex items-center justify-center">
          Trend verisi bulunamadi.
        </div>
      )}

      {!loading && !error && hasData && (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 12, fill: "#64748B" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748B" }} />
              <Tooltip
                cursor={{ stroke: "#93C5FD", strokeWidth: 1 }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const row = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-lg">
                      <div className="mb-2 font-semibold text-slate-900">
                        {row.examName} - {row.dateLabel}
                      </div>
                      <div className="text-slate-700">
                        Ortalama Net: <span className="font-semibold">{row.averageNet.toFixed(2)}</span>
                      </div>
                      <div className="text-slate-700">
                        Katilan Ogrenci: <span className="font-semibold">{row.katilanOgrenciSayisi}</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="averageNet"
                stroke="#2563EB"
                strokeWidth={3}
                dot={{ r: 4, fill: "#ffffff", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

