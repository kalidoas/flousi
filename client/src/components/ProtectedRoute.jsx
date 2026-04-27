import { Navigate } from "react-router-dom";
import LoadingSkeleton from "./LoadingSkeleton.jsx";

export default function ProtectedRoute({ isAuthenticated, isLoading, children }) {
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
        <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <LoadingSkeleton className="h-6 w-40" />
          <LoadingSkeleton className="h-4 w-72" />
          <div className="grid grid-cols-2 gap-3 pt-2">
            <LoadingSkeleton className="h-20" />
            <LoadingSkeleton className="h-20" />
          </div>
          <LoadingSkeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

