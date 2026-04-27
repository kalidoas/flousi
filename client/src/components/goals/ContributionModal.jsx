import { useState } from "react";

export default function ContributionModal({ goal, isOpen, onClose, onSubmit, isSubmitting }) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");

  if (!isOpen || !goal) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(goal.id, {
      amount: Number(amount),
      date,
      note
    });
    setAmount("");
    setNote("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
        <h3 className="mb-3 text-lg font-semibold">Add contribution - {goal.emoji} {goal.name}</h3>
        <input
          className="mb-3 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          type="number"
          min="1"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
        />
        <input
          className="mb-3 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
        />
        <input
          className="mb-4 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          placeholder="Note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-emerald-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Confirm contribution"}
          </button>
          <button type="button" onClick={onClose} className="rounded-md bg-slate-200 px-4 py-2 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
            Close
          </button>
        </div>
      </form>
    </div>
  );
}

