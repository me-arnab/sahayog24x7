import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLayout } from "../../context/LayoutContext";
import { citizenMenu, workerMenu, adminMenu } from "../../config/navigation";
import logo from "../../assets/logo.png";
import { LogOut, ChevronRight, Zap } from "lucide-react";

export function Sidebar() {
  const { isSidebarCollapsed, isMobileDrawerOpen, closeMobileDrawer } = useLayout();
  const { admin, citizen, logout } = useAuth();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menus = admin ? adminMenu : citizen ? citizenMenu : workerMenu;

  const getIconColor = (name: string, isActive: boolean) => {
    if (isActive) return "text-white";
    switch (name) {
      case "Dashboard": return "text-blue-500";
      case "Manage Complaints": return "text-blue-400";
      case "Manage Notices": return "text-purple-500";
      case "Inquiries": return "text-green-500";
      case "Workers": return "text-orange-500";
      default: return "text-slate-400";
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobileDrawer}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-[#0A0F1C] border-r border-slate-800/50
          flex flex-col relative overflow-hidden
          transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? "w-20" : "w-[280px]"}
          ${isMobileDrawerOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 shrink-0 relative z-10 mt-2">
          <Link
            to="/"
            className="flex items-center gap-4 no-underline overflow-hidden w-full"
            onClick={closeMobileDrawer}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0B1120] to-[#131B2F] border border-blue-500/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Zap className="w-5 h-5 text-blue-400 fill-blue-400" />
            </div>
            <span
              className={`text-[22px] font-bold text-white whitespace-nowrap transition-opacity duration-300 ${
                isSidebarCollapsed ? "opacity-0 hidden lg:block" : "opacity-100"
              }`}
            >
              Sahayog<span className="text-blue-500">24</span>
              <span className="text-teal-400">x7</span>
            </span>
          </Link>
        </div>

        {/* Navigation Menus */}
        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar relative z-10 px-4">
          {menus.map((group, i) => (
            <div key={i} className="mb-6">
              {group.title && (
                <div
                  className={`text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2 transition-opacity duration-300 ${
                    isSidebarCollapsed ? "opacity-0 hidden lg:block" : "opacity-100"
                  }`}
                >
                  {group.title}
                </div>
              )}
              <ul className="space-y-3 list-none m-0 p-0">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;
                  const iconColor = getIconColor(item.name, isActive);

                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={closeMobileDrawer}
                        className={`
                          flex items-center gap-4 px-4 py-3.5 rounded-2xl no-underline font-medium transition-all duration-300 group relative
                          ${
                            isActive
                              ? "bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-transparent"
                              : "bg-[#111827]/60 border border-slate-800/60 text-slate-300 hover:bg-[#1f2937]/80 hover:border-slate-700 hover:text-white"
                          }
                        `}
                        title={isSidebarCollapsed ? item.name : undefined}
                      >
                        {isActive && (
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                        <Icon
                          className={`w-[22px] h-[22px] shrink-0 transition-colors relative z-10 ${iconColor}`}
                        />
                        <span
                          className={`whitespace-nowrap transition-opacity duration-300 text-[15px] relative z-10 ${
                            isSidebarCollapsed ? "opacity-0 hidden lg:block" : "opacity-100"
                          }`}
                        >
                          {item.name}
                        </span>

                        {!isSidebarCollapsed && (
                          <div className="ml-auto flex items-center relative z-10">
                            {item.badge && (
                              <span className="bg-error text-white text-[10px] font-bold px-2 py-0.5 rounded-full mr-2">
                                {item.badge}
                              </span>
                            )}
                            <ChevronRight className={`w-4 h-4 transition-colors ${isActive ? "text-white/80" : "text-slate-500 group-hover:text-slate-300"}`} />
                          </div>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Logout Section */}
        <div className="p-4 shrink-0 relative z-10 pb-8">
          <button
            onClick={() => setShowLogoutModal(true)}
            className={`
              flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl font-medium transition-all
              bg-[#111827]/80 text-slate-300 hover:text-white border border-slate-800/60 hover:border-slate-700
              cursor-pointer group relative overflow-hidden shadow-sm
            `}
            title={isSidebarCollapsed ? "Logout" : undefined}
          >
            {/* Left red glow accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-400 to-red-600 rounded-l-2xl shadow-[0_0_10px_rgba(239,68,68,0.8)] opacity-80 group-hover:opacity-100 transition-opacity" />
            
            <LogOut className="w-[22px] h-[22px] shrink-0 text-red-400 group-hover:text-red-300 ml-1 transition-colors relative z-10" />
            <span
              className={`whitespace-nowrap transition-opacity duration-300 text-[15px] relative z-10 ${
                isSidebarCollapsed ? "opacity-0 hidden lg:block" : "opacity-100"
              }`}
            >
              Logout
            </span>
            
            {!isSidebarCollapsed && (
              <ChevronRight className="w-4 h-4 ml-auto text-slate-500 group-hover:text-slate-300 transition-colors relative z-10" />
            )}
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-[60] flex items-center justify-center p-5"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-card rounded-2xl max-w-sm w-full shadow-2xl border border-border p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 text-error flex items-center justify-center mb-4 mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-navy text-center mb-2">Confirm Logout</h3>
            <p className="text-sm text-text-muted text-center mb-6">
              Are you sure you want to log out of your account? You will need to log in again to access your dashboard.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-border text-text-secondary hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  logout();
                  closeMobileDrawer();
                  setShowLogoutModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-error text-white hover:bg-red-600 transition-all shadow-md shadow-red-500/20 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
