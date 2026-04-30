import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
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
  const [theme, setTheme] = useState(() => localStorage.getItem("flousi-theme") || "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("flousi-theme", theme);
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem(authTokenKey);
    if (token) {
      setAuthToken(token);
    }
    if (!token) {
      setAuthLoading(false);
      return;
    }
    const loadMe = async () => {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data.user);
      } catch (_error) {
        setUser(null);
        setAuthToken(null);
        localStorage.removeItem(authTokenKey);
      } finally {
        setAuthLoading(false);
      }
    };

    loadMe();
  }, []);

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
    </div>
  );
}
