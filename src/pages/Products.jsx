import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiEndpoints } from '../utils/api';
import Pagination from '../components/Pagination';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Search, PackageX } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Initialize AOS with a delay to ensure DOM is ready
    const timer = setTimeout(() => {
      AOS.init({
        duration: 1000,
        once: true,
        offset: 50,
        delay: 0,
        easing: 'ease-in-out',
        mirror: false,
        anchorPlacement: 'top-bottom',
      });
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  // Refresh AOS when products are loaded
  useEffect(() => {
    if (products.length > 0 && !loading) {
      setTimeout(() => {
        AOS.refresh();
      }, 200);
    }
  }, [products, loading]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiEndpoints.getProducts(currentPage, 10);
      setProducts(response.data.products);
      setTotalPages(Math.ceil(response.data.total / 10));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6" data-aos="fade-up">
              Katalog Produk Pakan Ternak
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8" data-aos="fade-up" data-aos-delay="200">
              Temukan berbagai macam pakan ternak dan ikan berkualitas dengan harga kompetitif dari Gudang Pakan RN Aneka Jaya
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto" data-aos="fade-up" data-aos-delay="400">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari pakan ternak..."
                  className="w-full px-4 py-3 pl-12 pr-4 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                  <div 
                    key={product.id}
                    className="card overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    data-aos="fade-up"
                    data-aos-delay={index * 50}
                  >
                    <div className="aspect-w-1 aspect-h-1">
                      <img 
                        src={product.image ? `https://api-inventory.isavralabel.com/rn-aneka-jaya/uploads/${product.image}` : 'https://images.pexels.com/photos/3683091/pexels-photo-3683091.jpeg?auto=compress&cs=tinysrgb&w=400'}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="mb-2">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                          {product.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-4" dangerouslySetInnerHTML={{ __html: product.description?.substring(0, 50) + '...' }}></p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary-600">
                          {formatPrice(product.price)}
                        </span>
                        <Link 
                          to={`/products/${product.id}`}
                          className="btn-primary text-sm px-4 py-2"
                        >
                          Detail
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && !loading && (
                <div className="text-center py-20">
                  <PackageX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Pakan tidak ditemukan</h3>
                  <p className="text-gray-600">Coba gunakan kata kunci pencarian yang berbeda atau hubungi kami</p>
                </div>
              )}

              {!searchTerm && (
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Products;
