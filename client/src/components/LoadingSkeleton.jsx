export default function LoadingSkeleton({ className = "h-4 w-full", rounded = true }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-slate-800/70 ${rounded ? "rounded-lg" : ""} ${className}`}
    />
  );
}

