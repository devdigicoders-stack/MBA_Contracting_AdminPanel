import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Mail, 
  Eye, 
  Clock, 
  Calendar, 
  ChevronDown, 
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statsData, setStatsData] = useState({
    totals: {
      blogs: 0,
      inquiries: 0,
      views: 0,
      users: 1,
      pendingInquiries: 0,
      contactedInquiries: 0,
      resolvedInquiries: 0,
    },
    recentInquiries: [],
    recentBlogs: [],
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

  const fetchDashboardStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const token = localStorage.getItem('mba_admin_token');
      const response = await fetch(`${apiUrl}/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatsData(result.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Format today's date range
  const currentDateFormatted = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return `${startOfMonth.toLocaleDateString('en-GB', options)} - ${today.toLocaleDateString('en-GB', options)}`;
  };

  // 4 Top Cards connected to database
  const statCards = [
    {
      title: 'Total Inquiries',
      value: statsData.totals.inquiries.toString(),
      change: 'Live DB',
      icon: Mail,
      badgeColor: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Pending Action',
      value: statsData.totals.pendingInquiries.toString(),
      change: statsData.totals.pendingInquiries > 0 ? 'Action Req' : 'Clear',
      icon: Clock,
      badgeColor: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Total Blog Posts',
      value: statsData.totals.blogs.toString(),
      change: 'Published',
      icon: FileText,
      badgeColor: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Total Article Views',
      value: statsData.totals.views.toLocaleString(),
      change: 'Live Stats',
      icon: Eye,
      badgeColor: 'bg-[#b4833e]/10 text-[#b4833e]',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Title & Date Range Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Welcome back! Here's an overview of your MBA Contracting performance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Refresh Button */}
          <button
            onClick={() => fetchDashboardStats(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200/90 rounded-lg text-xs font-semibold text-slate-600 hover:text-[#b4833e] hover:border-[#b4833e] shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin text-[#b4833e]' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Sync Data'}</span>
          </button>

          {/* Date Filter Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200/90 rounded-lg text-xs font-semibold text-slate-600 shadow-sm">
            <span>{currentDateFormatted()}</span>
            <Calendar size={14} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                {/* Gold Circle Icon */}
                <div className="w-12 h-12 rounded-xl bg-[#b4833e]/10 flex items-center justify-center text-[#b4833e] shrink-0">
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 leading-none">
                    {loading ? '...' : stat.value}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">{stat.title}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold self-start ${stat.badgeColor}`}>
                <span>{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Website Visitors Chart + Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Website Activity Wave Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Traffic & Engagement Trends</h2>
              <p className="text-xs text-slate-400">Monthly visitor interest across services & projects</p>
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
              >
                <span>{timeRange}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 text-xs font-medium">
                  {['Last 7 Days', 'Last 30 Days', 'Last 90 Days'].map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setTimeRange(range);
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SVG Smooth Curved Area Chart */}
          <div className="w-full h-64 relative flex items-end">
            {/* Y-Axis Grid Lines & Labels */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[11px] font-medium text-slate-400">
              <div className="flex items-center gap-3">
                <span className="w-7 text-right">250</span>
                <div className="flex-1 border-b border-slate-100"></div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-7 text-right">180</span>
                <div className="flex-1 border-b border-slate-100"></div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-7 text-right">120</span>
                <div className="flex-1 border-b border-slate-100"></div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-7 text-right">60</span>
                <div className="flex-1 border-b border-slate-100"></div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-7 text-right">0</span>
                <div className="flex-1 border-b border-slate-100"></div>
              </div>
            </div>

            {/* SVG Wave */}
            <div className="w-full h-full pl-10 pr-2 pt-2 pb-6 relative z-0">
              <svg 
                viewBox="0 0 600 220" 
                preserveAspectRatio="none" 
                className="w-full h-full overflow-visible"
              >
                <defs>
                  {/* Golden Gradient matching MBA branding */}
                  <linearGradient id="goldWaveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#b4833e" stopOpacity="0.45" />
                    <stop offset="60%" stopColor="#b4833e" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#b4833e" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {/* Filled Area */}
                <path
                  d="
                    M 0,160 
                    C 30,175 60,140 100,145 
                    C 140,150 160,110 200,105 
                    C 240,100 260,130 300,110 
                    C 340,90 380,125 420,100 
                    C 460,75 500,40 540,65 
                    C 570,85 590,70 600,60 
                    L 600,220 
                    L 0,220 
                    Z
                  "
                  fill="url(#goldWaveGradient)"
                />

                {/* Smooth Curve Stroke Line */}
                <path
                  d="
                    M 0,160 
                    C 30,175 60,140 100,145 
                    C 140,150 160,110 200,105 
                    C 240,100 260,130 300,110 
                    C 340,90 380,125 420,100 
                    C 460,75 500,40 540,65 
                    C 570,85 590,70 600,60
                  "
                  fill="none"
                  stroke="#b4833e"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Subtle Peak Highlight Dots */}
                <circle cx="200" cy="105" r="4" fill="#b4833e" className="animate-pulse" />
                <circle cx="420" cy="100" r="4" fill="#b4833e" />
                <circle cx="540" cy="65" r="4.5" fill="#b4833e" />
              </svg>

              {/* X-Axis Dates */}
              <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 mt-2">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Inquiries (1 Col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-900">Recent Leads</h2>
              <Link 
                to="/contact"
                className="text-xs font-bold text-[#b4833e] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Real Live Inquiries List */}
            <div className="space-y-4">
              {loading ? (
                <div className="py-12 flex justify-center text-slate-400">
                  <div className="w-6 h-6 border-2 border-[#b4833e] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : statsData.recentInquiries.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No inquiries received yet.
                </div>
              ) : (
                statsData.recentInquiries.slice(0, 4).map((inq) => {
                  const initial = inq.name ? inq.name[0].toUpperCase() : 'C';
                  return (
                    <Link
                      to="/contact"
                      key={inq._id}
                      className="flex items-center justify-between py-1 group hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 truncate">
                        {/* Circle Initial */}
                        <div className="w-10 h-10 rounded-full bg-[#b4833e]/15 text-[#9e7131] flex items-center justify-center font-bold text-sm shrink-0">
                          {initial}
                        </div>
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-slate-900 leading-tight group-hover:text-[#b4833e] transition-colors truncate">
                            {inq.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate max-w-[140px]">
                            {inq.subject || 'General Inquiry'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap ml-2">
                        {timeAgo(inq.createdAt)}
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 font-medium">
              Connected live to MBA database
            </span>
          </div>
        </div>

      </div>

      {/* Bottom Feature Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
        
        {/* Left Side: Thumbnail Villa Visual + Heading */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left w-full sm:w-auto">
          <div className="w-28 sm:w-36 h-20 rounded-xl overflow-hidden shadow-sm shrink-0 bg-slate-900">
            <img 
              src="/image.png" 
              alt="MBA Contracting Villa" 
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Building Quality. Delivering Excellence.
            </h3>
            <p className="text-xs text-slate-500 font-normal mt-1">
              Manage your content, inquiries and grow your business in Qatar.
            </p>
          </div>
        </div>

        {/* Right Side: Quick Action Links */}
        <div className="flex items-center gap-3">
          <Link 
            to="/contact" 
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-lg transition-all cursor-pointer shrink-0"
          >
            <span>Review Leads</span>
          </Link>
          <Link 
            to="/blog" 
            className="px-5 py-2.5 bg-[#b4833e] hover:bg-[#9e7131] text-white font-semibold text-xs sm:text-sm rounded-lg shadow-md shadow-[#b4833e]/20 flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <span>Manage Blogs</span>
            <ArrowRight size={15} />
          </Link>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
