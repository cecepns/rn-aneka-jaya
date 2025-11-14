import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiEndpoints } from '../../utils/api';
import { Package, AlertTriangle, Settings, Eye, Tag, Newspaper, CreditCard } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalMessages: 0,
    lowStockProducts: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes] = await Promise.all([
        apiEndpoints.getProducts(1, 1000)
      ]);
      
      setStats({
        totalProducts: productsRes.data.total,
        totalMessages: 0, // Will be implemented when we add message management
        lowStockProducts: productsRes.data.products.filter(p => p.stock < 10).length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Selamat Datang, Admin!</h2>
          <p className="text-gray-600">Kelola sistem Gudang Pakan RN Aneka Jaya dengan mudah dari dashboard ini</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Produk</h3>
                <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Stok Rendah</h3>
                <p className="text-2xl font-bold text-yellow-600">{stats.lowStockProducts}</p>
              </div>
            </div>
          </div>

          {/* <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Pesan</h3>
                <p className="text-2xl font-bold text-green-600">{stats.totalMessages}</p>
              </div>
            </div>
          </div> */}
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Menu Utama</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/admin/products"
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 text-center"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-primary-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Kelola Produk</h4>
              <p className="text-sm text-gray-600">Tambah, edit, hapus produk</p>
            </Link>

            <Link
              to="/admin/categories"
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 text-center"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Tag className="w-6 h-6 text-primary-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Kategori Produk</h4>
              <p className="text-sm text-gray-600">Tambah, edit, hapus kategori</p>
            </Link>

            <Link
              to="/admin/news"
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 text-center"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Newspaper className="w-6 h-6 text-primary-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Kelola Berita</h4>
              <p className="text-sm text-gray-600">Tambah, edit, hapus berita</p>
            </Link>

            <Link
              to="/admin/news-categories"
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 text-center"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Tag className="w-6 h-6 text-primary-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Kategori Berita</h4>
              <p className="text-sm text-gray-600">Kelola kategori berita</p>
            </Link>

            <Link
              to="/admin/payment-methods"
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 text-center"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-6 h-6 text-primary-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Metode Pembayaran</h4>
              <p className="text-sm text-gray-600">Kelola QRIS & rekening</p>
            </Link>

            <Link
              to="/admin/settings"
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 text-center"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Settings className="w-6 h-6 text-primary-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Pengaturan</h4>
              <p className="text-sm text-gray-600">Atur kontak dan info toko</p>
            </Link>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 text-center"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-primary-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Lihat Website</h4>
              <p className="text-sm text-gray-600">Buka website publik</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;