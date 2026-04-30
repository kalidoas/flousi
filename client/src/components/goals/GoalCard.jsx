const formatMad = (value) => `${Number(value || 0).toFixed(2)} MAD`;

export default function GoalCard({
  goal,
  impact,
  isImpactLoading,
  onEdit,
  onDelete,
  onContribute,
  onAchieve,
  onDragStart,
  onDragOver,
  onDrop,
  onMoveUp,
  onMoveDown,
  draggable = false,
  isDragging = false
}) {
  const isAchieved = goal.status === "ACHIEVED";
  const target = Number(goal.targetAmount || 0);
  const saved = Number(goal.amountSaved || 0);
  const progress = target > 0 ? Math.min(100, (saved / target) * 100) : 0;

  const calculator = goal.calculator || {};
  const impactData = impact || calculator;

  const statusTone = impactData.is_impossible
    ? "border-rose-500"
    : (impactData.delay_months || 0) > 0
      ? "border-amber-500"
      : "border-emerald-500";

  return (
    <article
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`rounded-xl border ${statusTone} bg-white p-4 text-slate-900 shadow-sm transition dark:bg-slate-900 dark:text-slate-100 ${isDragging ? "scale-[0.99] opacity-70" : ""}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold">
          <span className="ml-1">{goal.emoji}</span>
          {goal.name}
        </h3>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {goal.status}
        </span>
      </div>

      <p className="mb-2 text-sm text-slate-500 dark:text-slate-300">{formatMad(saved)} / {formatMad(target)}</p>
      <div className="mb-4 h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800">
        <div className="h-2.5 rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="grid grid-cols-1 gap-2 text-sm text-slate-200 sm:grid-cols-2">
        <p className="text-slate-600 dark:text-slate-200">
          المتبقي: <span className="font-semibold">{calculator.years || 0} سنة و {calculator.remaining_months || 0} شهر</span>
        </p>
        <p className="text-slate-600 dark:text-slate-200">الادخار الشهري: <span className="font-semibold">{formatMad(goal.monthlySavings)}</span></p>
        <p className="text-slate-600 dark:text-slate-200">الادخار اليومي: <span className="font-semibold">{formatMad(calculator.daily_needed)}</span></p>
        <p className="text-slate-600 dark:text-slate-200">نسبة التقدم: <span className="font-semibold">{progress.toFixed(1)}%</span></p>
        <p className="text-slate-600 dark:text-slate-200">تاريخ الانتهاء: <span className="font-semibold">{calculator.estimated_end_date ? new Date(calculator.estimated_end_date).toLocaleDateString("ar-EG") : "-"}</span></p>
      </div>

      <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-950">
        {isImpactLoading ? <p className="text-slate-500 dark:text-slate-400">جارٍ حساب تأثير الخسائر...</p> : null}
        {!isImpactLoading && impactData.is_impossible ? (
          <p className="font-semibold text-rose-500">من المستحيل الوصول لهذا الهدف مع الخسائر الحالية.</p>
        ) : null}
        {!isImpactLoading && !impactData.is_impossible ? (
          <p className="text-amber-600 dark:text-amber-300">
            التأخير بسبب الخسائر: <span className="font-semibold">{impactData.delay_months || 0} شهر</span>
          </p>
        ) : null}
        {!isImpactLoading && impactData.impact_message ? <p className="text-slate-600 dark:text-slate-300">{impactData.impact_message}</p> : null}
        {isAchieved ? <p className="font-semibold text-emerald-400">تم تحقيق الهدف، أحسنت 🎉</p> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <button
          onClick={() => onContribute(goal)}
          disabled={isAchieved}
          className="rounded-md bg-emerald-500 px-3 py-2 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ساهم
        </button>
        <button onClick={() => onEdit(goal)} className="rounded-md bg-slate-800 px-3 py-2 text-white">
          تعديل
        </button>
        <button
          onClick={() => onAchieve(goal.id)}
          disabled={isAchieved}
          className="rounded-md bg-indigo-600 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          تم تحقيقه 🎉
        </button>
        <button onClick={() => onDelete(goal.id)} className="rounded-md bg-rose-600 px-3 py-2 text-white">
          حذف
        </button>
        {onMoveUp ? <button onClick={() => onMoveUp(goal.id)} className="rounded-md bg-slate-200 px-3 py-2 text-slate-900 dark:bg-slate-800 dark:text-slate-100">↑</button> : null}
        {onMoveDown ? <button onClick={() => onMoveDown(goal.id)} className="rounded-md bg-slate-200 px-3 py-2 text-slate-900 dark:bg-slate-800 dark:text-slate-100">↓</button> : null}
      </div>
    </article>
  );
}

