export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 p-6 text-center">
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mx-auto max-w-md text-sm text-slate-300">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

