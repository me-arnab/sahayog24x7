import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLayout } from "../../context/LayoutContext";
import { Menu, Bell } from "lucide-react";
import { getConsumerNotices } from "../../api/notices";
import type { Notice } from "../../types/notice";
import { NoticeTypeBadge } from "../StatusBadge";

export function TopNavbar() {
  const { toggleMobileDrawer, toggleSidebar } = useLayout();
  const { displayName, admin, citizen } = useAuth();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const roleLabel = admin ? "Administrator" : citizen ? "Citizen" : "Field Worker";

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const data = await getConsumerNotices();
        // Admin sees all, Citizen sees Citizen, Worker sees Worker
        const filtered = data.filter((n) => {
          if (admin) return true;
          if (citizen) return n.audience === "Citizen";
          return n.audience === "Worker";
        });
        setNotices(filtered);
      } catch (err) {
        console.error("Failed to fetch notices for navbar", err);
      }
    };
    fetchNotices();
  }, [admin, citizen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-18 bg-white border-b border-border flex items-center justify-between px-4 lg:px-8 shrink-0 z-30">
      {/* Left section: Hamburger toggles */}
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger */}
        <button
          onClick={toggleMobileDrawer}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-navy transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Open mobile menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Desktop Hamburger (Collapse Sidebar) */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex p-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-navy transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right section: Profile & Notifications */}
      <div className="flex items-center gap-4 md:gap-6">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 text-slate-400 hover:text-navy transition-colors rounded-full hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notices.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-[320px] bg-white border border-border rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-border bg-slate-50 flex items-center justify-between">
                <h4 className="font-bold text-navy text-sm flex items-center gap-2">
                  <i className="fas fa-bell text-primary"></i> Notifications
                </h4>
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  {notices.length} New
                </span>
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {notices.length === 0 ? (
                  <div className="p-6 text-center text-text-muted text-sm flex flex-col items-center gap-2">
                    <i className="fas fa-inbox text-2xl opacity-20"></i>
                    No new notifications
                  </div>
                ) : (
                  notices.map((notice) => (
                    <div key={notice._id} className="p-4 border-b border-border hover:bg-slate-50 transition-colors last:border-b-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h5 className="font-semibold text-navy text-sm line-clamp-1">{notice.title}</h5>
                        <NoticeTypeBadge type={notice.type} />
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                        {notice.message}
                      </p>
                      <p className="text-[10px] text-text-muted mt-2 uppercase tracking-wider font-medium">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-4 md:pl-6 border-l border-border">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-bold text-navy leading-tight">{displayName}</span>
            <span className="text-xs font-medium text-text-muted">{roleLabel}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent-cyan text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
            {displayName ? displayName.charAt(0).toUpperCase() : "U"}
          </div>
        </div>
      </div>
    </header>
  );
}
