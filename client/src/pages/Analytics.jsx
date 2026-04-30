import { useEffect, useState } from "react";
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
  LAKHWAA: "لخوا",
  CAFE: "قهوة / كافيه",
  FOOD: "أكل",
  OUTINGS: "خروجات",
  SHOPPING: "شراء حاجة",
  OTHER: "أخرى"
};

export default function Analytics() {
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryData, setCategoryData] = useState([]);
  const [dayData, setDayData] = useState([]);
  const [biggestDrain, setBiggestDrain] = useState(null);
  const [incomeBySourceData, setIncomeBySourceData] = useState([]);
  const [totals, setTotals] = useState({ income: 0, loss: 0, net: 0 });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [byCategory, byDay, incomeBySource, totalsData] = await Promise.all([
          analyticsApi.byCategory(period),
          analyticsApi.byDay(period),
          analyticsApi.incomeBySource(period),
          analyticsApi.totals(period)
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

        setIncomeBySourceData(
          (incomeBySource.sources || []).map((item) => ({
            name: item.source,
            total: Number(item.total)
          }))
        );

        const normalizedTotals = {
          income: Number(totalsData.totalIncome ?? totalsData.income ?? 0),
          loss: Number(totalsData.totalLosses ?? totalsData.loss ?? 0),
          net: Number(totalsData.net ?? 0)
        };
        setTotals(normalizedTotals);
        setBiggestDrain(byCategory.biggestDrain || null);
      } catch (apiError) {
          setError(apiError.response?.data?.message || "تعذر تحميل التحليلات");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [period]);

  const netColor = totals.net >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-4 pb-24 text-base text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 sm:py-6 sm:pb-6 md:text-base">
      <section className="mx-auto max-w-6xl">
        <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">التحليلات</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">افهم فين كيمشيو فلوسك ووقف التسريبات.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/" className="hidden items-center gap-2 rounded-md bg-slate-800 px-4 py-2 text-sm text-white sm:inline-flex">
              <span className="text-base">🏠</span>
              <span>لوحة التحكم</span>
            </Link>
            <Link to="/goals" className="hidden items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm text-white sm:inline-flex">
              <span className="text-base">🎯</span>
              <span>الأهداف</span>
            </Link>
            <select
              className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
            >
              <option value="day">اليوم</option>
              <option value="week">هذا الأسبوع</option>
              <option value="month">هذا الشهر</option>
              <option value="all">كل الوقت</option>
            </select>
          </div>
        </header>

        {error ? <p className="mb-4 rounded-md bg-rose-900/40 p-3 text-sm text-rose-200">{error}</p> : null}

        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">إجمالي الدخل هذا الشهر</p>
            <p className="text-2xl font-semibold text-emerald-500 dark:text-emerald-400">{loading ? <LoadingSkeleton className="mt-2 h-8 w-28" /> : `${totals.income.toFixed(2)} درهم`}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">إجمالي الخسائر هذا الشهر</p>
            <p className="text-2xl font-semibold text-rose-500 dark:text-rose-400">{loading ? <LoadingSkeleton className="mt-2 h-8 w-28" /> : `${totals.loss.toFixed(2)} درهم`}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">الصافي</p>
            <p className={`text-2xl font-semibold ${netColor}`}>{loading ? <LoadingSkeleton className="mt-2 h-8 w-28" /> : `${totals.net.toFixed(2)} درهم`}</p>
          </article>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 md:col-span-2 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">أكبر نزيف</p>
            {loading ? (
              <LoadingSkeleton className="mt-2 h-8 w-80" />
            ) : (
              <p className="text-xl font-semibold">
                {biggestDrain ? `${CATEGORY_LABELS[biggestDrain.category] || biggestDrain.category} - ${Number(biggestDrain.total).toFixed(2)} درهم` : "لا توجد بيانات كافية بعد"}
              </p>
            )}
          </article>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-lg font-semibold">الدخل حسب المصدر</h2>
            <div className="h-[250px] sm:h-[350px]">
              {loading ? (
                <div className="space-y-3">
                  <LoadingSkeleton className="h-64" />
                </div>
              ) : incomeBySourceData.length === 0 ? (
                <EmptyState
                  title="لا توجد بيانات للدخل بعد"
                  description="أضف بعض الدخل باش يبان الرسم هنا."
                />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeBySourceData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#cbd5e1" />
                    <YAxis stroke="#cbd5e1" />
                    <Tooltip />
                    <Bar dataKey="total" fill="#22c55e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-lg font-semibold">الخسائر حسب الفئة</h2>
            <div className="h-[250px] sm:h-[350px]">
              {loading ? (
                <div className="space-y-3">
                  <LoadingSkeleton className="h-64" />
                </div>
              ) : categoryData.length === 0 ? (
                <EmptyState
                  title="لا توجد بيانات للفئات بعد"
                  description="أضف بعض الخسائر باش يبان شكون كيسحب من الميزانية أكثر."
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

          <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
            <h2 className="mb-3 text-lg font-semibold">الخسائر اليومية</h2>
            <div className="h-[250px] sm:h-[350px]">
              {loading ? (
                <LoadingSkeleton className="h-64" />
              ) : dayData.length === 0 ? (
                <EmptyState
                  title="لا توجد بيانات يومية بعد"
                  description="منين تدخل الخسائر اليومية غادي يبان الرسم هنا."
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
