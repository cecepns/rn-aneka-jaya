import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiEndpoints } from '../utils/api';
import { useSettings } from '../hooks/useSettings';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { PackageX, MessageCircle, Phone, Info } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const { settings } = useSettings();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);

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
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await apiEndpoints.getProduct(id);
      setProduct(response.data);
      // Set first variant as selected if variants exist
      if (response.data.variants && response.data.variants.length > 0) {
        setSelectedVariant(response.data.variants[0]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <PackageX className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Produk tidak ditemukan</h2>
        <p className="text-gray-600 mb-6">Maaf, produk yang Anda cari tidak tersedia</p>
        <Link to="/products" className="btn-primary">
          Kembali ke Produk
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" data-aos="fade-in">
            <ol className="flex items-center space-x-2 text-sm">
              <li><Link to="/" className="text-gray-500 hover:text-gray-700">Beranda</Link></li>
              <li className="text-gray-400">/</li>
              <li><Link to="/products" className="text-gray-500 hover:text-gray-700">Produk</Link></li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900 font-medium">{product.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image Gallery */}
            <div data-aos="fade-right">
              <div className="sticky top-8">
                {/* Main Image */}
                <div className="mb-4">
                  <img 
                    src={selectedVariant && selectedVariant.image 
                      ? `https://api-inventory.isavralabel.com/rn-aneka-jaya/uploads/${selectedVariant.image}` 
                      : (product.image ? `https://api-inventory.isavralabel.com/rn-aneka-jaya/uploads/${product.image}` : 'https://images.pexels.com/photos/3683091/pexels-photo-3683091.jpeg?auto=compress&cs=tinysrgb&w=800')}
                    alt={product.name}
                    className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-lg"
                  />
                </div>

                {/* Image Thumbnails from Variants */}
                {product.variants && product.variants.length > 0 && (
                  <div className="flex gap-2">
                    {/* Main product image thumbnail */}
                    <button
                      onClick={() => setSelectedVariant(null)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedVariant === null ? 'border-primary-600' : 'border-gray-200'
                      }`}
                    >
                      <img 
                        src={product.image ? `https://api-inventory.isavralabel.com/rn-aneka-jaya/uploads/${product.image}` : 'https://images.pexels.com/photos/3683091/pexels-photo-3683091.jpeg?auto=compress&cs=tinysrgb&w=100'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </button>

                    {/* Variant image thumbnails */}
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedVariant?.id === variant.id ? 'border-primary-600' : 'border-gray-200'
                        }`}
                      >
                        <img 
                          src={variant.image 
                            ? `https://api-inventory.isavralabel.com/rn-aneka-jaya/uploads/${variant.image}` 
                            : 'https://images.pexels.com/photos/3683091/pexels-photo-3683091.jpeg?auto=compress&cs=tinysrgb&w=100'}
                          alt={variant.name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div data-aos="fade-left">
              <div className="space-y-6">
                {/* Category */}
                <div>
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-primary-100 text-primary-800 rounded-full">
                    {product.category}
                  </span>
                </div>

                {/* Title and Price */}
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    {product.name}
                  </h1>
                  <div className="text-3xl font-bold text-primary-600 mb-6">
                    {formatPrice(product.price)}
                  </div>
                </div>

                {/* Variant Selector */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Pilih Varian
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {/* Main product option */}
                      <button
                        onClick={() => setSelectedVariant(null)}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          selectedVariant === null 
                            ? 'border-primary-600 bg-primary-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-xs font-medium text-gray-600 mb-1">Utama</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {formatPrice(product.price)}
                        </div>
                      </button>

                      {/* Variant options */}
                      {product.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          className={`p-3 rounded-lg border-2 transition-all text-center ${
                            selectedVariant?.id === variant.id 
                              ? 'border-primary-600 bg-primary-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-xs font-medium text-gray-600 mb-1 line-clamp-1">
                            {variant.name}
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {formatPrice(variant.price)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock Status */}
                <div className="flex items-center space-x-2 mb-6">
                  <span className={`w-3 h-3 rounded-full ${
                    (selectedVariant?.stock || product.stock) > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <span className={`text-sm font-medium ${
                    (selectedVariant?.stock || product.stock) > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(selectedVariant?.stock || product.stock) > 0 
                      ? `Tersedia (${selectedVariant?.stock || product.stock} item)` 
                      : 'Stok Habis'}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Deskripsi Produk</h2>
                  <div 
                    className="prose prose-gray max-w-none text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a 
                      href={`https://wa.me/${settings.phone.replace(/\D/g, '').replace(/^0/, '62')}?text=Halo, saya tertarik dengan produk ${product.name}${selectedVariant ? ` - ${selectedVariant.name}` : ''} seharga ${selectedVariant ? formatPrice(selectedVariant.price) : formatPrice(product.price)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary flex-1 text-center py-3 text-lg font-semibold flex items-center justify-center space-x-2"
                      disabled={(selectedVariant?.stock || product.stock) === 0}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Pesan via WhatsApp</span>
                    </a>
                    <a 
                      href={`tel:${settings.phone}`}
                      className="btn-secondary flex-1 text-center py-3 text-lg font-semibold flex items-center justify-center space-x-2"
                    >
                      <Phone className="w-5 h-5" />
                      <span>Hubungi Kami</span>
                    </a>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Info className="w-4 h-4" />
                    <span>Butuh bantuan? Tim kami siap membantu Anda</span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-primary-50 p-6 rounded-lg mt-8">
                  <h3 className="font-semibold text-gray-900 mb-3">Informasi Penting</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      Pastikan produk dalam kondisi baik saat diterima
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      Periksa tanggal kadaluarsa sebelum membeli
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      Simpan di tempat sejuk dan kering
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      Jauhkan dari jangkauan anak-anak
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
