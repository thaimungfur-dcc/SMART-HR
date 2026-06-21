import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft,
  ChevronRight,
  LogOut,
  Users,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  Library,
  Shield,
  Scale,
  Settings
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../context/AuthContext';
import { useVisibility } from '../context/ModuleVisibilityContext';
import { useLanguage } from '../context/LanguageContext';
import { MENU_ITEMS, MenuItem } from '../config/menu';
import UserSettingsModal from './UserSettingsModal';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const CATEGORIES = [
  'CORE HR & OPERATIONS',
  'RECRUITMENT',
  'PERFORMANCE & DEVELOPMENT',
  'DATA & ANALYTICS',
  'ADMINISTRATION'
];

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const { user, logout } = useAuth();
  const { visibility } = useVisibility();
  const { t } = useLanguage();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [isUserSettingsOpen, setIsUserSettingsOpen] = useState(false);

  // Auto-collapse on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsCollapsed]);

  // Determine if a parent should be active based on current path and its subitems
  const isItemActive = (item: MenuItem) => {
    const isPathActive = (targetPath: string) => {
      if (targetPath.includes('?')) {
        const [path, query] = targetPath.split('?');
        return location.pathname === path && location.search.includes(query);
      }
      return location.pathname === targetPath;
    };

    if (item.path && isPathActive(item.path)) return true;
    if (item.subItems) {
      return item.subItems.some(sub => sub.path && isPathActive(sub.path));
    }
    return false;
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (isCollapsed) return; // Don't allow expanding when collapsed
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // When expanding sidebar, maybe show active parents
  useEffect(() => {
    if (!isCollapsed) {
      const newExpanded = { ...expandedItems };
      MENU_ITEMS.forEach(item => {
        if (isItemActive(item) && item.subItems) {
          newExpanded[item.id] = true;
        }
      });
      setExpandedItems(newExpanded);
    }
  }, [location.pathname, isCollapsed]); // Only recompute on significant changes

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 300 }}
      className="relative flex h-screen flex-col bg-gradient-to-b from-[#1d2636] to-[#0F172A] shadow-2xl z-20 custom-scrollbar font-technical"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-8 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-[#212c46] text-[#b58c4f] shadow-lg border border-[#b58c4f]/20 hover:bg-[#b58c4f] hover:text-[#212c46] hover:shadow-[0_0_15px_rgba(181,140,79,0.5)] transition-all focus:outline-none active:scale-95"
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Logo Area */}
      <div className="flex h-24 items-center justify-start px-6 shrink-0">
        <div className="flex items-center gap-3 pr-2">
          <div className="relative flex h-10 w-10 items-center justify-center transition-transform duration-500 hover:scale-105 drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(50, 50)">
                <g transform="rotate(0)"><circle cx="-18" cy="-18" r="14" fill="#0ea5e9" /><path d="M -18 3 A 21 21 0 0 1 -39 -18" fill="none" stroke="#0ea5e9" strokeWidth="12" /></g>
                <g transform="rotate(90)"><circle cx="-18" cy="-18" r="14" fill="#d4af37" /><path d="M -18 3 A 21 21 0 0 1 -39 -18" fill="none" stroke="#d4af37" strokeWidth="12" /></g>
                <g transform="rotate(180)"><circle cx="-18" cy="-18" r="14" fill="#0ea5e9" /><path d="M -18 3 A 21 21 0 0 1 -39 -18" fill="none" stroke="#0ea5e9" strokeWidth="12" /></g>
                <g transform="rotate(270)"><circle cx="-18" cy="-18" r="14" fill="#d4af37" /><path d="M -18 3 A 21 21 0 0 1 -39 -18" fill="none" stroke="#d4af37" strokeWidth="12" /></g>
              </g>
            </svg>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <div className="flex items-center gap-[4px] text-[24px] font-black tracking-tighter font-exception-system transform scale-x-105 origin-left leading-none" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                <span className="text-white">SMART</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]">HR</span>
              </div>
              <div className="flex items-center mt-2 group" style={{ fontFamily: "'Inter', sans-serif" }}>
                <div className="w-3 h-[2px] bg-gradient-to-r from-[#0ea5e9] to-transparent mr-2" />
                <span className="text-[9px] font-bold text-[#7a8b95] group-hover:text-[#0ea5e9] transition-colors tracking-[0.2em] uppercase leading-none drop-shadow-md">
                  HR MANAGEMENT
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 space-y-6 sidebar-scrollbar">
        
        {/* TOP LEVEL BUTTONS */}
        <div className="space-y-2">
          {MENU_ITEMS.filter(item => item.category === 'TOP' && visibility[item.id] !== false).map(item => {
            const Icon = item.icon || LayoutDashboard;
            const active = isItemActive(item);
            return (
              <NavLink
                key={item.id}
                to={item.path || '/'}
                className={twMerge(clsx(
                  "group flex items-center rounded-xl px-4 py-2.5 text-[13px] font-black uppercase tracking-widest transition-all",
                  active
                    ? "bg-gradient-to-r from-[#3f809e] to-[#4d87a8] text-white shadow-md shadow-[#3f809e]/20" 
                    : "text-slate-300 hover:bg-white/5 hover:text-white",
                  isCollapsed && "justify-center px-0"
                ))}
                title={isCollapsed ? t(item.name) : undefined}
              >
                <Icon size={18} className={clsx("shrink-0", isCollapsed ? "mr-0" : "mr-4")} />
                {!isCollapsed && <span>{t(item.name)}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* Categories Level */}
        {CATEGORIES.map(catName => {
          const catItems = MENU_ITEMS.filter(item => item.category === catName && visibility[item.id] !== false);
          if (catItems.length === 0) return null;

          return (
            <div key={catName} className="space-y-2">
              {!isCollapsed && (
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-2 tracking-widest">
                  {t(catName)}
                </h3>
              )}
              <div className="space-y-1">
                {catItems.map((item) => {
                  const Icon = item.icon || Users;
                  const active = isItemActive(item);
                  const isExpanded = !!expandedItems[item.id] && !isCollapsed;
                  
                  const visibleSubItems = item.subItems?.filter(s => visibility[s.id] !== false) || [];

                  return (
                    <div key={item.id} className="flex flex-col">
                      {/* Parent Item */}
                      {visibleSubItems.length > 0 ? (
                        <div
                          onClick={(e) => toggleExpand(item.id, e)}
                          className={twMerge(clsx(
                            "cursor-pointer group flex items-center rounded-xl px-4 py-2 text-[12px] font-bold uppercase tracking-widest transition-all",
                            active 
                              ? "text-white bg-white/5" 
                              : "text-slate-300 hover:bg-white/5 hover:text-white",
                            isCollapsed && "justify-center px-0"
                          ))}
                          title={isCollapsed ? t(item.name) : undefined}
                        >
                          <Icon size={16} className={clsx("shrink-0", "text-slate-400 group-hover:text-white", isCollapsed ? "mr-0" : "mr-4", active && "text-white")} />
                          
                          {!isCollapsed && (
                            <>
                              <span className="flex-1 truncate">{t(item.name)}</span>
                              <div className="w-5 h-5 flex items-center justify-center">
                                {isExpanded ? <ChevronUp size={14} className={active ? "text-white/80" : "text-slate-500"} /> : <ChevronDown size={14} className={active ? "text-white/80" : "text-slate-500"} />}
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <NavLink
                          to={item.path || '/'}
                          className={twMerge(clsx(
                            "group flex items-center rounded-xl px-4 py-2 text-[12px] font-bold uppercase tracking-widest transition-all",
                            active 
                              ? "bg-gradient-to-r from-[#3f809e] to-[#4d87a8] text-white shadow-md shadow-[#3f809e]/20" 
                              : "text-slate-300 hover:bg-white/5 hover:text-white",
                            isCollapsed && "justify-center px-0"
                          ))}
                          title={isCollapsed ? t(item.name) : undefined}
                        >
                          <Icon size={16} className={clsx("shrink-0", "text-slate-400 group-hover:text-white", isCollapsed ? "mr-0" : "mr-4", active && "text-white")} />
                          {!isCollapsed && <span className="flex-1 truncate">{t(item.name)}</span>}
                        </NavLink>
                      )}

                       {/* Sub Items */}
                       <AnimatePresence>
                         {isExpanded && visibleSubItems.length > 0 && (
                           <motion.div
                             initial={{ height: 0, opacity: 0 }}
                             animate={{ height: 'auto', opacity: 1 }}
                             exit={{ height: 0, opacity: 0 }}
                             className="flex flex-col overflow-hidden ml-9 mt-1 space-y-0.5"
                           >
                             {visibleSubItems.map((subItem) => {
                               const isActive = subItem.path.includes('?')
                                 ? (location.pathname === subItem.path.split('?')[0] && location.search.includes(subItem.path.split('?')[1]))
                                 : (location.pathname === subItem.path && !location.search);

                               return (
                                 <NavLink
                                   key={subItem.id}
                                   to={subItem.path}
                                   className={twMerge(clsx(
                                     "group flex items-center gap-2 py-1.5 px-3 rounded-lg text-[11px] font-bold uppercase transition-all tracking-[0.05em]",
                                     isActive 
                                       ? "bg-gradient-to-r from-[#3f809e] to-[#4d87a8] text-white shadow-md shadow-[#3f809e]/20" 
                                       : "text-slate-400 hover:bg-white/5 hover:text-white"
                                   ))}
                                 >
                                   <div className={twMerge(clsx(
                                     "w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300",
                                     isActive ? "bg-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "bg-[#b58c4f] group-hover:scale-125"
                                   ))} />
                                   <span className="truncate">{t(subItem.name)}</span>
                                 </NavLink>
                               );
                             })}
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Actual User Profile Area */}
      {user && (
        <div className="p-4 shrink-0 border-t border-slate-700/30">
          <div className={clsx("flex items-center justify-between", isCollapsed ? "justify-center" : "gap-3")}>
            <div 
              onClick={() => setIsUserSettingsOpen(true)}
              className="flex items-center gap-3 overflow-hidden cursor-pointer hover:bg-white/5 p-1.5 rounded-xl transition-all"
              title="Edit Profile Settings"
            >
              <div className="relative group shrink-0">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="h-10 w-10 shrink-0 rounded-full object-cover border border-[#b58c4f]/40 group-hover:border-[#3f809e] transition-colors"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#3f809e] to-[#4d87a8] text-white font-black uppercase text-[16px] group-hover:from-[#b58c4f] transition-colors">
                    {user.name.charAt(0)}
                  </div>
                )}
                {/* Subtle overlay indicator */}
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold transition-opacity">
                  EDIT
                </div>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-[12px] font-black text-white hover:text-[#b58c4f] transition-colors uppercase tracking-widest">{user.name}</span>
                  <span className="truncate text-[9px] text-[#b58c4f] font-black uppercase tracking-[0.1em] mt-0.5">{user.role || 'LEAD DEVELOPER'}</span>
                  <span className="truncate text-[9px] text-slate-500 font-medium tracking-tight mt-0.5">{user.email || 'tallintelligence.dcc@gmail.com'}</span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsUserSettingsOpen(true)}
                  className="p-1.5 text-slate-400 hover:text-[#3f809e] hover:bg-white/5 rounded-lg transition-colors shrink-0"
                  title="Profile Settings"
                >
                  <Settings size={15} />
                </button>
                <button 
                  onClick={logout} 
                  className="p-1.5 text-slate-400 hover:text-[#932c2e] hover:bg-[#932c2e]/10 rounded-lg transition-colors shrink-0" 
                  title="Logout"
                >
                  <LogOut size={15} />
                </button>
              </div>
            )}
          </div>
          {isCollapsed && (
            <div className="mt-2 flex flex-col gap-1 w-full items-center">
              <button
                onClick={() => setIsUserSettingsOpen(true)}
                className="p-2 text-slate-400 hover:text-[#3f809e] hover:bg-white/5 rounded-lg transition-colors"
                title="Profile Settings"
              >
                <Settings size={16} />
              </button>
              <button 
                onClick={logout} 
                className="p-2 text-slate-400 hover:text-[#932c2e] hover:bg-[#932c2e]/10 rounded-lg transition-colors" 
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      <UserSettingsModal 
        isOpen={isUserSettingsOpen}
        onClose={() => setIsUserSettingsOpen(false)}
      />

    </motion.aside>
  );
}

