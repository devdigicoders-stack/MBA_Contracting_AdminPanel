import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, User } from 'lucide-react';

const Topbar = () => {
  return (
    <header className="h-18 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20 shrink-0">
      {/* Search Bar */}
      <div className="relative w-72 md:w-96">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search size={16} />
        </span>
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50/80 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b4833e]/30 focus:border-[#b4833e] transition-all"
        />
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-5">
        {/* Notification Bell */}
        <button
          aria-label="Notifications"
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#b4833e] rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Profile Link */}
        <Link
          to="/profile"
          className="flex items-center gap-3 pl-3 border-l border-slate-200 hover:opacity-85 transition-opacity cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-[#1e293b] flex items-center justify-center text-white font-semibold text-sm shadow-sm overflow-hidden">
            <User size={20} className="text-slate-300" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-sm font-bold text-slate-800 leading-tight">
              {(() => {
                try {
                  const u = JSON.parse(localStorage.getItem('mba_admin_user'));
                  return u?.name || 'Admin';
                } catch {
                  return 'Admin';
                }
              })()}
            </span>
            <span className="text-[11px] text-slate-400 font-medium capitalize">
              {(() => {
                try {
                  const u = JSON.parse(localStorage.getItem('mba_admin_user'));
                  return u?.role || 'Super Admin';
                } catch {
                  return 'Super Admin';
                }
              })()}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Topbar;
