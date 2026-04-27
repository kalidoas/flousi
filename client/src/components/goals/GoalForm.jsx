import { useEffect, useMemo, useState } from "react";

const toDateInput = (value) => {
  if (!value) {
    return new Date().toISOString().split("T")[0];
  }

  return new Date(value).toISOString().split("T")[0];
};

export default function GoalForm({ initialData, onSubmit, onCancel, isSubmitting }) {
  const defaults = useMemo(
    () => ({
      name: initialData?.name || "",
      emoji: initialData?.emoji || "🎯",
      targetAmount: initialData?.targetAmount ?? "",
      monthlySavings: initialData?.monthlySavings ?? "",
      amountSaved: initialData?.amountSaved ?? 0,
      startDate: toDateInput(initialData?.startDate)
    }),
    [initialData]
  );

  const [form, setForm] = useState(defaults);

  useEffect(() => {
    setForm(defaults);
  }, [defaults]);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({
      ...form,
      targetAmount: Number(form.targetAmount),
      monthlySavings: Number(form.monthlySavings),
      amountSaved: Number(form.amountSaved || 0)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 sm:p-5">
      <h2 className="text-lg font-semibold">{initialData ? "Edit goal" : "Add new goal"}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          name="name"
          placeholder="Goal name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          name="emoji"
          placeholder="🎯"
          value={form.emoji}
          onChange={handleChange}
          required
        />
        <input
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          name="targetAmount"
          type="number"
          min="1"
          step="0.01"
          placeholder="Target amount (MAD)"
          value={form.targetAmount}
          onChange={handleChange}
          required
        />
        <input
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          name="monthlySavings"
          type="number"
          min="1"
          step="0.01"
          placeholder="Monthly savings (MAD)"
          value={form.monthlySavings}
          onChange={handleChange}
          required
        />
        <input
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          name="amountSaved"
          type="number"
          min="0"
          step="0.01"
          placeholder="Amount saved so far"
          value={form.amountSaved}
          onChange={handleChange}
        />
        <input
          className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          name="startDate"
          type="date"
          value={form.startDate}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-emerald-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : initialData ? "Save changes" : "Create goal"}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="rounded-md bg-slate-200 px-4 py-2 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

