import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiEndpoints } from '../utils/api';
import Pagination from '../components/Pagination';
import { useCart } from '../hooks/useCart';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Search, PackageX, ShoppingCart, Check, X } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const { addToCart } = useCart();
  const [addedToCartIds, setAddedToCartIds] = useState(new Set());
  const [searchParams] = useSearchParams();

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

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Check for category from URL on mount
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      setCurrentPage(1);
    }
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const response = await apiEndpoints.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('limit', 10);
        if (selectedCategory) {
          params.append('category', selectedCategory);
        }
        
        const response = await apiEndpoints.getProducts(currentPage, 10, selectedCategory);
        setProducts(response.data.products);
        setTotalPages(Math.ceil(response.data.total / 10));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [currentPage, selectedCategory]);

  // Refresh AOS when products are loaded
  useEffect(() => {
    if (products.length > 0 && !loading) {
      setTimeout(() => {
        AOS.refresh();
      }, 200);
    }
  }, [products, loading]);


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

  const handleAddToCart = (product) => {
    addToCart(product, null);
    setAddedToCartIds(prev => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedToCartIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-12 sm:py-16 lg:py-20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6" data-aos="fade-up">
              Katalog Produk
            </h1>
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 line-clamp-3 sm:line-clamp-2" data-aos="fade-up" data-aos-delay="200">
              Temukan berbagai macam pakan ternak dan ikan berkualitas dengan harga kompetitif
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto" data-aos="fade-up" data-aos-delay="400">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari pakan..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-10 sm:pl-12 pr-4 text-sm sm:text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-3">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {/* Filter Section */}
              <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Filter Kategori</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setCurrentPage(1);
                    }}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-medium transition-colors ${
                      !selectedCategory
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Semua
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.name);
                        setCurrentPage(1);
                      }}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-medium transition-colors flex items-center space-x-1 sm:space-x-2 ${
                        selectedCategory === category.name
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <span className="line-clamp-1">{category.name}</span>
                      {selectedCategory === category.name && (
                        <X className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {filteredProducts.map((product, index) => (
                  <div 
                    key={product.id}
                    className="card overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
                    data-aos="fade-up"
                    data-aos-delay={index * 50}
                  >
                    <div className="aspect-square overflow-hidden bg-gray-200">
                      <img 
                        src={product.image ? `https://api-inventory.isavralabel.com/rn-aneka-jaya/uploads/${product.image}` : 'https://images.pexels.com/photos/3683091/pexels-photo-3683091.jpeg?auto=compress&cs=tinysrgb&w=400'}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-2.5 sm:p-4 flex flex-col flex-grow">
                      <div className="mb-1.5 sm:mb-2">
                        <span className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full line-clamp-1">
                          {product.category}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-1.5 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2" dangerouslySetInnerHTML={{ __html: product.description?.substring(0, 40) + '...' }}></p>
                      
                      <div className="space-y-2 mt-auto">
                        <div>
                          <span className="text-base sm:text-lg font-bold text-primary-600">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                        <div className="flex gap-1.5 sm:gap-2">
                          <button
                            onClick={() => handleAddToCart(product)}
                            className={`flex-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200 font-medium flex items-center justify-center space-x-1 ${
                              addedToCartIds.has(product.id)
                                ? 'btn-success'
                                : 'btn-secondary'
                            }`}
                          >
                            {addedToCartIds.has(product.id) ? (
                              <>
                                <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Ditambah</span>
                                <span className="sm:hidden">OK</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Keranjang</span>
                              </>
                            )}
                          </button>
                          <Link 
                            to={`/products/${product.id}`}
                            className="btn-primary text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                          >
                            Detail
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && !loading && (
                <div className="text-center py-20">
                  <PackageX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedCategory ? 'Pakan tidak ditemukan pada kategori ini' : 'Pakan tidak ditemukan'}
                  </h3>
                  <p className="text-gray-600">
                    {selectedCategory 
                      ? 'Coba pilih kategori lain atau gunakan pencarian'
                      : 'Coba gunakan kata kunci pencarian yang berbeda atau hubungi kami'
                    }
                  </p>
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
