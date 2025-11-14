import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Calendar, User, ArrowRight } from 'lucide-react';

const News = () => {
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const API_URL = 'https://api-inventory.isavralabel.com/rn-aneka-jaya/api';
  const BASE_URL = 'https://api-inventory.isavralabel.com/rn-aneka-jaya';

  useEffect(() => {
    window.scrollTo(0, 0);
    AOS.init({
      duration: 600,
      once: true,
    });
    fetchCategories();
    fetchNews();
  }, [currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/news-categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/news?status=published&page=${currentPage}&limit=6`
      );
      setNews(response.data.news || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const stripHtml = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const truncateText = (text, length = 150) => {
    const plainText = stripHtml(text);
    return plainText.length > length ? plainText.substring(0, length) + '...' : plainText;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Berita & Informasi
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dapatkan informasi terbaru tentang produk dan tips peternakan dari Gudang Pakan RN Aneka Jaya
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => {
                setSelectedCategory('');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === ''
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              Semua
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id.toString());
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id.toString()
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Loading berita...
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Belum ada berita untuk kategori ini
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {news.map((item, index) => (
                  <Link
                    key={item.id}
                    to={`/news/${item.slug}`}
                    className="card overflow-hidden hover:shadow-lg transition-shadow"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    {/* Image */}
                    <div className="w-full h-48 overflow-hidden bg-gray-200">
                      {item.image ? (
                        <img
                          src={`${BASE_URL}/uploads/${item.image}`}
                          alt={item.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center">
                          <span className="text-white text-center">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                          {item.category_name || 'Uncategorized'}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {item.title}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {truncateText(item.description, 100)}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                        </div>
                        {item.author && (
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{item.author}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                        <span>Baca Selengkapnya</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-12 flex justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <span className="px-4 py-2 text-gray-600">
                  Halaman {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={news.length < 6}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default News;

