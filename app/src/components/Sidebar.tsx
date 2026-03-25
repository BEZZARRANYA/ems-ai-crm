import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Receipt,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/clients', icon: Users, label: 'Clients' },
  { path: '/events', icon: Calendar, label: 'Events' },
  { path: '/contracts', icon: FileText, label: 'Contracts' },
  { path: '/invoices', icon: Receipt, label: 'Invoices' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const location = useLocation();
  const auth = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleLogout = () => {
    auth.logout();
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={`fixed left-0 top-0 h-screen bg-[#0a0f1c]/80 backdrop-blur-xl border-r border-white/5 transition-all duration-300 z-50 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff8a01] to-[#ff6b00] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#ff8a01]/30">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold text-white">EMS</span>
            )}
          </div>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] rounded-full flex items-center justify-center text-white shadow-lg hover:from-[#ff9500] hover:to-[#ff7b00] transition-all"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isHovered = hoveredItem === item.path;

            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    onMouseEnter={() => setHoveredItem(item.path)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group ${
                      isActive
                        ? 'bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] text-white shadow-lg shadow-[#ff8a01]/30'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-transform duration-300 ${
                        isHovered && !isActive ? 'scale-110' : ''
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                    {isActive && !isCollapsed && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </NavLink>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="bg-[#0a0f1c] border-white/10 text-white">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-3 right-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className={`w-full flex items-center gap-3 text-white/50 hover:text-white hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 ${
                  isCollapsed ? 'justify-center px-2' : 'justify-start px-3'
                }`}
              >
                <LogOut className="w-5 h-5" />
                {!isCollapsed && <span className="font-medium">Logout</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="bg-[#0a0f1c] border-white/10 text-white">
                Logout
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
