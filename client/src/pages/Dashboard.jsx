import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";
import LoadingSkeleton from "../components/LoadingSkeleton.jsx";
import { api } from "../lib/api.js";

const CATEGORY_LABELS = {
  LAKHWAA: "لخوا",
  CAFE: "قهوة/كافيه",
  FOOD: "أكل",
  OUTINGS: "خروجات",
  SHOPPING: "شراء حاجة",
  OTHER: "أخرى"
};

export default function Dashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [budget, setBudget] = useState(0);
  const [period, setPeriod] = useState("month");
  const [losses, setLosses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newLoss, setNewLoss] = useState({
    amount: "",
    category: "CAFE",
    note: "",
    date: new Date().toISOString().split("T")[0]
  });

  const totalLost = useMemo(() => losses.reduce((sum, entry) => sum + Number(entry.amount), 0), [losses]);
  const lossPercent = useMemo(() => (budget > 0 ? (totalLost / budget) * 100 : 0), [budget, totalLost]);

  const loadDashboardData = async (activePeriod = period) => {
    setLoading(true);
    try {
      const [budgetResponse, lossesResponse] = await Promise.all([
        api.get("/budget"),
        api.get("/losses", { params: { period: activePeriod } })
      ]);
      setBudget(Number(budgetResponse.data.budget.monthlyIncome || 0));
      setLosses(lossesResponse.data.losses || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const handleLogout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    navigate("/login");
  };

  const handleCreateLoss = async (event) => {
    event.preventDefault();
    await api.post("/losses", {
      amount: Number(newLoss.amount),
      category: newLoss.category,
      note: newLoss.note,
      date: newLoss.date
    });
    setNewLoss((prev) => ({ ...prev, amount: "", note: "" }));
    await loadDashboardData(period);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <section className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">مرحبا {user?.name}</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">لوحة بداية فلوسي</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Link className="rounded-md bg-cyan-600 px-4 py-2 text-sm text-white" to="/analytics">
              التحليلات
            </Link>
            <Link className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white" to="/goals">
              الأهداف
            </Link>
            <button className="rounded-md bg-slate-800 px-4 py-2 text-sm text-white" onClick={handleLogout}>
              خروج
            </button>
          </div>
        </header>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">الميزانية الشهرية</p>
            <p className="text-2xl font-semibold">{loading ? <LoadingSkeleton className="mt-2 h-8 w-24" /> : `${budget.toFixed(2)} MAD`}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">المبلغ الضايع ({period})</p>
            <p className="text-2xl font-semibold text-rose-500 dark:text-rose-400">{loading ? <LoadingSkeleton className="mt-2 h-8 w-24" /> : `${totalLost.toFixed(2)} MAD`}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">نسبة الخسارة</p>
            <p className="text-2xl font-semibold">{loading ? <LoadingSkeleton className="mt-2 h-8 w-20" /> : `${lossPercent.toFixed(1)}%`}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">الحالة</p>
            <p className="text-2xl font-semibold">{loading ? <LoadingSkeleton className="mt-2 h-8 w-28" /> : lossPercent > 70 ? "خطر" : lossPercent > 50 ? "تنبيه" : "مستقر"}</p>
          </article>
        </div>

        {lossPercent > 70 ? (
          <p className="mb-4 rounded-xl bg-rose-900/40 p-3 text-sm text-rose-200">
            خطر كبير: خسرتي {lossPercent.toFixed(1)}% من الميزانية. رد بالك ووقف الخسائر دابا.
          </p>
        ) : null}
        {lossPercent > 50 && lossPercent <= 70 ? (
          <p className="mb-4 rounded-xl bg-amber-900/40 p-3 text-sm text-amber-200">
            تنبيه: الخسائر دازت 50% من الميزانية ({lossPercent.toFixed(1)}%).
          </p>
        ) : null}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">إضافة خسارة</h2>
            <select
              className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
            >
              <option value="day">اليوم</option>
              <option value="week">هاد السيمانة</option>
              <option value="month">هاد الشهر</option>
              <option value="all">كلشي</option>
            </select>
          </div>

          <form onSubmit={handleCreateLoss} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="المبلغ"
              value={newLoss.amount}
              onChange={(event) => setNewLoss((prev) => ({ ...prev, amount: event.target.value }))}
              required
            />
            <select
              className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              value={newLoss.category}
              onChange={(event) => setNewLoss((prev) => ({ ...prev, category: event.target.value }))}
            >
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <input
              className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              type="date"
              value={newLoss.date}
              onChange={(event) => setNewLoss((prev) => ({ ...prev, date: event.target.value }))}
              required
            />
            <input
              className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="ملاحظة"
              value={newLoss.note}
              onChange={(event) => setNewLoss((prev) => ({ ...prev, note: event.target.value }))}
            />
            <button className="rounded-md bg-emerald-500 px-4 py-2 font-semibold text-slate-950 lg:col-span-4" type="submit">
              حفظ الخسارة
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-lg font-semibold">آخر الخسائر</h2>
          {loading ? (
            <div className="space-y-2">
              <LoadingSkeleton className="h-16" />
              <LoadingSkeleton className="h-16" />
              <LoadingSkeleton className="h-16" />
            </div>
          ) : null}
          {!loading && losses.length === 0 ? (
            <EmptyState
              title="ما كايناش خسائر دابا"
              description="زيد أول خسارة باش تبدا التحليل وتفهم فين كيمشيو الفلوس ديالك."
            />
          ) : null}
          {!loading && losses.length > 0 ? (
            <ul className="space-y-2">
              {losses.map((entry) => (
                <li key={entry.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between">
                    <span>{CATEGORY_LABELS[entry.category] || entry.category}</span>
                    <span className="font-semibold text-rose-500 dark:text-rose-400">-{Number(entry.amount).toFixed(2)} MAD</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{entry.note || "-"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(entry.date).toLocaleDateString("fr-MA")}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </section>
    </main>
  );
}

