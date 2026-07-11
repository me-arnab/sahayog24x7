import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  History,
  Users,
  ClipboardList,
  BarChart3,
  Bell,
  User,
  KeyRound,
  LogOut,
  Settings,
  ClipboardCheck,
  Mail,
  UserPlus,
  Shield,
} from "lucide-react";
import React from "react";

export interface NavItem {
  name: string;
  href: string;
  icon: React.FC<any>;
  badge?: number;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export const citizenMenu: NavGroup[] = [
  {
    items: [
      { name: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
      { name: "Notices", href: "/user/notices", icon: Bell },
    ],
  },
];

export const workerMenu: NavGroup[] = [
  {
    items: [
      { name: "Dashboard", href: "/worker/dashboard", icon: LayoutDashboard },
      { name: "Submitted Reports", href: "/worker/submitted", icon: ClipboardCheck },
      { name: "Notices", href: "/worker/notices", icon: Bell },
    ],
  },
];

export const adminMenu: NavGroup[] = [
  {
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Manage Complaints", href: "/admin/complaints", icon: ClipboardList },
      { name: "Manage Notices", href: "/admin/notices", icon: Bell },
      { name: "Work Reports", href: "/admin/reports", icon: ClipboardCheck },
      { name: "Inquiries", href: "/admin/inquiries", icon: Mail },
      { name: "Workers", href: "/admin/add-worker", icon: UserPlus },
      { name: "Admins", href: "/admin/add-admin", icon: Shield },
    ],
  },
];
