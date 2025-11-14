import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Edit2, Trash2, Plus, X, Loader, ArrowLeft } from 'lucide-react';

const NewsCategoryManagement = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitLoading, setSubmitLoading] = useState(false);

  const API_URL = 'https://api-inventory.isavralabel.com/rn-aneka-jaya/api';
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/admin/login';
  };

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchCategories();
  }, [token, navigate]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/news-categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama kategori tidak boleh kosong');
      return;
    }

    try {
      setSubmitLoading(true);
      if (editingCategory) {
        await axios.put(
          `${API_URL}/news-categories/${editingCategory.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_URL}/news-categories`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setFormData({ name: '', description: '' });
      setEditingCategory(null);
      setShowForm(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan kategori');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      try {
        await axios.delete(`${API_URL}/news-categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert(error.response?.data?.message || 'Gagal menghapus kategori');
      }
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Kembali</span>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Kategori Berita</h1>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Bar */}
        <div className="flex justify-end mb-8">
          <button
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: '', description: '' });
              setShowForm(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Kategori</span>
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Loading...
            </div>
          ) : categories.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Belum ada kategori. Mulai dengan menambahkan kategori baru.
            </div>
          ) : (
            categories.map(category => (
              <div key={category.id} className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-gray-600 text-sm mb-4">
                    {category.description}
                  </p>
                )}
                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Contoh: Promo, Tips, Berita"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Deskripsi kategori"
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {submitLoading && <Loader className="w-4 h-4 animate-spin" />}
                  <span>{editingCategory ? 'Update' : 'Tambah'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsCategoryManagement;

