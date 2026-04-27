import { Navigate } from "react-router-dom";
import LoadingSkeleton from "./LoadingSkeleton.jsx";

export default function ProtectedRoute({ isAuthenticated, isLoading, children }) {
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <LoadingSkeleton className="h-6 w-40" />
          <LoadingSkeleton className="h-4 w-72" />
          <div className="grid grid-cols-2 gap-3 pt-2">
            <LoadingSkeleton className="h-20" />
            <LoadingSkeleton className="h-20" />
          </div>
          <LoadingSkeleton className="h-10 w-full" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

