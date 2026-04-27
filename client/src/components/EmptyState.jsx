export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-900/70">
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mx-auto max-w-md text-sm text-slate-600 dark:text-slate-300">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

