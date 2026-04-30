import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import BudgetModal from "../components/BudgetModal.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoadingSkeleton from "../components/LoadingSkeleton.jsx";
import { api, authTokenKey, setAuthToken } from "../lib/api.js";
import { goalsApi } from "../lib/goalsApi.js";

const LOSS_CATEGORY_LABELS = {
  LAKHWAA: "لخوا",
  CAFE: "قهوة / كافيه",
  FOOD: "أكل",
  OUTINGS: "خروجات",
  SHOPPING: "شراء حاجة",
  OTHER: "أخرى"
};

const INCOME_SOURCE_LABELS = {
  SALARY: "راتب",
  FREELANCE: "عمل حر",
  BUSINESS: "تجارة",
  GIFT: "هدية",
  OTHER: "أخرى"
};

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} درهم`;
const monthKey = (dateValue) => new Date(dateValue).toISOString().slice(0, 7);
const currentMonth = new Date().toISOString().slice(0, 7);
const sortNewestFirst = (items) => [...items].sort((a, b) => new Date(b.date) - new Date(a.date));

const getStatusMeta = (budgetValue, remainingPercent) => {
  if (budgetValue <= 0) {
    return {
      label: "حدد ميزانيتك أولاً",
      tone: "gray",
      description: "أدخل ميزانية ثابتة باش يبان لك وضع الحساب."
    };
  }

  if (remainingPercent > 70) {
    return {
      label: "مستقر",
      tone: "green",
      description: "الوضع مزيان ومازال عندك هامش مريح."
    };
  }

  if (remainingPercent >= 30) {
    return {
      label: "تحذير",
      tone: "orange",
      description: "رد بالك، المصروف ولى قريب من الحد."
    };
  }

  return {
    label: "حرج",
    tone: "red",
    description: "المتبقي قليل بزاف. خاصك توقف النزيف دابا."
  };
};

export default function Dashboard({ user, setUser }) {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState("0");
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingBudget, setSavingBudget] = useState(false);
  const [savingLoss, setSavingLoss] = useState(false);
  const [savingIncome, setSavingIncome] = useState(false);
  const [budget, setBudget] = useState(0);
  const [losses, setLosses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [goals, setGoals] = useState([]);
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

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [budgetResponse, lossesResponse, incomeResponse, goalsResponse] = await Promise.all([
        api.get("/budget"),
        api.get("/losses", { params: { period: "all" } }),
        api.get("/income"),
        goalsApi.getGoals()
      ]);

      const currentBudget = Number(budgetResponse.data?.budget?.monthlyIncome || 0);
      const loadedLosses = lossesResponse.data?.losses || [];
      const loadedIncome = incomeResponse.data?.incomes || [];
      const loadedGoals = goalsResponse || [];

      setBudget(currentBudget);
      setBudgetAmount(String(currentBudget));
      setLosses(sortNewestFirst(loadedLosses));
      setIncomes(sortNewestFirst(loadedIncome));
      setGoals(loadedGoals);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const refresh = () => loadDashboardData();
    window.addEventListener("flousi:finance-updated", refresh);

    return () => window.removeEventListener("flousi:finance-updated", refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalIncomeThisMonth = useMemo(
    () => incomes.filter((entry) => monthKey(entry.date) === currentMonth).reduce((sum, entry) => sum + Number(entry.amount), 0),
    [incomes]
  );

  const totalLossesThisMonth = useMemo(
    () => losses.filter((entry) => monthKey(entry.date) === currentMonth).reduce((sum, entry) => sum + Number(entry.amount), 0),
    [losses]
  );

  const totalLossesAllTime = useMemo(
    () => losses.reduce((sum, entry) => sum + Number(entry.amount), 0),
    [losses]
  );

  const totalGoalContributions = useMemo(
    () => goals.reduce((sum, goal) => sum + Number(goal.amountSaved || 0), 0),
    [goals]
  );

  const remainingBudget = Number(budget || 0) - totalLossesAllTime - totalGoalContributions;
  const remainingPercent = budget > 0 ? (remainingBudget / budget) * 100 : 0;
  const statusMeta = getStatusMeta(budget, remainingPercent);

  const recentLosses = useMemo(() => sortNewestFirst(losses).slice(0, 6), [losses]);
  const recentIncome = useMemo(() => sortNewestFirst(incomes).slice(0, 6), [incomes]);

  const dispatchFinanceUpdate = () => window.dispatchEvent(new Event("flousi:finance-updated"));

  const handleLogout = async () => {
    await api.post("/auth/logout");
    setAuthToken(null);
    localStorage.removeItem(authTokenKey);
    setUser(null);
    navigate("/login");
  };

  const handleSwitchAccount = async () => {
    await handleLogout();
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await api.delete("/auth/account");
      setAuthToken(null);
      localStorage.removeItem(authTokenKey);
      setUser(null);
      navigate("/register");
    } finally {
      setDeletingAccount(false);
      setConfirmDeleteOpen(false);
      setAccountMenuOpen(false);
    }
  };

  const handleSaveBudget = async (amount) => {
    setSavingBudget(true);
    try {
      await api.put("/budget", { monthlyIncome: Number(amount || 0) });
      setBudget(Number(amount || 0));
      setBudgetAmount(String(Number(amount || 0)));
      setBudgetModalOpen(false);
      await loadDashboardData();
      dispatchFinanceUpdate();
    } finally {
      setSavingBudget(false);
    }
  };

  const handleCreateLoss = async (event) => {
    event.preventDefault();
    setSavingLoss(true);

    const lossAmount = Number(newLoss.amount);
    if (lossAmount <= 0) {
      // Or show an error message
      setSavingLoss(false);
      return;
    }

    try {
      // 1. Create the loss
      const lossResponse = await api.post("/losses", {
        amount: lossAmount,
        category: newLoss.category,
        note: newLoss.note,
        date: newLoss.date
      });

      // 2. Calculate new budget
      const newBudgetValue = budget - lossAmount;

      // 3. Update budget on the server
      await api.put("/budget", { monthlyIncome: newBudgetValue });

      // 4. Update local state immediately
      const createdLoss = lossResponse.data.loss || lossResponse.data;
      setLosses((prev) => [createdLoss, ...prev]);
      setBudget((prev) => {
        const updated = Number(prev || 0) - lossAmount;
        setBudgetAmount(String(updated));
        return updated;
      });
      setNewLoss((prev) => ({ ...prev, amount: "", note: "" }));

      // 5. Dispatch event to sync other components
      dispatchFinanceUpdate();
    } catch (error) {
      console.error("Failed to create loss:", error);
      throw error;
    } finally {
      setSavingLoss(false);
    }
  };

  const handleDeleteLoss = async (lossId) => {
    const lossToDelete = losses.find((loss) => loss.id === lossId);
    if (!lossToDelete) return;

    try {
      // 1. Delete the loss
      await api.delete(`/losses/${lossId}`);

      // 2. Calculate new budget
      const newBudgetValue = budget + Number(lossToDelete.amount);

      // 3. Update budget on the server
      await api.put("/budget", { monthlyIncome: newBudgetValue });

      // 4. Update local state
      setBudget(newBudgetValue);
      setBudgetAmount(String(newBudgetValue));
      setLosses((prev) => prev.filter((item) => item.id !== lossId));

      // 5. Dispatch event to sync other components
      dispatchFinanceUpdate();
    } catch (error) {
      console.error("Failed to delete loss:", error);
      // Optionally, show an error message to the user
    }
  };

  const handleCreateIncome = async (event) => {
    event.preventDefault();
    setSavingIncome(true);

    const incomeAmount = Number(newIncome.amount);
    if (incomeAmount <= 0) {
      setSavingIncome(false);
      return;
    }

    try {
      const response = await api.post("/income", {
        amount: Number(incomeAmount),
        source: newIncome.source,
        date: newIncome.date,
        note: newIncome.note
      });

      const newBudgetValue = budget + incomeAmount;
      await api.put("/budget", { monthlyIncome: newBudgetValue });

      const createdIncome = response.data.income || response.data;
      setIncomes((prev) => [createdIncome, ...prev]);
      setBudget((prev) => {
        const updated = Number(prev || 0) + incomeAmount;
        setBudgetAmount(String(updated));
        return updated;
      });
      setNewIncome((prev) => ({ ...prev, amount: "", note: "" }));
      dispatchFinanceUpdate();
    } catch (error) {
      console.error("Failed to create income:", error);
      throw error;
    } finally {
      setSavingIncome(false);
    }
  };

  const handleDeleteIncome = async (incomeId) => {
    const incomeToDelete = incomes.find((income) => income.id === incomeId);
    if (!incomeToDelete) return;

    try {
      await api.delete(`/income/${incomeId}`);

      const newBudgetValue = budget - Number(incomeToDelete.amount);
      await api.put("/budget", { monthlyIncome: newBudgetValue });

      setBudget(newBudgetValue);
      setBudgetAmount(String(newBudgetValue));
      setIncomes((prev) => prev.filter((item) => item.id !== incomeId));
      dispatchFinanceUpdate();
    } catch (error) {
      console.error("Failed to delete income:", error);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-4 pb-24 text-base text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 sm:py-6 sm:pb-6 md:text-base">
      <section className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">لوحة التحكم</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">مرحباً {user?.name}، هذه نظرة سريعة على فلوسك.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Link className="hidden items-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-sm text-white sm:inline-flex" to="/analytics">
              <span className="text-base">📊</span>
              <span>التحليلات</span>
            </Link>
            <Link className="hidden items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm text-white sm:inline-flex" to="/goals">
              <span className="text-base">🎯</span>
              <span>الأهداف</span>
            </Link>
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white">
                  {(user?.name || "?").slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden text-sm font-semibold sm:block">{user?.name || "الحساب"}</span>
              </button>

              {accountMenuOpen ? (
                <div
                  ref={menuRef}
                  className="fixed left-4 right-4 top-20 z-40 w-auto rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-64"
                >
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">معلومات الحساب</p>
                    <p className="font-semibold">{user?.name || "-"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleSwitchAccount}
                      className="w-full rounded-md bg-slate-100 px-3 py-2 text-left dark:bg-slate-800"
                    >
                      تبديل الحساب
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteOpen(true)}
                      className="w-full rounded-md bg-rose-100 px-3 py-2 text-left text-rose-700 dark:bg-rose-900/40 dark:text-rose-200"
                    >
                      حذف الحساب
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-md bg-slate-800 px-3 py-2 text-left text-white"
                    >
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">الميزانية</p>
            <p className="text-2xl font-semibold">{loading ? <LoadingSkeleton className="mt-2 h-8 w-24" /> : formatMoney(budget)}</p>
            <button onClick={() => setBudgetModalOpen(true)} className="mt-3 rounded-md bg-slate-800 px-3 py-2 text-sm text-white">
              تعديل الميزانية
            </button>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">الدخل هذا الشهر</p>
            <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              {loading ? <LoadingSkeleton className="mt-2 h-8 w-24" /> : formatMoney(totalIncomeThisMonth)}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">الخسائر هذا الشهر</p>
            <p className="text-2xl font-semibold text-rose-600 dark:text-rose-400">
              {loading ? <LoadingSkeleton className="mt-2 h-8 w-24" /> : formatMoney(totalLossesThisMonth)}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">المتبقي</p>
            <p className="text-2xl font-semibold">{loading ? <LoadingSkeleton className="mt-2 h-8 w-24" /> : formatMoney(remainingBudget)}</p>
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
            <p className="text-sm text-slate-600 dark:text-slate-300">الحالة</p>
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

        {budget <= 0 ? (
          <p className="mb-4 rounded-xl bg-slate-100 p-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">حدد ميزانيتك أولاً.</p>
        ) : remainingBudget <= 0 ? (
          <p className="mb-4 rounded-xl bg-rose-900/40 p-3 text-sm text-rose-200">تحذير حرج: المتبقي أصبح صفراً أو أقل.</p>
        ) : null}

        <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">إضافة دخل</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">آخر العمليات بالأسفل</span>
            </div>
            <form onSubmit={handleCreateIncome} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="المبلغ"
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
                placeholder="ملاحظة"
                value={newIncome.note}
                onChange={(event) => setNewIncome((prev) => ({ ...prev, note: event.target.value }))}
              />
              <button className="rounded-md bg-emerald-500 px-4 py-2 font-semibold text-slate-950 sm:col-span-2" type="submit" disabled={savingIncome}>
                {savingIncome ? "جارٍ الحفظ..." : "حفظ"}
              </button>
            </form>

            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">آخر الدخل</h3>
              {loading ? (
                <div className="space-y-2">
                  <LoadingSkeleton className="h-16" />
                  <LoadingSkeleton className="h-16" />
                </div>
              ) : recentIncome.length === 0 ? (
                <EmptyState title="لا يوجد دخل بعد" description="أضف أول دخل لتبدأ متابعة ما يدخل للحساب." />
              ) : (
                <ul className="space-y-2">
                  {recentIncome.map((entry) => (
                    <li key={entry.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{INCOME_SOURCE_LABELS[entry.source] || entry.source}</p>
                          <p className="text-slate-600 dark:text-slate-300">{entry.note || "لا توجد ملاحظة"}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(entry.date).toLocaleDateString("ar-EG")}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">+{Number(entry.amount).toFixed(2)} درهم</p>
                          <button className="text-xs text-rose-600 dark:text-rose-400" onClick={() => handleDeleteIncome(entry.id)}>
                            حذف
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
              <h2 className="text-lg font-semibold">أضف خسارة</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">الخسائر الأخيرة بالأسفل</span>
            </div>
            <form onSubmit={handleCreateLoss} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                placeholder="ملاحظة"
                value={newLoss.note}
                onChange={(event) => setNewLoss((prev) => ({ ...prev, note: event.target.value }))}
              />
              <button className="rounded-md bg-emerald-500 px-4 py-2 font-semibold text-slate-950 sm:col-span-2" type="submit" disabled={savingLoss}>
                {savingLoss ? "جارٍ الحفظ..." : "حفظ"}
              </button>
            </form>

            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">آخر الخسائر</h3>
              {loading ? (
                <div className="space-y-2">
                  <LoadingSkeleton className="h-16" />
                  <LoadingSkeleton className="h-16" />
                </div>
              ) : recentLosses.length === 0 ? (
                <EmptyState title="لا توجد خسائر بعد" description="أضف أول خسارة لتبدأ معرفة أين يذهب المال." />
              ) : (
                <ul className="space-y-2">
                  {recentLosses.map((entry) => (
                    <li key={entry.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{LOSS_CATEGORY_LABELS[entry.category] || entry.category}</p>
                          <p className="text-slate-600 dark:text-slate-300">{entry.note || "لا توجد ملاحظة"}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(entry.date).toLocaleDateString("ar-EG")}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-rose-600 dark:text-rose-400">-{Number(entry.amount).toFixed(2)} درهم</p>
                          <button className="text-xs text-rose-600 dark:text-rose-400" onClick={() => handleDeleteLoss(entry.id)}>
                            حذف
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
          <h2 className="mb-3 text-lg font-semibold">ملخص الرصيد</h2>
          {loading ? (
            <LoadingSkeleton className="h-20" />
          ) : (
            <div className={`rounded-xl p-4 text-white ${statusMeta.tone === "green" ? "bg-emerald-600" : statusMeta.tone === "orange" ? "bg-amber-600" : statusMeta.tone === "red" ? "bg-rose-600" : "bg-slate-600"}`}>
              <p className="text-lg font-semibold">{statusMeta.label}</p>
              <p>{statusMeta.description}</p>
              <p className="mt-2">المتبقي: {formatMoney(remainingBudget)}</p>
              <p>الخسائر الكلية: {formatMoney(totalLossesAllTime)}</p>
              <p>إجمالي التزامات الأهداف: {formatMoney(totalGoalContributions)}</p>
            </div>
          )}
        </section>
      </section>

      <BudgetModal
        isOpen={budgetModalOpen}
        value={budgetAmount}
        onClose={() => setBudgetModalOpen(false)}
        onSave={handleSaveBudget}
        isSaving={savingBudget}
      />

      {confirmDeleteOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
          <div className="h-full w-full max-w-none rounded-none border border-slate-200 bg-white p-6 text-slate-900 shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 sm:h-auto sm:max-w-md sm:rounded-2xl">
            <h2 className="mb-2 text-lg font-semibold">تأكيد حذف الحساب</h2>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
              سيتم حذف كل بياناتك نهائياً. هل أنت متأكد؟
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="flex-1 rounded-md bg-rose-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
              >
                {deletingAccount ? "جارٍ الحذف..." : "حذف الحساب"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                className="rounded-md bg-slate-200 px-4 py-2 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

