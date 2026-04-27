import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";
import LoadingSkeleton from "../components/LoadingSkeleton.jsx";
import { api } from "../lib/api.js";

const LOSS_CATEGORY_LABELS = {
  LAKHWAA: "Leak",
  CAFE: "Coffee / Cafe",
  FOOD: "Food",
  OUTINGS: "Outings",
  SHOPPING: "Shopping",
  OTHER: "Other"
};

const INCOME_SOURCE_LABELS = {
  SALARY: "Salary",
  FREELANCE: "Freelance",
  BUSINESS: "Business",
  GIFT: "Gift",
  OTHER: "Other"
};

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} MAD`;

const getStatusMeta = (budget, lossPercent) => {
  if (budget <= 0) {
    return {
      label: "Set your budget first",
      tone: "gray",
      description: "Add a budget amount to activate your status card."
    };
  }

  if (lossPercent < 30) {
    return {
      label: "Stable",
      tone: "green",
      description: "Your losses are under control."
    };
  }

  if (lossPercent <= 70) {
    return {
      label: "Warning",
      tone: "orange",
      description: "Your losses are getting too close to your budget."
    };
  }

  return {
    label: "Critical",
    tone: "red",
    description: "Your losses are too high. Stop the leaks now."
  };
};

export default function Dashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [budgetAmount, setBudgetAmount] = useState("");
  const [period, setPeriod] = useState("month");
  const [losses, setLosses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingBudget, setSavingBudget] = useState(false);
  const [savingLoss, setSavingLoss] = useState(false);
  const [savingIncome, setSavingIncome] = useState(false);
  const [newLoss, setNewLoss] = useState({
    amount: "",
    category: "CAFE",
    note: "",
    date: new Date().toISOString().split("T")[0]
  });
  const [newIncome, setNewIncome] = useState({
    amount: "",
    source: "SALARY",
    note: "",
    date: new Date().toISOString().split("T")[0]
  });

  const budgetValue = Number(budgetAmount || 0);
  const totalLost = useMemo(() => losses.reduce((sum, entry) => sum + Number(entry.amount), 0), [losses]);
  const totalIncome = useMemo(() => incomes.reduce((sum, entry) => sum + Number(entry.amount), 0), [incomes]);
  const lossPercent = useMemo(() => (budgetValue > 0 ? (totalLost / budgetValue) * 100 : 0), [budgetValue, totalLost]);
  const statusMeta = useMemo(() => getStatusMeta(budgetValue, lossPercent), [budgetValue, lossPercent]);
  const netBalance = useMemo(() => totalIncome - totalLost, [totalIncome, totalLost]);

  const loadDashboardData = async (activePeriod = period) => {
    setLoading(true);
    try {
      const [budgetResponse, lossesResponse, incomeResponse] = await Promise.all([
        api.get("/budget"),
        api.get("/losses", { params: { period: activePeriod } }),
        api.get("/income")
      ]);

      setBudgetAmount(String(Number(budgetResponse.data.budget.monthlyIncome || 0)));
      setLosses(lossesResponse.data.losses || []);
      setIncomes(incomeResponse.data.incomes || []);
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

  const handleSaveBudget = async (event) => {
    event.preventDefault();
    setSavingBudget(true);

    try {
      await api.put("/budget", { monthlyIncome: Number(budgetAmount || 0) });
      await loadDashboardData(period);
    } finally {
      setSavingBudget(false);
    }
  };

  const handleCreateLoss = async (event) => {
    event.preventDefault();
    setSavingLoss(true);

    try {
      await api.post("/losses", {
        amount: Number(newLoss.amount),
        category: newLoss.category,
        note: newLoss.note,
        date: newLoss.date
      });
      setNewLoss((prev) => ({ ...prev, amount: "", note: "" }));
      await loadDashboardData(period);
    } finally {
      setSavingLoss(false);
    }
  };

  const handleDeleteLoss = async (lossId) => {
    await api.delete(`/losses/${lossId}`);
    await loadDashboardData(period);
  };

  const handleCreateIncome = async (event) => {
    event.preventDefault();
    setSavingIncome(true);

    try {
      await api.post("/income", {
        amount: Number(newIncome.amount),
        source: newIncome.source,
        note: newIncome.note,
        date: newIncome.date
      });
      setNewIncome((prev) => ({ ...prev, amount: "", note: "" }));
      await loadDashboardData(period);
    } finally {
      setSavingIncome(false);
    }
  };

  const handleDeleteIncome = async (incomeId) => {
    await api.delete(`/income/${incomeId}`);
    await loadDashboardData(period);
  };

  const recentLosses = losses.slice(0, 6);
  const recentIncome = incomes.slice(0, 6);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <section className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">Welcome back, {user?.name}</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Link className="rounded-md bg-cyan-600 px-4 py-2 text-sm text-white" to="/analytics">
              Analytics
            </Link>
            <Link className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white" to="/goals">
              Goals
            </Link>
            <button className="rounded-md bg-slate-800 px-4 py-2 text-sm text-white" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">Budget</p>
            <p className="text-2xl font-semibold">{loading ? <LoadingSkeleton className="mt-2 h-8 w-24" /> : formatMoney(budgetValue)}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">Total Income</p>
            <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{loading ? <LoadingSkeleton className="mt-2 h-8 w-24" /> : formatMoney(totalIncome)}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">Total Losses</p>
            <p className="text-2xl font-semibold text-rose-600 dark:text-rose-400">{loading ? <LoadingSkeleton className="mt-2 h-8 w-24" /> : formatMoney(totalLost)}</p>
          </article>
          <article
            className={`rounded-2xl border p-4 ${
              statusMeta.tone === "green"
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                : statusMeta.tone === "orange"
                  ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
                  : statusMeta.tone === "red"
                    ? "border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30"
                    : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
            }`}
          >
            <p className="text-sm text-slate-600 dark:text-slate-300">Status</p>
            {loading ? (
              <LoadingSkeleton className="mt-2 h-8 w-32" />
            ) : (
              <>
                <p className="text-2xl font-semibold">{statusMeta.label}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{statusMeta.description}</p>
              </>
            )}
          </article>
        </div>

        {budgetValue > 0 && lossPercent > 50 ? (
          <p className={`mb-4 rounded-xl p-3 text-sm ${lossPercent > 70 ? "bg-rose-900/40 text-rose-200" : "bg-amber-900/40 text-amber-200"}`}>
            {lossPercent > 70
              ? `Critical: losses have reached ${lossPercent.toFixed(1)}% of your budget.`
              : `Warning: losses have reached ${lossPercent.toFixed(1)}% of your budget.`}
          </p>
        ) : null}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">Set Budget</h2>
          </div>
          <form onSubmit={handleSaveBudget} className="flex flex-col gap-3 sm:flex-row">
            <input
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              type="number"
              min="0"
              step="0.01"
              placeholder="Budget amount"
              value={budgetAmount}
              onChange={(event) => setBudgetAmount(event.target.value)}
            />
            <button className="rounded-md bg-emerald-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60" type="submit" disabled={savingBudget}>
              {savingBudget ? "Saving..." : "Save"}
            </button>
          </form>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Add Income</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">Recent entries below</span>
            </div>
            <form onSubmit={handleCreateIncome} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Amount"
                value={newIncome.amount}
                onChange={(event) => setNewIncome((prev) => ({ ...prev, amount: event.target.value }))}
                required
              />
              <select
                className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                value={newIncome.source}
                onChange={(event) => setNewIncome((prev) => ({ ...prev, source: event.target.value }))}
              >
                {Object.entries(INCOME_SOURCE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                type="date"
                value={newIncome.date}
                onChange={(event) => setNewIncome((prev) => ({ ...prev, date: event.target.value }))}
                required
              />
              <input
                className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                placeholder="Note"
                value={newIncome.note}
                onChange={(event) => setNewIncome((prev) => ({ ...prev, note: event.target.value }))}
              />
              <button className="rounded-md bg-emerald-500 px-4 py-2 font-semibold text-slate-950 sm:col-span-2" type="submit" disabled={savingIncome}>
                {savingIncome ? "Saving..." : "Save"}
              </button>
            </form>

            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Recent income entries
              </h3>
              {loading ? (
                <div className="space-y-2">
                  <LoadingSkeleton className="h-16" />
                  <LoadingSkeleton className="h-16" />
                </div>
              ) : recentIncome.length === 0 ? (
                <EmptyState title="No income yet" description="Add your first income entry to start tracking what comes in." />
              ) : (
                <ul className="space-y-2">
                  {recentIncome.map((entry) => (
                    <li key={entry.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{INCOME_SOURCE_LABELS[entry.source] || entry.source}</p>
                          <p className="text-slate-600 dark:text-slate-300">{entry.note || "No note"}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(entry.date).toLocaleDateString("en-US")}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">+{Number(entry.amount).toFixed(2)} MAD</p>
                          <button className="text-xs text-rose-600 dark:text-rose-400" onClick={() => handleDeleteIncome(entry.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Add Loss</h2>
              <select
                className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
              >
                <option value="day">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="all">All time</option>
              </select>
            </div>
            <form onSubmit={handleCreateLoss} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Amount"
                value={newLoss.amount}
                onChange={(event) => setNewLoss((prev) => ({ ...prev, amount: event.target.value }))}
                required
              />
              <select
                className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                value={newLoss.category}
                onChange={(event) => setNewLoss((prev) => ({ ...prev, category: event.target.value }))}
              >
                {Object.entries(LOSS_CATEGORY_LABELS).map(([value, label]) => (
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
                placeholder="Note"
                value={newLoss.note}
                onChange={(event) => setNewLoss((prev) => ({ ...prev, note: event.target.value }))}
              />
              <button className="rounded-md bg-emerald-500 px-4 py-2 font-semibold text-slate-950 sm:col-span-2" type="submit" disabled={savingLoss}>
                {savingLoss ? "Saving..." : "Save"}
              </button>
            </form>

            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Recent losses
              </h3>
              {loading ? (
                <div className="space-y-2">
                  <LoadingSkeleton className="h-16" />
                  <LoadingSkeleton className="h-16" />
                </div>
              ) : recentLosses.length === 0 ? (
                <EmptyState title="No losses yet" description="Add your first loss to start finding where money leaks." />
              ) : (
                <ul className="space-y-2">
                  {recentLosses.map((entry) => (
                    <li key={entry.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{LOSS_CATEGORY_LABELS[entry.category] || entry.category}</p>
                          <p className="text-slate-600 dark:text-slate-300">{entry.note || "No note"}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(entry.date).toLocaleDateString("en-US")}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-rose-600 dark:text-rose-400">-{Number(entry.amount).toFixed(2)} MAD</p>
                          <button className="text-xs text-rose-600 dark:text-rose-400" onClick={() => handleDeleteLoss(entry.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-lg font-semibold">Status overview</h2>
          {loading ? (
            <LoadingSkeleton className="h-20" />
          ) : budgetValue <= 0 ? (
            <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">Set your budget first.</p>
          ) : (
            <div className="rounded-xl p-4 text-sm text-white">
              <div className={`rounded-xl p-4 ${statusMeta.tone === "green" ? "bg-emerald-600" : statusMeta.tone === "orange" ? "bg-amber-600" : "bg-rose-600"}`}>
                <p className="text-lg font-semibold">{statusMeta.label}</p>
                <p>{statusMeta.description}</p>
                <p className="mt-2">Losses: {lossPercent.toFixed(1)}% of your budget</p>
                <p>Net balance from tracked income and losses: {formatMoney(netBalance)}</p>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

