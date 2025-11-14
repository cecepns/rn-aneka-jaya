import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Edit2, Trash2, Plus, Search, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import NewsForm from '../../components/NewsForm';

const NewsManagement = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    fetchNews();
  }, [token, navigate]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/news?page=${currentPage}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNews(response.data.news || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus berita ini?')) {
      try {
        await axios.delete(`${API_URL}/news/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchNews();
      } catch (error) {
        console.error('Error deleting news:', error);
        alert('Gagal menghapus berita');
      }
    }
  };

  const handleEdit = (newsItem) => {
    setEditingNews(newsItem);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingNews(null);
    fetchNews();
  };

  const filteredNews = news.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <h1 className="text-xl font-bold text-gray-900">Manajemen Berita</h1>
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
              setEditingNews(null);
              setShowForm(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Berita</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berita..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* News Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredNews.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Belum ada berita. Mulai dengan menambahkan berita baru.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Judul</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Kategori</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Author</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tanggal</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNews.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{item.category_name || 'Tanpa Kategori'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{item.author || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(item.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Halaman {currentPage}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* News Form Modal */}
      {showForm && (
        <NewsForm
          news={editingNews}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default NewsManagement;

