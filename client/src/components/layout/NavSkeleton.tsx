export function NavSkeleton() {
  return (
    <div className="flex flex-col min-w-0 flex-1 opacity-60">
      <div className="h-18 bg-white border-b border-border flex items-center justify-end px-4 lg:px-8 shrink-0">
        <div className="flex items-center gap-4 animate-pulse">
          <div className="w-8 h-8 bg-slate-200 rounded-full" />
          <div className="hidden sm:flex flex-col items-end gap-2">
            <div className="w-24 h-3 bg-slate-200 rounded" />
            <div className="w-16 h-2 bg-slate-200 rounded" />
          </div>
          <div className="w-10 h-10 bg-slate-200 rounded-xl" />
        </div>
      </div>
      <div className="flex-1 p-6 flex flex-col gap-4 animate-pulse">
        <div className="w-48 h-8 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-slate-200 rounded-2xl" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
