import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ChevronLeft, X, Plus, Trash2, Upload, Image } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';

const CATEGORIES = [
  'Technology',
  'Construction',
  'Architecture',
  'Interior Design',
  'Real Estate',
  'Business',
  'News',
  'Tips & Tricks',
];

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\-]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const BlogForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    category: '',
    author: '',
    readTime: '5 min read',
    image: '',
    content: '',
    tags: [],
    faqs: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
  const baseUrl = 'http://localhost:5001';

  const showAlert = (message, type = 'success') => {
    setAlertInfo({ show: true, message, type });
    setTimeout(() => setAlertInfo({ show: false, message: '', type: 'success' }), 4000);
  };

  // Load blog data in edit mode
  useEffect(() => {
    if (isEditMode) {
      if (location.state?.blog) {
        const { blog } = location.state;
        setFormData({
          title: blog.title || '',
          slug: blog.slug || '',
          excerpt: blog.excerpt || '',
          category: blog.category || '',
          author: blog.author || '',
          readTime: blog.readTime || '5 min read',
          image: blog.image || '',
          content: blog.content || '',
          tags: blog.tags || [],
          faqs: blog.faqs || [],
        });
        setSlugManuallyEdited(true);
        if (blog.image) {
          setImagePreview(blog.image.startsWith('http') ? blog.image : `${baseUrl}${blog.image}`);
        }
      } else {
        // No state (direct URL access) - fetch from API
        const fetchBlog = async () => {
          try {
            const token = localStorage.getItem('mba_admin_token');
            const res = await fetch(`${apiUrl}/blogs/id/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const result = await res.json();
            if (res.ok && result.data) {
              const blog = result.data;
              setFormData({
                title: blog.title || '',
                slug: blog.slug || '',
                excerpt: blog.excerpt || '',
                category: blog.category || '',
                author: blog.author || '',
                readTime: blog.readTime || '5 min read',
                image: blog.image || '',
                content: blog.content || '',
                tags: blog.tags || [],
                faqs: blog.faqs || [],
              });
              setSlugManuallyEdited(true);
              if (blog.image) {
                setImagePreview(blog.image.startsWith('http') ? blog.image : `${baseUrl}${blog.image}`);
              }
            } else {
              showAlert('Blog not found, redirecting...', 'error');
              setTimeout(() => navigate('/blog'), 2000);
            }
          } catch {
            showAlert('Error loading blog data', 'error');
            setTimeout(() => navigate('/blog'), 2000);
          }
        };
        fetchBlog();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, id]);

  // Auto-generate slug from title
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'title' && !slugManuallyEdited) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const handleSlugChange = (e) => {
    setSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, slug: e.target.value }));
  };

  // Tags
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== indexToRemove),
    }));
  };

  // FAQs
  const handleFaqChange = (index, field, value) => {
    const updatedFaqs = [...formData.faqs];
    updatedFaqs[index][field] = value;
    setFormData((prev) => ({ ...prev, faqs: updatedFaqs }));
  };

  const addFaq = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }],
    }));
  };

  const removeFaq = (index) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  // Image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageUploading(true);
    const token = localStorage.getItem('mba_admin_token');
    const formDataObj = new FormData();
    formDataObj.append('image', file);

    try {
      const response = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataObj,
      });
      const result = await response.json();
      if (response.ok && result.data) {
        const imagePath = result.data.image || result.data.url;
        setFormData((prev) => ({ ...prev, image: imagePath }));
        setImagePreview(`${baseUrl}${imagePath}`);
        showAlert('Image uploaded successfully!', 'success');
      } else {
        showAlert(result.message || 'Image upload failed', 'error');
      }
    } catch (error) {
      console.error(error);
      showAlert('Error uploading image', 'error');
    } finally {
      setImageUploading(false);
    }
  };

  const editorRef = useRef(null);

  useEffect(() => {
    if (formData.content) {
      console.log('API data loaded. Trying to inject into editor...');
    }
    if (editorRef.current && formData.content) {
      if (!editorRef.current.getContent()) {
        editorRef.current.setContent(formData.content);
        console.log('Successfully injected content into TinyMCE!');
      } else {
        console.log('Editor already has content, skipping injection.');
      }
    }
  }, [formData.content]);

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('mba_admin_token');
    const payload = { ...formData, content: editorRef.current ? editorRef.current.getContent() : formData.content };

    try {
      let response;
      if (!isEditMode) {
        response = await fetch(`${apiUrl}/blogs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${apiUrl}/blogs/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();
      if (response.ok) {
        showAlert(isEditMode ? 'Blog updated successfully!' : 'Blog published successfully!', 'success');
        setTimeout(() => navigate('/blog'), 1500);
      } else {
        showAlert(result.message || (isEditMode ? 'Failed to update blog' : 'Failed to create blog'), 'error');
      }
    } catch (error) {
      console.error(error);
      showAlert('Action failed!', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 h-[calc(100vh-80px)] overflow-y-auto flex flex-col bg-slate-50/50">

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
      <div className="flex items-center gap-4 mb-8 shrink-0">
        <button
          onClick={() => navigate('/blog')}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-[#b4833e] hover:border-[#b4833e]/30 transition-colors shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isEditMode ? 'Update the details of your blog article below.' : 'Fill in the details to publish a new blog post.'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form id="blog-form" onSubmit={handleSubmit} className="flex flex-col gap-6 pb-8">

        {/* Main Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-5 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-[#b4833e]/10 flex items-center justify-center">
              <span className="text-[#b4833e] text-xs font-black">1</span>
            </span>
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Blog Title <span className="text-red-400">*</span></label>
              <input
                required
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#b4833e] focus:ring-4 focus:ring-[#b4833e]/10 transition-all text-[0.95rem]"
                placeholder="e.g. The Future of Construction in 2026"
              />
            </div>

            {/* Slug */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                URL Slug
                <span className="ml-2 text-xs font-normal text-slate-400">(auto-generated from title, or type custom)</span>
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleSlugChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#b4833e] focus:ring-4 focus:ring-[#b4833e]/10 transition-all text-[0.95rem] font-mono text-slate-600"
                placeholder="e.g. future-of-construction-2026"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Category <span className="text-red-400">*</span></label>
              <select
                required
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#b4833e] focus:ring-4 focus:ring-[#b4833e]/10 transition-all text-[0.95rem] bg-white"
              >
                <option value="" disabled>Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Author <span className="text-red-400">*</span></label>
              <input
                required
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#b4833e] focus:ring-4 focus:ring-[#b4833e]/10 transition-all text-[0.95rem]"
                placeholder="e.g. MBA Editorial Team"
              />
            </div>

            {/* Read Time */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Read Time</label>
              <input
                type="text"
                name="readTime"
                value={formData.readTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#b4833e] focus:ring-4 focus:ring-[#b4833e]/10 transition-all text-[0.95rem]"
                placeholder="e.g. 5 min read"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tags</label>
              <div
                className="w-full min-h-[50px] px-3 py-2 rounded-xl border border-slate-200 focus-within:border-[#b4833e] focus-within:ring-4 focus-within:ring-[#b4833e]/10 transition-all bg-white flex flex-wrap gap-2 items-center cursor-text"
                onClick={() => document.getElementById('tag-input').focus()}
              >
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[#b4833e]/8 text-[#b4833e] text-xs font-bold rounded-lg border border-[#b4833e]/20 flex items-center gap-1.5"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="hover:bg-[#b4833e]/20 p-0.5 rounded-full transition-colors"
                    >
                      <X size={11} strokeWidth={3} />
                    </button>
                  </span>
                ))}
                <input
                  id="tag-input"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="flex-1 outline-none text-sm min-w-[100px] bg-transparent"
                  placeholder={formData.tags.length === 0 ? 'Type tag & press Enter...' : ''}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Featured Image Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-5 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-[#b4833e]/10 flex items-center justify-center">
              <span className="text-[#b4833e] text-xs font-black">2</span>
            </span>
            Featured Image
          </h2>
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Upload zone */}
            <label className="flex-1 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 hover:border-[#b4833e]/40 bg-slate-50/50 hover:bg-[#b4833e]/4 rounded-xl p-8 cursor-pointer transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#b4833e]/8 flex items-center justify-center group-hover:bg-[#b4833e]/15 transition-colors">
                {imageUploading ? (
                  <div className="w-5 h-5 border-2 border-[#b4833e]/30 border-t-[#b4833e] rounded-full animate-spin" />
                ) : (
                  <Upload size={20} className="text-[#b4833e]" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">
                  {imageUploading ? 'Uploading...' : 'Click to upload image'}
                </p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={imageUploading}
              />
            </label>

            {/* Image preview */}
            {imagePreview ? (
              <div className="relative shrink-0">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => { setImagePreview(''); setFormData((p) => ({ ...p, image: '' })); }}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                >
                  <X size={13} />
                </button>
                <p className="text-xs text-slate-400 mt-2 text-center max-w-[160px] truncate">{formData.image}</p>
              </div>
            ) : (
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 shrink-0">
                <Image size={28} className="text-slate-300" />
                <p className="text-xs text-slate-400">No image yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-5 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-[#b4833e]/10 flex items-center justify-center">
              <span className="text-[#b4833e] text-xs font-black">3</span>
            </span>
            Content
          </h2>

          {/* Excerpt */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Short Excerpt <span className="text-red-400">*</span></label>
            <textarea
              required
              rows="3"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#b4833e] focus:ring-4 focus:ring-[#b4833e]/10 transition-all text-[0.95rem] resize-none"
              placeholder="A short summary shown on the blog listing page..."
            />
          </div>

          {/* Full Content */}
          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Article Content <span className="text-red-400">*</span></label>
            <div className="border border-slate-200 rounded-xl overflow-hidden flex-1 min-h-[500px]">
              {(isEditMode && !slugManuallyEdited) ? (
                <div className="flex items-center justify-center h-full text-slate-400">Loading editor...</div>
              ) : (
              <Editor
                tinymceScriptSrc="/tinymce/tinymce.min.js"
                initialValue={formData.content}
                onInit={(evt, editor) => {
                  editorRef.current = editor;
                  if (formData.content) {
                    editor.setContent(formData.content);
                  }
                }}
                init={{
                  license_key: 'gpl',
                  promotion: false,
                  height: 500,
                  menubar: true,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                  content_style: 'body { font-family:Inter,Helvetica,Arial,sans-serif; font-size:16px; color:#000000; background-color:#ffffff; }',
                  images_upload_handler: async (blobInfo, progress) => {
                    return new Promise(async (resolve, reject) => {
                      const token = localStorage.getItem('mba_admin_token') || '';
                      const formDataObj = new FormData();
                      formDataObj.append('image', blobInfo.blob(), blobInfo.filename());
                      
                      try {
                        const response = await fetch(`${apiUrl}/upload`, {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${token}` },
                          body: formDataObj
                        });
                        
                        const result = await response.json();
                        if (response.ok && result.data) {
                          const imagePath = result.data.image || result.data.url;
                          resolve(baseUrl + imagePath);
                        } else {
                          reject('Upload failed: ' + (result.message || 'Unknown error'));
                        }
                      } catch (error) {
                        reject('HTTP Error: ' + error.message);
                      }
                    });
                  }
                }}
              />
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              💡 Tip: Use the toolbar to format your article and insert images directly.
            </p>
          </div>
        </div>

        {/* FAQs Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-[#b4833e]/10 flex items-center justify-center">
                <span className="text-[#b4833e] text-xs font-black">4</span>
              </span>
              FAQs
              <span className="text-xs font-normal text-slate-400 normal-case ml-1">(Optional)</span>
            </h2>
            <button
              type="button"
              onClick={addFaq}
              className="flex items-center gap-2 px-4 py-2 bg-[#b4833e]/8 border border-[#b4833e]/20 text-[#b4833e] text-sm font-semibold rounded-xl hover:bg-[#b4833e]/15 transition-colors"
            >
              <Plus size={15} /> Add FAQ
            </button>
          </div>

          {formData.faqs.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
              No FAQs added yet. Click "Add FAQ" to add one.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {formData.faqs.map((faq, index) => (
                <div key={index} className="flex flex-col gap-3 p-5 border border-slate-200 rounded-xl bg-slate-50/50 relative">
                  <div className="absolute top-3 right-3">
                    <button
                      type="button"
                      onClick={() => removeFaq(index)}
                      className="w-7 h-7 rounded-lg bg-red-50 text-red-400 border border-red-100 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">FAQ #{index + 1}</p>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                    placeholder="Question (e.g., What services does MBA offer?)"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#b4833e] focus:ring-2 focus:ring-[#b4833e]/10 transition-all text-sm font-medium bg-white"
                    required
                  />
                  <textarea
                    value={faq.answer}
                    onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                    placeholder="Answer..."
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#b4833e] focus:ring-2 focus:ring-[#b4833e]/10 transition-all text-sm resize-none bg-white"
                    rows="3"
                    required
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end pt-2 pb-4 shrink-0 sticky bottom-0 bg-slate-50/90 backdrop-blur-sm py-4 px-0 rounded-xl">
          <button
            type="button"
            onClick={() => navigate('/blog')}
            className="px-8 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="blog-form"
            disabled={submitting || imageUploading}
            className="px-10 py-3 bg-[#b4833e] text-white rounded-xl font-bold hover:bg-[#9e6f30] hover:shadow-md transition-all shadow-sm disabled:opacity-60 flex items-center gap-2"
          >
            {submitting ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {isEditMode ? 'Updating...' : 'Publishing...'}</>
            ) : (
              isEditMode ? 'Update Blog' : 'Publish Blog'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogForm;
