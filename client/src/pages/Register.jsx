import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";

export default function Register({ setUser, setAuthLoading }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
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
      await api.post("/auth/register", formData);
      const meResponse = await api.get("/auth/me");
      setUser(meResponse.data.user);
      setAuthLoading(false);
      navigate("/");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "تعذر إنشاء الحساب");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <h1 className="mb-2 text-2xl font-bold">تسجيل جديد</h1>
        <p className="mb-5 text-sm text-slate-600 dark:text-slate-300">بدا تتبع فلوسك اليوم.</p>

        <label className="mb-2 block text-sm">الاسم</label>
        <input
          className="mb-4 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 outline-none ring-emerald-500 focus:ring dark:border-slate-700 dark:bg-slate-950"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label className="mb-2 block text-sm">الإيميل</label>
        <input
          className="mb-4 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 outline-none ring-emerald-500 focus:ring dark:border-slate-700 dark:bg-slate-950"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label className="mb-2 block text-sm">الباسورد</label>
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
          {isSubmitting ? "كينتظر..." : "سجل"}
        </button>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          عندك حساب؟ <Link className="text-emerald-400" to="/login">دخل من هنا</Link>
        </p>
      </form>
    </main>
  );
}

