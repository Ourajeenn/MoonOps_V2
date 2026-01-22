import {
  LayoutDashboard,
  FolderGit2,
  GitBranch,
  Activity,
  Settings,
  Shield,
  LogOut,
  LifeBuoy,
  ChevronLeft,
  Menu,
  ChevronRight
} from 'lucide-react';
import moonopsLogo from '@/assets/moonops-logo.png';
import { cn } from '@/app/components/ui/utils';
import { Button } from '@/app/components/ui/button';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects', label: 'Projets', icon: FolderGit2 },
  { id: 'cicd', label: 'CI/CD', icon: GitBranch },
  { id: 'monitoring', label: 'Monitoring', icon: Activity },
  { id: 'security', label: 'Sécurité', icon: Shield },
  { id: 'helpdesk', label: 'Help Desk', icon: LifeBuoy },
  { id: 'admin', label: 'Administration', icon: Settings },
];

export function Sidebar({ activeView, onViewChange, onLogout, isCollapsed, setIsCollapsed }: SidebarProps) {
  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="bg-white border-r border-slate-200 flex flex-col h-screen relative shadow-2xl z-50 overflow-hidden"
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="bg-white rounded-xl shadow-lg border border-slate-50 p-1 flex-shrink-0" style={{ width: 40, height: 40 }}>
            <img src={moonopsLogo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <h1 className="font-black text-xl text-slate-900 tracking-tighter">MoonOps</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enterprise</p>
            </motion.div>
          )}
        </div>
      </div>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-white border border-slate-200 rounded-full p-1 shadow-md hover:bg-slate-50 z-50 text-slate-400"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <div key={item.id} className="relative">
              <button
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative group",
                  isActive
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-blue-400" : "group-hover:text-blue-500")} />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-bold tracking-tight"
                  >
                    {item.label}
                  </motion.span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-slate-900 rounded-2xl -z-10"
                  />
                )}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Profile/Logout */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        {!isCollapsed && (
          <div className="flex items-center gap-3 mb-6 p-2 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black shadow-lg shadow-blue-200">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-900 truncate">Admin DevOps</p>
              <p className="text-[10px] text-slate-400 font-bold truncate">PLATFORM_OWNER</p>
            </div>
          </div>
        )}
        <Button
          variant="outline"
          className={cn(
            "w-full border-slate-200 transition-all font-bold text-xs uppercase tracking-widest h-11",
            isCollapsed ? "px-0 justify-center" : "justify-start px-4"
          )}
          onClick={onLogout}
        >
          <LogOut className={cn("w-4 h-4 text-rose-500", !isCollapsed && "mr-3")} />
          {!isCollapsed && "Quitter"}
        </Button>
      </div>
    </motion.div>
  );
}