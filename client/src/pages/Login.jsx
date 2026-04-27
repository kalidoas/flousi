import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";

export default function Login({ setUser, setAuthLoading }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await api.post("/auth/login", formData);
      const meResponse = await api.get("/auth/me");
      setUser(meResponse.data.user);
      setAuthLoading(false);
      navigate("/");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Unable to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <h1 className="mb-2 text-2xl font-bold">Sign in to Flousi</h1>
        <p className="mb-5 text-sm text-slate-600 dark:text-slate-300">Track your money and stop the small leaks.</p>

        <label className="mb-2 block text-sm">Email</label>
        <input
          className="mb-4 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 outline-none ring-emerald-500 focus:ring dark:border-slate-700 dark:bg-slate-950"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label className="mb-2 block text-sm">Password</label>
        <input
          className="mb-4 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 outline-none ring-emerald-500 focus:ring dark:border-slate-700 dark:bg-slate-950"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {error ? <p className="mb-3 text-sm text-rose-500 dark:text-rose-400">{error}</p> : null}

        <button
          type="submit"
          className="w-full rounded-md bg-emerald-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Don't have an account? <Link className="text-emerald-400" to="/register">Register here</Link>
        </p>
      </form>
    </main>
  );
}

