export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-lg shadow-black/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:shadow-black/20"
      aria-label="Toggle theme"
      title={theme === "dark" ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"}
    >
      {theme === "dark" ? "☀️ فاتح" : "🌙 داكن"}
    </button>
  );
}

