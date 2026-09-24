import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Configure admin preferences and security.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-12 border border-slate-200/80 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#b4833e]/10 text-[#b4833e] flex items-center justify-center mb-4">
          <SettingsIcon size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Hello! 👋</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-md">
          Settings and administration profile controls are ready here.
        </p>
      </div>
    </div>
  );
};

export default Settings;
