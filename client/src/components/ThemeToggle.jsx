export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100 shadow-lg shadow-black/20"
      aria-label="Toggle theme"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}

