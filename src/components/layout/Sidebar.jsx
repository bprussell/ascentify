import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BookOpen,
  BarChart3,
  MessageSquare,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "New Hires", path: "/new-hires" },
  { icon: ClipboardCheck, label: "Checklists", path: "/checklists" },
  { icon: Calendar, label: "Training", path: "/training" },
  { icon: BookOpen, label: "Resources", path: "/resources" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: MessageSquare, label: "Feedback", path: "/feedback" },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();

  const handleLogout = () => {
    base44.auth.logout("/login");
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: expanded ? 240 : 72 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="h-screen sticky top-0 bg-white border-r border-slate-100 flex flex-col z-30"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-mint to-mint-dark flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">O</span>
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="ml-3 font-heading font-semibold text-slate-900 text-lg whitespace-nowrap"
            >
              Onboard
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? "bg-mint-50 text-mint-dark"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-mint rounded-r-full"
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                />
              )}
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-mint-dark" : ""}`} />
              <AnimatePresence>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 space-y-1">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all duration-200 w-full"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Log Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center w-full py-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all duration-200"
        >
          {expanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  );
}