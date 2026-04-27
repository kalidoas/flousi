import confetti from "canvas-confetti";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";
import LoadingSkeleton from "../components/LoadingSkeleton.jsx";
import ContributionModal from "../components/goals/ContributionModal.jsx";
import GoalCard from "../components/goals/GoalCard.jsx";
import GoalForm from "../components/goals/GoalForm.jsx";
import { api } from "../lib/api.js";
import { goalsApi } from "../lib/goalsApi.js";

const fireCelebrate = () => {
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.65 } });
};

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [impacts, setImpacts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [contributionGoal, setContributionGoal] = useState(null);
  const [isContributing, setIsContributing] = useState(false);
  const [budget, setBudget] = useState(0);
  const [monthlyLosses, setMonthlyLosses] = useState(0);
  const [draggingGoalId, setDraggingGoalId] = useState(null);
  const [isReordering, setIsReordering] = useState(false);

  const loadGoals = async () => {
    setLoading(true);
    setError("");
    try {
      const [data, budgetResponse, monthlyLossesResponse] = await Promise.all([
        goalsApi.getGoals(),
        api.get("/budget"),
        api.get("/losses", { params: { period: "month" } })
      ]);
      setGoals(data);
      setBudget(Number(budgetResponse.data?.budget?.monthlyIncome || 0));
      setMonthlyLosses(
        (monthlyLossesResponse.data?.losses || []).reduce(
          (sum, item) => sum + Number(item.amount || 0),
          0
        )
      );

      // Fetch per-goal impact to ensure delay/impossible values stay synced with losses.
      const impactEntries = await Promise.allSettled(
        data.map(async (goal) => {
          const impact = await goalsApi.impact(goal.id);
          return [goal.id, impact];
        })
      );
      setImpacts(
        Object.fromEntries(
          impactEntries
            .filter((item) => item.status === "fulfilled")
            .map((item) => item.value)
        )
      );
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Unable to load goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const activeGoals = useMemo(() => goals.filter((goal) => goal.status !== "ACHIEVED"), [goals]);
  const orderedActiveGoals = useMemo(
    () => [...activeGoals].sort((a, b) => Number(a.priority || 0) - Number(b.priority || 0)),
    [activeGoals]
  );
  const achievedGoals = useMemo(() => goals.filter((goal) => goal.status === "ACHIEVED"), [goals]);
  const totalCommitment = useMemo(
    () => activeGoals.reduce((sum, goal) => sum + Number(goal.monthlySavings || 0), 0),
    [activeGoals]
  );
  const availableAfterLosses = useMemo(() => Math.max(0, budget - monthlyLosses), [budget, monthlyLosses]);
  const hasCommitmentRisk = totalCommitment > availableAfterLosses;

  const persistGoalOrder = async (nextOrder) => {
    setIsReordering(true);
    try {
      await Promise.all(nextOrder.map((goal, index) => goalsApi.updateGoal(goal.id, { priority: index + 1 })));
      await loadGoals();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "تعذر ترتيب الأهداف");
    } finally {
      setIsReordering(false);
      setDraggingGoalId(null);
    }
  };

  const moveGoal = async (goalId, direction) => {
    const current = [...orderedActiveGoals];
    const index = current.findIndex((goal) => goal.id === goalId);
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (index < 0 || targetIndex < 0 || targetIndex >= current.length) {
      return;
    }

    const nextOrder = [...current];
    [nextOrder[index], nextOrder[targetIndex]] = [nextOrder[targetIndex], nextOrder[index]];
    setGoals((prev) =>
      prev.map((goal) => {
        const updated = nextOrder.find((item) => item.id === goal.id);
        return updated ? { ...goal, priority: updated.priority } : goal;
      })
    );
    await persistGoalOrder(nextOrder);
  };

  const handleDragStart = (goalId) => () => setDraggingGoalId(goalId);

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (targetGoalId) => async () => {
    if (!draggingGoalId || draggingGoalId === targetGoalId) {
      setDraggingGoalId(null);
      return;
    }

    const current = [...orderedActiveGoals];
    const fromIndex = current.findIndex((goal) => goal.id === draggingGoalId);
    const toIndex = current.findIndex((goal) => goal.id === targetGoalId);

    if (fromIndex < 0 || toIndex < 0) {
      setDraggingGoalId(null);
      return;
    }

    const nextOrder = [...current];
    const [moved] = nextOrder.splice(fromIndex, 1);
    nextOrder.splice(toIndex, 0, moved);
    setGoals((prev) =>
      prev.map((goal) => {
        const updated = nextOrder.find((item) => item.id === goal.id);
        return updated ? { ...goal, priority: updated.priority } : goal;
      })
    );
    await persistGoalOrder(nextOrder);
  };

  const handleCreateOrUpdate = async (payload) => {
    setIsSaving(true);
    try {
      if (editingGoal) {
        await goalsApi.updateGoal(editingGoal.id, payload);
      } else {
        await goalsApi.createGoal(payload);
      }
      setEditingGoal(null);
      setShowCreateForm(false);
      await loadGoals();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Unable to save goal");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (goalId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this goal?");
    if (!confirmDelete) {
      return;
    }

    await goalsApi.deleteGoal(goalId);
    await loadGoals();
  };

  const handleContribute = async (goalId, payload) => {
    setIsContributing(true);
    try {
      await goalsApi.contribute(goalId, payload);
      setContributionGoal(null);
      await loadGoals();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Unable to add contribution");
    } finally {
      setIsContributing(false);
    }
  };

  const handleAchieve = async (goalId) => {
    try {
      await goalsApi.achieve(goalId);
      fireCelebrate();
      await loadGoals();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Unable to update goal status");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <section className="mx-auto max-w-5xl">
        <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Goals</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">Plan and reach your savings goals with Flousi.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/" className="rounded-md bg-slate-800 px-4 py-2 text-sm text-white">
              Dashboard
            </Link>
            <Link to="/analytics" className="rounded-md bg-cyan-600 px-4 py-2 text-sm text-white">
              Analytics
            </Link>
            <button
              onClick={() => {
                setEditingGoal(null);
                setShowCreateForm((prev) => !prev);
              }}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              + New Goal
            </button>
          </div>
        </header>

        {error ? <p className="mb-4 rounded-xl bg-rose-900/40 p-3 text-sm text-rose-200">{error}</p> : null}

        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">Monthly savings for all goals</p>
            <p className="text-xl font-semibold">{totalCommitment.toFixed(2)} MAD</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">Available after losses</p>
            <p className="text-xl font-semibold">{availableAfterLosses.toFixed(2)} MAD</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">Current month losses</p>
            <p className="text-xl font-semibold text-rose-500 dark:text-rose-400">{monthlyLosses.toFixed(2)} MAD</p>
          </article>
        </div>

        {hasCommitmentRisk ? (
          <p className="mb-5 rounded-xl bg-amber-900/40 p-3 text-sm text-amber-200">
            Warning: total goal commitments ({totalCommitment.toFixed(2)} MAD) are higher than what is available after losses ({availableAfterLosses.toFixed(2)} MAD).
          </p>
        ) : null}

        {showCreateForm ? (
          <div className="mb-5">
            <GoalForm
              initialData={editingGoal}
              onSubmit={handleCreateOrUpdate}
              onCancel={() => {
                setShowCreateForm(false);
                setEditingGoal(null);
              }}
              isSubmitting={isSaving}
            />
          </div>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <LoadingSkeleton className="h-60" />
            <LoadingSkeleton className="h-60" />
          </div>
        ) : null}

        {!loading ? (
          <section className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Active goals ({activeGoals.length})</h2>
              {isReordering ? <span className="text-xs text-slate-500 dark:text-slate-400">Reordering...</span> : null}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {orderedActiveGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  impact={impacts[goal.id]}
                  isImpactLoading={!impacts[goal.id]}
                  onEdit={(goalItem) => {
                    setEditingGoal(goalItem);
                    setShowCreateForm(true);
                  }}
                  onDelete={handleDelete}
                  onContribute={(goalItem) => setContributionGoal(goalItem)}
                  onAchieve={handleAchieve}
                  draggable
                  isDragging={draggingGoalId === goal.id}
                  onDragStart={handleDragStart(goal.id)}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop(goal.id)}
                  onMoveUp={(goalId) => moveGoal(goalId, "up")}
                  onMoveDown={(goalId) => moveGoal(goalId, "down")}
                />
              ))}
            </div>
            {activeGoals.length === 0 ? (
              <EmptyState
                title="No active goals yet"
                description="Add your first goal to start planning for a house, car, or trip."
                action={
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="rounded-md bg-emerald-500 px-4 py-2 font-semibold text-slate-950"
                  >
                    + New Goal
                  </button>
                }
              />
            ) : null}
          </section>
        ) : null}

        {!loading && achievedGoals.length > 0 ? (
          <section>
            <h2 className="mb-3 text-lg font-semibold">Achieved goals 🎉 ({achievedGoals.length})</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {achievedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  impact={impacts[goal.id]}
                  isImpactLoading={!impacts[goal.id]}
                  onEdit={(goalItem) => {
                    setEditingGoal(goalItem);
                    setShowCreateForm(true);
                  }}
                  onDelete={handleDelete}
                  onContribute={() => {}}
                  onAchieve={handleAchieve}
                />
              ))}
            </div>
          </section>
        ) : !loading && activeGoals.length === 0 ? (
          <section className="mt-6">
            <EmptyState
              title="No achieved goals yet"
              description="When you finish a goal, it will appear here with a celebration 🎉"
            />
          </section>
        ) : null}
      </section>

      <ContributionModal
        isOpen={Boolean(contributionGoal)}
        goal={contributionGoal}
        onClose={() => setContributionGoal(null)}
        onSubmit={handleContribute}
        isSubmitting={isContributing}
      />
    </main>
  );
}

