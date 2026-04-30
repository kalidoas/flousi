import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, authTokenKey, setAuthToken } from "../lib/api.js";

export default function Login({ setUser, setAuthLoading }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetStep, setResetStep] = useState("request");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await api.post("/auth/login", formData);
      const { user, token } = response.data;
      if (token) {
        localStorage.setItem(authTokenKey, token);
        setAuthToken(token);
      }
      setUser(user);
      setAuthLoading(false);
      navigate("/");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "تعذر تسجيل الدخول");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openResetModal = () => {
    setResetOpen(true);
    setResetStep("request");
    setResetEmail("");
    setResetCode("");
    setResetPassword("");
    setResetError("");
    setResetMessage("");
  };

  const handleRequestReset = async (event) => {
    event.preventDefault();
    setResetError("");
    setResetMessage("");
    setIsResetting(true);

    try {
      await api.post("/auth/forgot-password", { email: resetEmail });
      setResetMessage("تم إرسال كود الاسترجاع إلى بريدك.");
      setResetStep("verify");
    } catch (apiError) {
      setResetError(apiError.response?.data?.message || "تعذر إرسال كود الاسترجاع");
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setResetError("");
    setResetMessage("");
    setIsResetting(true);

    try {
      await api.post("/auth/reset-password", {
        email: resetEmail,
        code: resetCode,
        newPassword: resetPassword
      });
      setResetMessage("تم تحديث كلمة المرور بنجاح.");
      setResetOpen(false);
    } catch (apiError) {
      setResetError(apiError.response?.data?.message || "تعذر تحديث كلمة المرور");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <h1 className="mb-2 text-2xl font-bold">سجّل الدخول إلى فلوسي</h1>
        <p className="mb-5 text-sm text-slate-600 dark:text-slate-300">تتبّع مالك ووقف التسريبات الصغيرة.</p>

        <label className="mb-2 block text-sm">البريد الإلكتروني</label>
        <input
          className="mb-4 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 outline-none ring-emerald-500 focus:ring dark:border-slate-700 dark:bg-slate-950"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label className="mb-2 block text-sm">كلمة المرور</label>
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
          {isSubmitting ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
        </button>

        <button
          type="button"
          onClick={openResetModal}
          className="mt-3 w-full text-sm text-emerald-500"
        >
          نسيت كلمة المرور؟
        </button>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          ليس لديك حساب؟ <Link className="text-emerald-400" to="/register">سجّل من هنا</Link>
        </p>
      </form>

      {resetOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
          <div className="h-full w-full max-w-none rounded-none border border-slate-200 bg-white p-6 text-slate-900 shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 sm:h-auto sm:max-w-md sm:rounded-2xl">
            <h2 className="mb-2 text-lg font-semibold">استرجاع كلمة المرور</h2>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
              {resetStep === "request" ? "أدخل بريدك لإرسال كود الاسترجاع." : "أدخل الكود وكلمة المرور الجديدة."}
            </p>

            {resetError ? <p className="mb-3 text-sm text-rose-500 dark:text-rose-400">{resetError}</p> : null}
            {resetMessage ? <p className="mb-3 text-sm text-emerald-500">{resetMessage}</p> : null}

            {resetStep === "request" ? (
              <form onSubmit={handleRequestReset} className="space-y-3">
                <input
                  className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={resetEmail}
                  onChange={(event) => setResetEmail(event.target.value)}
                  required
                />
                <div className="flex gap-2">
                  <button type="submit" disabled={isResetting} className="flex-1 rounded-md bg-emerald-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60">
                    {isResetting ? "جارٍ الإرسال..." : "إرسال الكود"}
                  </button>
                  <button type="button" onClick={() => setResetOpen(false)} className="rounded-md bg-slate-200 px-4 py-2 dark:bg-slate-800">
                    إغلاق
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <input
                  className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={resetEmail}
                  onChange={(event) => setResetEmail(event.target.value)}
                  required
                />
                <input
                  className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                  type="text"
                  placeholder="كود الاسترجاع (6 أرقام)"
                  value={resetCode}
                  onChange={(event) => setResetCode(event.target.value)}
                  required
                />
                <input
                  className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                  type="password"
                  placeholder="كلمة المرور الجديدة"
                  value={resetPassword}
                  onChange={(event) => setResetPassword(event.target.value)}
                  required
                />
                <div className="flex gap-2">
                  <button type="submit" disabled={isResetting} className="flex-1 rounded-md bg-emerald-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60">
                    {isResetting ? "جارٍ التحديث..." : "تحديث كلمة المرور"}
                  </button>
                  <button type="button" onClick={() => setResetOpen(false)} className="rounded-md bg-slate-200 px-4 py-2 dark:bg-slate-800">
                    إغلاق
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
