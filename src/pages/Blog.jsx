import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, Search, RefreshCw, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Blog = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();
  const entriesPerPage = 8;

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

  const showAlert = (message, type = 'success') => {
    setAlertInfo({ show: true, message, type });
    setTimeout(() => setAlertInfo({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchBlogs = async (showRefreshSpinner = false, page = currentPage) => {
    if (showRefreshSpinner) setRefreshing(true);
    else setLoading(true);
    try {
      const token = localStorage.getItem('mba_admin_token');
      let url = `${apiUrl}/blogs?page=${page}&limit=${entriesPerPage}`;
      if (searchQuery.trim()) url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      if (categoryFilter.trim()) url += `&category=${encodeURIComponent(categoryFilter.trim())}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (response.ok && result.data) {
        setData(result.data.blogs || []);
        setTotalBlogs(result.data.pagination?.total || 0);
        setTotalPages(result.data.pagination?.totalPages || 1);
      } else {
        showAlert('Failed to fetch blogs', 'error');
      }
    } catch (error) {
      console.error(error);
      showAlert('Error fetching blogs', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBlogs(false, 1);
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, categoryFilter]);

  useEffect(() => {
    fetchBlogs(false, currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleAddClick = () => navigate('/blog/create');
  const handleEdit = (blog) => navigate(`/blog/edit/${blog._id}`, { state: { blog } });

  const openDeleteModal = (blog) => {
    setBlogToDelete(blog);
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setBlogToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!blogToDelete) return;
    setDeleteLoading(true);
    const token = localStorage.getItem('mba_admin_token');
    try {
      const response = await fetch(`${apiUrl}/blogs/${blogToDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        showAlert('Blog deleted successfully!', 'success');
        closeDeleteModal();
        const newPage = data.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
        setCurrentPage(newPage);
        fetchBlogs(false, newPage);
      } else {
        const result = await response.json();
        showAlert(result.message || 'Failed to delete blog', 'error');
      }
    } catch (error) {
      console.error(error);
      showAlert('Error deleting blog', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const indexOfFirstEntry = (currentPage - 1) * entriesPerPage + 1;
  const indexOfLastEntry = Math.min(currentPage * entriesPerPage, totalBlogs);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="p-4 sm:p-8 relative h-[calc(100vh-80px)] overflow-y-auto bg-slate-50/50">

      {/* Alert */}
      {alertInfo.show && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl border text-sm font-semibold transition-all duration-300 ${
          alertInfo.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span>{alertInfo.message}</span>
          <button onClick={() => setAlertInfo({ show: false, message: '', type: 'success' })} className="ml-2 text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Blog Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage all your published articles & posts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchBlogs(true, currentPage)}
            disabled={refreshing}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#b4833e] hover:border-[#b4833e]/30 transition-colors shadow-sm"
            title="Refresh"
          >
            <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-[#b4833e] hover:bg-[#9e6f30] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
          >
            <Plus size={18} />
            Create Blog
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, tag, or excerpt..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#b4833e] focus:ring-4 focus:ring-[#b4833e]/10 transition-all"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:border-[#b4833e] focus:ring-4 focus:ring-[#b4833e]/10 transition-all min-w-[180px]"
        >
          <option value="">All Categories</option>
          <option value="Technology">Technology</option>
          <option value="Construction">Construction</option>
          <option value="Architecture">Architecture</option>
          <option value="Interior Design">Interior Design</option>
          <option value="Real Estate">Real Estate</option>
          <option value="Business">Business</option>
          <option value="News">News</option>
          <option value="Tips & Tricks">Tips & Tricks</option>
        </select>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full border-4 border-[#b4833e]/20 border-t-[#b4833e] animate-spin" />
              <p className="text-sm text-slate-500 font-medium">Loading blogs...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Image</th>
                    <th className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
                    <th className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Author</th>
                    <th className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Views</th>
                    <th className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((blog) => (
                    <tr key={blog._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center shrink-0">
                          {blog.image ? (
                            <img
                              src={blog.image.startsWith('http') ? blog.image : `http://localhost:5001${blog.image}`}
                              alt={blog.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileText size={20} className="text-slate-300" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-[220px]">
                        <p className="text-sm font-bold text-slate-800 truncate">{blog.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{blog.slug}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1.5 text-xs font-bold rounded-lg text-[#b4833e] bg-[#b4833e]/8 border border-[#b4833e]/20">
                          {blog.category || '—'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600 font-medium">{blog.author || '—'}</td>
                      <td className="py-4 px-6 text-sm text-slate-600 font-semibold">{blog.views ?? 0}</td>
                      <td className="py-4 px-6 text-sm text-slate-500 font-medium whitespace-nowrap">
                        {blog.createdAt
                          ? new Date(blog.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(blog)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#b4833e] hover:bg-[#b4833e]/10 transition-colors border border-transparent hover:border-[#b4833e]/20"
                            title="Edit"
                          >
                            <Edit size={17} strokeWidth={2} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(blog)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
                            title="Delete"
                          >
                            <Trash2 size={17} strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-2xl bg-[#b4833e]/8 flex items-center justify-center">
                            <FileText size={28} className="text-[#b4833e]/60" />
                          </div>
                          <p className="text-slate-600 font-semibold text-sm">No blogs found</p>
                          <p className="text-slate-400 text-xs">
                            {searchQuery || categoryFilter ? 'Try adjusting your search or filter.' : 'Click "Create Blog" to publish your first article!'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="py-5 px-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
                <p className="text-sm text-slate-500 font-medium">
                  {totalBlogs > 0
                    ? <>Showing <span className="text-slate-800 font-semibold">{indexOfFirstEntry}</span> to <span className="text-slate-800 font-semibold">{indexOfLastEntry}</span> of <span className="text-slate-800 font-semibold">{totalBlogs}</span> blogs</>
                    : 'No entries'}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-transparent hover:border-slate-200"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${
                        currentPage === page
                          ? 'border border-[#b4833e] text-[#b4833e] bg-[#b4833e]/8 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-transparent hover:border-slate-200"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeDeleteModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5 border border-red-100">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Blog Post?</h3>
            <p className="text-slate-500 text-sm mb-1">
              You are about to permanently delete:
            </p>
            <p className="text-slate-800 font-semibold text-sm mb-6 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 w-full truncate">
              {blogToDelete?.title}
            </p>
            <p className="text-red-500 text-xs mb-8 font-medium">⚠️ This action cannot be undone.</p>
            <div className="flex gap-3 w-full">
              <button
                onClick={closeDeleteModal}
                className="flex-1 px-6 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting...</>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
