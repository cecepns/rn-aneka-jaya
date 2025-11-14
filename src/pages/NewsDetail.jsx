import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Calendar, User, ArrowLeft } from 'lucide-react';

const NewsDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = 'https://api-inventory.isavralabel.com/rn-aneka-jaya/api';
  const BASE_URL = 'https://api-inventory.isavralabel.com/rn-aneka-jaya';

  useEffect(() => {
    window.scrollTo(0, 0);
    AOS.init({
      duration: 600,
      once: true,
    });
    fetchNews();
  }, [slug]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/news/${slug}`);
      setNews(response.data);

      // Fetch related news from same category
      const relatedResponse = await axios.get(
        `${API_URL}/news?status=published&limit=3`
      );
      setRelatedNews(
        relatedResponse.data.news?.filter(item => item.id !== response.data.id).slice(0, 3) || []
      );
    } catch (error) {
      console.error('Error fetching news:', error);
      if (error.response?.status === 404) {
        navigate('/news');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center mt-16">
        <div className="text-center text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center mt-16">
        <div className="text-center text-gray-500">
          Berita tidak ditemukan
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-12 mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/news"
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali ke Berita</span>
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4" data-aos="fade-up">
            {news.title}
          </h1>
          <div className="flex items-center justify-between text-gray-600" data-aos="fade-up" data-aos-delay="100">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>{new Date(news.created_at).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              {news.author && (
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>{news.author}</span>
                </div>
              )}
            </div>
            {news.category_name && (
              <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                {news.category_name}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Image */}
          {news.image && (
            <div className="mb-12" data-aos="fade-up">
              <img
                src={`${BASE_URL}/uploads/${news.image}`}
                alt={news.title}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="card p-8 prose prose-sm max-w-none"
            data-aos="fade-up"
            dangerouslySetInnerHTML={{ __html: news.description }}
          />
        </div>
      </section>

      {/* Related News */}
      {relatedNews.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8" data-aos="fade-up">
              Berita Lainnya
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedNews.map((item, index) => (
                <Link
                  key={item.id}
                  to={`/news/${item.slug}`}
                  className="card overflow-hidden hover:shadow-lg transition-shadow"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  {/* Image */}
                  <div className="w-full h-40 overflow-hidden bg-gray-200">
                    {item.image ? (
                      <img
                        src={`${BASE_URL}/uploads/${item.image}`}
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center">
                        <span className="text-white text-center text-sm">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default NewsDetail;

