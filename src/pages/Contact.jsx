import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Eye,
  Trash2,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

const STATUS_CONFIG = {
  Pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  Read: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    dot: 'bg-sky-500',
  },
  Contacted: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
  },
  Resolved: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

const Contact = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedContact, setSelectedContact] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

  const showAlert = (message, type = 'success') => {
    setAlertInfo({ show: true, message, type });
    setTimeout(() => {
      setAlertInfo({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  // Fetch all contacts from API
  const fetchContacts = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setRefreshing(true);
    try {
      const token = localStorage.getItem('mba_admin_token');
      const response = await fetch(`${apiUrl}/contacts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setContacts(result.data || []);
      } else {
        showAlert(result.message || 'Failed to fetch inquiries', 'error');
      }
    } catch (err) {
      console.error('Fetch contacts error:', err);
      showAlert('Unable to connect to backend server. Make sure port 5001 is active.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Update Status handler
  const handleStatusChange = async (contactId, newStatus) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('mba_admin_token');
      const response = await fetch(`${apiUrl}/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setContacts((prev) =>
          prev.map((c) => (c._id === contactId ? { ...c, status: newStatus } : c))
        );
        if (selectedContact && selectedContact._id === contactId) {
          setSelectedContact((prev) => ({ ...prev, status: newStatus }));
        }
        showAlert(`Status updated to "${newStatus}"!`);
      } else {
        showAlert(result.message || 'Failed to update status', 'error');
      }
    } catch (err) {
      showAlert('Network error while updating status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete contact handler
  const confirmDelete = async () => {
    if (!contactToDelete) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('mba_admin_token');
      const response = await fetch(`${apiUrl}/contacts/${contactToDelete._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setContacts((prev) => prev.filter((c) => c._id !== contactToDelete._id));
        showAlert('Contact inquiry removed successfully');
        setIsDeleteModalOpen(false);
        if (selectedContact?._id === contactToDelete._id) {
          setIsViewModalOpen(false);
        }
      } else {
        showAlert(result.message || 'Failed to delete inquiry', 'error');
      }
    } catch (err) {
      showAlert('Error connecting to backend to delete inquiry', 'error');
    } finally {
      setActionLoading(false);
      setContactToDelete(null);
    }
  };

  // Filter & Search logic
  const filteredContacts = useMemo(() => {
    return contacts.filter((item) => {
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.name?.toLowerCase().includes(query) ||
        item.email?.toLowerCase().includes(query) ||
        item.phone?.toLowerCase().includes(query) ||
        item.subject?.toLowerCase().includes(query) ||
        item.message?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [contacts, statusFilter, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage) || 1;
  const paginatedContacts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredContacts.slice(start, start + itemsPerPage);
  }, [filteredContacts, currentPage]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = contacts.length;
    const pending = contacts.filter((c) => c.status === 'Pending').length;
    const contacted = contacts.filter((c) => c.status === 'Contacted').length;
    const resolved = contacts.filter((c) => c.status === 'Resolved').length;
    return { total, pending, contacted, resolved };
  }, [contacts]);

  return (
    <div className="space-y-7 pb-10">
      {/* Alert Notification Toast */}
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
            className="ml-2 text-white/70 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-[#b4833e]/10 text-[#b4833e]">
              <MessageSquare size={24} />
            </span>
            <span>Contact Inquiries</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Manage incoming customer quotations, consultations, and architectural leads.
          </p>
        </div>

        <button
          onClick={() => fetchContacts(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/90 hover:border-[#b4833e] text-slate-700 hover:text-[#b4833e] rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin text-[#b4833e]' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Leads'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Leads</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{stats.total}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <MessageSquare size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Pending Action</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">{stats.pending}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">In Progress</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-indigo-600 mt-1">{stats.contacted}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
            <Phone size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Resolved</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">{stats.resolved}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80 lg:w-96">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, email, phone, subject..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b4833e]/30 focus:border-[#b4833e] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Status Filter Badges */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'Pending', 'Read', 'Contacted', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#b4833e] text-white shadow-md shadow-[#b4833e]/20'
                  : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {st === 'ALL' ? 'All Leads' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400">
            <div className="w-10 h-10 border-4 border-[#b4833e] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium">Loading inquiries from database...</p>
          </div>
        ) : paginatedContacts.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <MessageSquare size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-800">No contact inquiries found</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Try adjusting your search query or filters to find what you are looking for.'
                : 'Customer messages submitted from the public website will appear here in real-time.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] uppercase tracking-wider font-bold text-slate-500 border-b border-slate-200">
                  <th className="py-4 px-6">Client / Sender</th>
                  <th className="py-4 px-6">Contact Details</th>
                  <th className="py-4 px-6">Inquiry Subject</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Received</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedContacts.map((contact) => {
                  const statusConf = STATUS_CONFIG[contact.status] || STATUS_CONFIG.Pending;
                  const initials = contact.name
                    ? contact.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : 'C';

                  return (
                    <tr
                      key={contact._id}
                      className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedContact(contact);
                        setIsViewModalOpen(true);
                      }}
                    >
                      {/* Name & Initials */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-800 text-[#b4833e] font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 group-hover:text-[#b4833e] transition-colors leading-tight">
                              {contact.name}
                            </div>
                            <span className="text-[11px] text-slate-400 font-normal">
                              Client Inquiry
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          <a
                            href={`mailto:${contact.email}`}
                            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#b4833e] font-medium transition-colors"
                          >
                            <Mail size={13} className="text-slate-400 shrink-0" />
                            <span>{contact.email}</span>
                          </a>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-normal">
                            <Phone size={13} className="text-slate-400 shrink-0" />
                            <a
                              href={`tel:${contact.phone}`}
                              className="hover:text-slate-800 transition-colors"
                            >
                              {contact.phone}
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Subject & Preview */}
                      <td className="py-4 px-6 max-w-xs">
                        <div className="font-semibold text-xs text-slate-800 truncate">
                          {contact.subject || 'General Inquiry'}
                        </div>
                        <div className="text-[12px] text-slate-500 truncate mt-0.5">
                          {contact.message}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={contact.status}
                          onChange={(e) => handleStatusChange(contact._id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full border focus:outline-none cursor-pointer transition-all ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Read">Read</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6">
                        <div className="text-xs text-slate-600 font-medium whitespace-nowrap">
                          {timeAgo(contact.createdAt)}
                        </div>
                        <div className="text-[11px] text-slate-400 whitespace-nowrap">
                          {formatDate(contact.createdAt)}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            title="View Full Details"
                            onClick={() => {
                              setSelectedContact(contact);
                              setIsViewModalOpen(true);
                            }}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#b4833e] text-slate-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            title="Delete Inquiry"
                            onClick={() => {
                              setContactToDelete(contact);
                              setIsDeleteModalOpen(true);
                            }}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-500 text-slate-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {filteredContacts.length > itemsPerPage && (
          <div className="p-4 px-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing{' '}
              <strong className="text-slate-800">
                {(currentPage - 1) * itemsPerPage + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-slate-800">
                {Math.min(currentPage * itemsPerPage, filteredContacts.length)}
              </strong>{' '}
              of <strong className="text-slate-800">{filteredContacts.length}</strong> inquiries
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#b4833e] hover:text-[#b4833e] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="px-3 py-1 font-semibold text-slate-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#b4833e] hover:text-[#b4833e] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW DETAILS MODAL */}
      {isViewModalOpen && selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-scaleUp max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#b4833e]/10 text-[#b4833e] flex items-center justify-center font-bold text-base">
                  {selectedContact.name
                    ? selectedContact.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : 'C'}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                    {selectedContact.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Submitted on {formatDate(selectedContact.createdAt)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsViewModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-6 space-y-5">
              {/* Quick Contact Info Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold truncate">
                    <Mail size={16} className="text-[#b4833e] shrink-0" />
                    <span className="truncate">{selectedContact.email}</span>
                  </div>
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="text-[#b4833e] hover:underline text-xs font-bold shrink-0 ml-2"
                  >
                    Send Email
                  </a>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold truncate">
                    <Phone size={16} className="text-[#b4833e] shrink-0" />
                    <span className="truncate">{selectedContact.phone}</span>
                  </div>
                  <a
                    href={`tel:${selectedContact.phone}`}
                    className="text-[#b4833e] hover:underline text-xs font-bold shrink-0 ml-2"
                  >
                    Call Client
                  </a>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Subject
                </label>
                <div className="text-sm font-bold text-slate-900 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                  {selectedContact.subject || 'General Inquiry'}
                </div>
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Client Message
                </label>
                <div className="text-xs sm:text-sm text-slate-700 bg-slate-50/80 p-4 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {selectedContact.message}
                </div>
              </div>

              {/* Status Update Dropdown inside modal */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Lead Status</h4>
                  <p className="text-[11px] text-slate-500">Update the progress of this consultation.</p>
                </div>
                <select
                  disabled={actionLoading}
                  value={selectedContact.status}
                  onChange={(e) => handleStatusChange(selectedContact._id, e.target.value)}
                  className="text-xs font-bold px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-[#b4833e] shadow-sm cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="Read">Read</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setContactToDelete(selectedContact);
                  setIsDeleteModalOpen(true);
                }}
                className="text-xs text-red-500 hover:text-red-700 font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={15} />
                <span>Delete Lead</span>
              </button>

              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && contactToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-center animate-scaleUp">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={26} />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900">Delete Contact Inquiry?</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to delete the inquiry from{' '}
              <strong className="text-slate-800">{contactToDelete.name}</strong>? This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center gap-3 justify-center">
              <button
                disabled={actionLoading}
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={confirmDelete}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-600/25 cursor-pointer disabled:opacity-60"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
