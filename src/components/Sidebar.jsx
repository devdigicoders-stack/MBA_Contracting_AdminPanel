import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, MessageSquare, Settings, LogOut, User } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('mba_admin_token');
    localStorage.removeItem('mba_admin_user');
    localStorage.removeItem('mba_admin_auth');
    navigate('/login', { replace: true });
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Blog', path: '/blog', icon: FileText },
    { name: 'Contact', path: '/contact', icon: MessageSquare },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-[#0d141e] text-white flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto border-r border-slate-800 select-none scrollbar-none">
      <div>
        {/* Logo Section */}
        <div className="px-6 py-7 flex items-center gap-3.5 border-b border-slate-800/60">
          {/* Stylized Architectural Gold Logo */}
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 36 36" fill="none" className="w-9 h-9">
              <rect x="6" y="10" width="6" height="20" rx="1" stroke="#c59a4c" strokeWidth="2.2" />
              <path d="M15 4L21 8V30H15V4Z" stroke="#c59a4c" strokeWidth="2.2" />
              <rect x="24" y="12" width="6" height="18" rx="1" stroke="#c59a4c" strokeWidth="2.2" />
              <line x1="18" y1="12" x2="18" y2="24" stroke="#c59a4c" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-wider text-white leading-none">MBA</span>
            <span className="text-[10px] tracking-[0.25em] text-slate-300 font-semibold mt-1">CONTRACTING</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#b4833e] text-white shadow-md shadow-[#b4833e]/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Settings & Logout */}
      <div className="p-4 border-t border-slate-800/60 space-y-1.5 mb-2">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-[#b4833e] text-white shadow-md shadow-[#b4833e]/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`
          }
        >
          <Settings size={18} className="shrink-0" />
          <span>Settings</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
        >
          <LogOut size={18} className="shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
