import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Calendar,
  Sparkles,
  Lock,
} from 'lucide-react';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'admin',
    avatar: '',
    createdAt: '',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    avatar: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

  const showAlert = (message, type = 'success') => {
    setAlertInfo({ show: true, message, type });
    setTimeout(() => {
      setAlertInfo({ show: false, message: '', type: 'success' });
    }, 4500);
  };

  // 1. Fetch current profile details (GET /api/v1/users/me)
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('mba_admin_token');
      const response = await fetch(`${apiUrl}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const user = result.data;
        setProfileData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          role: user.role || 'admin',
          avatar: user.avatar || '',
          createdAt: user.createdAt || '',
        });

        setEditForm({
          name: user.name || '',
          phone: user.phone || '',
          avatar: user.avatar || '',
        });

        // Update local storage so Topbar stays in sync
        localStorage.setItem('mba_admin_user', JSON.stringify(user));
      } else {
        showAlert(result.message || 'Failed to load profile details', 'error');
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
      showAlert('Unable to connect to server. Please check backend port 5001.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 2. Update Profile details (PATCH/PUT /api/v1/users/update-profile)
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      showAlert('Name cannot be empty', 'error');
      return;
    }

    setProfileSaving(true);
    try {
      const token = localStorage.getItem('mba_admin_token');
      const response = await fetch(`${apiUrl}/users/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editForm.name,
          phone: editForm.phone,
          avatar: editForm.avatar,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const updated = result.data;
        setProfileData((prev) => ({
          ...prev,
          name: updated.name,
          phone: updated.phone,
          avatar: updated.avatar,
        }));

        // Keep localStorage synced for Topbar and other components
        const currentUser = JSON.parse(localStorage.getItem('mba_admin_user') || '{}');
        localStorage.setItem(
          'mba_admin_user',
          JSON.stringify({ ...currentUser, ...updated })
        );

        showAlert('Profile updated successfully! 🎉');
      } else {
        showAlert(result.message || 'Failed to update profile', 'error');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      showAlert('Network error while updating profile', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  // 3. Change Password (PUT /api/v1/users/change-password)
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      showAlert('Please enter your current password', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showAlert('New password must be at least 6 characters long', 'error');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showAlert('New password and confirm password do not match', 'error');
      return;
    }

    setPasswordSaving(true);
    try {
      const token = localStorage.getItem('mba_admin_token');
      const response = await fetch(`${apiUrl}/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showAlert('Password changed successfully! 🔐');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        showAlert(result.message || 'Failed to change password. Check current password.', 'error');
      }
    } catch (err) {
      console.error('Password change error:', err);
      showAlert('Network error while changing password', 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const memberSinceYear = profileData.createdAt
    ? new Date(profileData.createdAt).getFullYear()
    : '2026';

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Alert Notification */}
      {alertInfo.show && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border text-sm font-semibold transition-all animate-bounce ${
            alertInfo.type === 'success'
              ? 'bg-emerald-900/90 text-white border-emerald-700 shadow-emerald-900/20'
              : 'bg-red-900/90 text-white border-red-700 shadow-red-900/20'
          }`}
        >
          {alertInfo.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-red-400 shrink-0" />
          )}
          <span>{alertInfo.message}</span>
          <button
            onClick={() => setAlertInfo({ show: false, message: '', type: 'success' })}
            className="ml-2 text-white/70 hover:text-white cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-[#b4833e]/10 text-[#b4833e]">
            <User size={24} />
          </span>
          <span>Admin Profile</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
          Manage your personal information, contact numbers, and security credentials.
        </p>
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-200/80">
          <div className="w-10 h-10 border-4 border-[#b4833e] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium">Loading profile from database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Profile Overview Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm text-center relative overflow-hidden">
              {/* Subtle architectural gold accent on top */}
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#b4833e] via-[#c59a4c] to-[#b4833e]" />

              {/* Avatar circle */}
              <div className="w-24 h-24 rounded-full mx-auto mt-2 bg-slate-900 text-[#b4833e] flex items-center justify-center text-2xl font-black shadow-lg shadow-slate-900/10 border-4 border-white ring-4 ring-[#b4833e]/20 overflow-hidden">
                {profileData.avatar ? (
                  <img
                    src={profileData.avatar}
                    alt={profileData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{getInitials(profileData.name)}</span>
                )}
              </div>

              {/* Name & Role */}
              <h2 className="text-xl font-extrabold text-slate-900 mt-4 leading-tight">
                {profileData.name || 'Admin User'}
              </h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#b4833e]/10 text-[#b4833e] rounded-full text-xs font-bold uppercase tracking-wider mt-2 border border-[#b4833e]/20">
                <Shield size={13} />
                <span>{profileData.role || 'Super Admin'}</span>
              </div>

              {/* Email & Phone List */}
              <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-3.5 text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <Mail size={15} />
                  </div>
                  <div className="truncate">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Email Address</p>
                    <p className="font-semibold text-slate-800 truncate">{profileData.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <Phone size={15} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Phone</p>
                    <p className="font-semibold text-slate-800">
                      {profileData.phone || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <Calendar size={15} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Active Since</p>
                    <p className="font-semibold text-slate-800">{memberSinceYear}</p>
                  </div>
                </div>
              </div>

              {/* Security Status Box */}
              <div className="mt-6 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">Secure Session Active</h4>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    JWT authentication is verified with full access.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Edit Information & Change Password Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Form 1: Edit Profile */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-[#b4833e]/10 text-[#b4833e] flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                    Personal Information
                  </h3>
                  <p className="text-xs text-slate-400">Update your name, phone, and profile avatar.</p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="mt-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User size={16} />
                      </div>
                      <input
                        type="text"
                        required
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Your full name"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b4833e]/30 focus:border-[#b4833e] transition-all"
                      />
                    </div>
                  </div>

                  {/* Email (Read-Only) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Email Address <span className="text-[10px] text-slate-400 normal-case">(Managed by Super Admin)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        disabled
                        value={profileData.email}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed select-none"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone size={16} />
                      </div>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="+974 5555 0000"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b4833e]/30 focus:border-[#b4833e] transition-all"
                      />
                    </div>
                  </div>

                  {/* Avatar URL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Profile Avatar URL (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Sparkles size={16} />
                      </div>
                      <input
                        type="text"
                        value={editForm.avatar}
                        onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b4833e]/30 focus:border-[#b4833e] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#b4833e] hover:bg-[#9e7131] active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#b4833e]/20 transition-all cursor-pointer disabled:opacity-60"
                  >
                    <Save size={16} />
                    <span>{profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Form 2: Change Password */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                    Security & Password
                  </h3>
                  <p className="text-xs text-slate-400">
                    Verify current password and set a new secure password.
                  </p>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-5">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      placeholder="Enter current password"
                      className="w-full pl-10 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b4833e]/30 focus:border-[#b4833e] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock size={16} />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                        }
                        placeholder="At least 6 characters"
                        className="w-full pl-10 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b4833e]/30 focus:border-[#b4833e] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock size={16} />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                        }
                        placeholder="Re-enter new password"
                        className="w-full pl-10 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b4833e]/30 focus:border-[#b4833e] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-lg shadow-slate-900/10 transition-all cursor-pointer disabled:opacity-60"
                  >
                    <KeyRound size={16} />
                    <span>{passwordSaving ? 'Updating Password...' : 'Update Password'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
