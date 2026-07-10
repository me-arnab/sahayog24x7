interface NoticeFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  sortOrder: "newest" | "oldest";
  onSortOrderChange: (value: "newest" | "oldest") => void;
  onClear: () => void;
}

export function NoticeFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  sortOrder,
  onSortOrderChange,
  onClear,
}: NoticeFiltersProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-fit">
      <h3 className="text-lg font-bold text-navy mb-5 flex items-center gap-2">
        <i className="fas fa-sliders-h text-primary"></i> Filters
      </h3>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Search
          </label>
          <div className="relative">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xs"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title..."
              className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Notice Type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="w-full p-2.5 border border-border rounded-xl bg-bg text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          >
            <option value="all">All Types</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Payment">Payment</option>
            <option value="Outage">Outage</option>
            <option value="General">General</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full p-2.5 border border-border rounded-xl bg-bg text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Sort
          </label>
          <select
            value={sortOrder}
            onChange={(e) =>
              onSortOrderChange(e.target.value as "newest" | "oldest")
            }
            className="w-full p-2.5 border border-border rounded-xl bg-bg text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        <button
          onClick={onClear}
          className="w-full py-2.5 border border-border rounded-xl text-sm font-semibold text-text-secondary
            hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
        >
          <i className="fas fa-times mr-1.5"></i> Clear Filters
        </button>
      </div>
    </div>
  );
}
