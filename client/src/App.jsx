import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import { api, authTokenKey, setAuthToken } from "./lib/api.js";
import Analytics from "./pages/Analytics.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Goals from "./pages/Goals.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("flousi-theme") || "dark");
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("flousi-theme", theme);
  }, [theme]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");
    if (urlToken) {
      localStorage.setItem(authTokenKey, urlToken);
      setAuthToken(urlToken);
      window.history.replaceState({}, "", window.location.pathname);
    }

    const token = localStorage.getItem(authTokenKey);
    if (!token) {
      setAuthLoading(false);
      setAuthChecked(true);
      return;
    }

    const loadMe = async () => {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data.user || response.data);
      } catch (_error) {
        localStorage.removeItem(authTokenKey);
      } finally {
        setAuthLoading(false);
        setAuthChecked(true);
      }
    };

    loadMe();
  }, []);

  if (!authChecked) {
    return <div className="flex min-h-screen items-center justify-center text-slate-600 dark:text-slate-300">جاري التحميل...</div>;
  }

  const showBottomNav = Boolean(user) && !authLoading && !["/login", "/register"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="fixed left-4 top-4 z-50">
        <ThemeToggle theme={theme} onToggle={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))} />
      </div>

      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={Boolean(user)} isLoading={authLoading}>
              <Dashboard user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute isAuthenticated={Boolean(user)} isLoading={authLoading}>
              <Goals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute isAuthenticated={Boolean(user)} isLoading={authLoading}>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            user ? <Navigate to="/" replace /> : <Login setUser={setUser} setAuthLoading={setAuthLoading} />
          }
        />
        <Route
          path="/register"
          element={
            user ? <Navigate to="/" replace /> : <Register setUser={setUser} setAuthLoading={setAuthLoading} />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showBottomNav ? (
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 text-xs shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 sm:hidden">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <Link to="/" className="flex flex-1 flex-col items-center gap-1 text-slate-700 dark:text-slate-200">
              <span className="text-lg">🏠</span>
              <span>لوحة التحكم</span>
            </Link>
            <Link to="/analytics" className="flex flex-1 flex-col items-center gap-1 text-slate-700 dark:text-slate-200">
              <span className="text-lg">📊</span>
              <span>التحليلات</span>
            </Link>
            <Link to="/goals" className="flex flex-1 flex-col items-center gap-1 text-slate-700 dark:text-slate-200">
              <span className="text-lg">🎯</span>
              <span>الأهداف</span>
            </Link>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
