import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";
import LoadingSkeleton from "../components/LoadingSkeleton.jsx";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { analyticsApi } from "../lib/analyticsApi.js";

const CATEGORY_LABELS = {
  LAKHWAA: "Leak",
  CAFE: "Coffee / Cafe",
  FOOD: "Food",
  OUTINGS: "Outings",
  SHOPPING: "Shopping",
  OTHER: "Other"
};

export default function Analytics() {
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryData, setCategoryData] = useState([]);
  const [dayData, setDayData] = useState([]);
  const [biggestDrain, setBiggestDrain] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [byCategory, byDay] = await Promise.all([
          analyticsApi.byCategory(period),
          analyticsApi.byDay(period)
        ]);

        setCategoryData(
          (byCategory.categories || []).map((item) => ({
            name: CATEGORY_LABELS[item.category] || item.category,
            total: Number(item.total)
          }))
        );

        setDayData(
          (byDay.days || []).map((item) => ({
            date: item.date,
            total: Number(item.total)
          }))
        );

        setBiggestDrain(byCategory.biggestDrain || null);
      } catch (apiError) {
        setError(apiError.response?.data?.message || "تعذر تحميل التحليلات");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [period]);

  const totalLost = useMemo(
    () => categoryData.reduce((sum, item) => sum + Number(item.total), 0),
    [categoryData]
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <section className="mx-auto max-w-6xl">
        <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">التحليلات</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">فهم فين كيمشيو فلوسك باش توقف النزيف</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/" className="rounded-md bg-slate-800 px-4 py-2 text-sm text-white">Dashboard</Link>
            <Link to="/goals" className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white">الأهداف</Link>
            <select
              className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
            >
              <option value="day">اليوم</option>
              <option value="week">هاد السيمانة</option>
              <option value="month">هاد الشهر</option>
              <option value="all">كلشي</option>
            </select>
          </div>
        </header>

        {error ? <p className="mb-4 rounded-md bg-rose-900/40 p-3 text-sm text-rose-200">{error}</p> : null}

        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">إجمالي الخسائر</p>
            <p className="text-2xl font-semibold text-rose-500 dark:text-rose-400">{loading ? <LoadingSkeleton className="mt-2 h-8 w-28" /> : `${totalLost.toFixed(2)} MAD`}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 md:col-span-2 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">أكبر نزيف</p>
            {loading ? (
              <LoadingSkeleton className="mt-2 h-8 w-80" />
            ) : (
              <p className="text-xl font-semibold">
                {biggestDrain ? `${CATEGORY_LABELS[biggestDrain.category] || biggestDrain.category} - ${Number(biggestDrain.total).toFixed(2)} MAD` : "ماكايناش بيانات كافية"}
              </p>
            )}
          </article>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-lg font-semibold">الخسائر حسب الفئة</h2>
            <div className="h-80">
              {loading ? (
                <div className="space-y-3">
                  <LoadingSkeleton className="h-64" />
                </div>
              ) : categoryData.length === 0 ? (
                <EmptyState
                  title="No category data yet"
                  description="Add some losses to see which category drains your budget the most."
                />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#cbd5e1" />
                    <YAxis stroke="#cbd5e1" />
                    <Tooltip />
                    <Bar dataKey="total" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-lg font-semibold">الخسائر اليومية</h2>
            <div className="h-80">
              {loading ? (
                <LoadingSkeleton className="h-64" />
              ) : dayData.length === 0 ? (
                <EmptyState
                  title="No daily data yet"
                  description="Once you enter daily losses, the chart will appear here."
                />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dayData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#cbd5e1" />
                    <YAxis stroke="#cbd5e1" />
                    <Tooltip />
                    <Line dataKey="total" type="monotone" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

