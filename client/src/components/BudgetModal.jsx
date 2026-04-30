import { useEffect, useState } from "react";

export default function BudgetModal({ isOpen, value, onClose, onSave, isSaving }) {
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (isOpen) {
	  setAmount("");
    }
  }, [value, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
	event.preventDefault();
	await onSave(Number(amount || 0));
  };

  return (
	<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
	  <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
		<h3 className="mb-3 text-lg font-semibold">تعديل الميزانية</h3>
		<p className="mb-4 text-sm text-slate-600 dark:text-slate-300">أدخل المبلغ الثابت للميزانية.</p>
		<input
		  className="mb-4 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
		  type="number"
		  min="0"
		  step="0.01"
		  placeholder={value ? `الميزانية الحالية: ${Number(value).toFixed(2)}` : "أدخل الميزانية"}
		  value={amount}
		  onChange={(event) => setAmount(event.target.value)}
		  required
		/>
		<div className="flex gap-2">
		  <button type="submit" disabled={isSaving} className="rounded-md bg-emerald-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60">
			{isSaving ? "جارٍ الحفظ..." : "حفظ"}
		  </button>
		  <button type="button" onClick={onClose} className="rounded-md bg-slate-200 px-4 py-2 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
			إغلاق
		  </button>
		</div>
	  </form>
	</div>
  );
}
