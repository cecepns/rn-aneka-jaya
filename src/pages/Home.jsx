import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { apiEndpoints } from "../utils/api";
import { useSettings } from "../hooks/useSettings";
import Banner from "../assets/banner.png";
import { ShoppingBag, Package, Clock, Truck, MapPin, Phone } from 'lucide-react';

const Home = () => {
  const { settings } = useSettings();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiEndpoints.getProducts(1, 4);
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price);
  };

  const features = [
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: "Pakan Berkualitas Premium",
      description: "Menyediakan pakan ternak dan ikan berkualitas terbaik dengan nutrisi lengkap dari produsen terpercaya",
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: "Stok Lengkap & Beragam",
      description:
        "Berbagai macam pakan ayam, bebek, ikan lele, nila, gurame, koi, dan produk peternakan lainnya selalu tersedia",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Layanan Cepat",
      description: "Siap melayani pesanan Anda dengan cepat dan profesional setiap hari kerja",
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Pengiriman Aman",
      description: "Tersedia layanan pengiriman yang aman dan tepat waktu untuk seluruh wilayah",
    },
  ];

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col-reverse lg:flex-row gap-12 items-center">
            <div data-aos="fade-right" className="flex-1">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Selamat Datang di
                <span className="text-primary-600 block">Gudang Pakan</span>
                <span className="text-primary-600 block">RN Aneka Jaya</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Supplier pakan ternak dan ikan berkualitas terpercaya yang menyediakan berbagai
                macam pakan unggas, ikan, suplemen, dan perlengkapan peternakan dengan harga kompetitif
                untuk mendukung produktivitas peternakan Anda.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="btn-primary inline-flex items-center justify-center px-8 py-4 text-lg"
                >
                  Lihat Produk
                </Link>
                <a
                  href={`tel:${settings.phone}`}
                  className="btn-secondary inline-flex items-center justify-center px-8 py-4 text-lg"
                >
                  Hubungi Kami
                </a>
              </div>
            </div>
            <div data-aos="fade-left" className="flex-1">
              <div className="w-full h-full">
                <img
                  src={Banner}
                  alt="Gudang Pakan RN Aneka Jaya"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Mengapa Memilih Gudang Pakan RN Aneka Jaya?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Kami berkomitmen memberikan solusi terbaik untuk peternakan Anda dengan
              pakan berkualitas premium dan layanan profesional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card p-8 text-center hover:shadow-lg transition-shadow duration-300"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="text-primary-600 mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Produk Unggulan Kami
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Temukan berbagai macam pakan ternak berkualitas premium
              dengan harga kompetitif untuk kebutuhan peternakan Anda
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="card overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  data-aos-duration="800"
                >
                  <div className="aspect-w-1 aspect-h-1">
                    <img
                      src={
                        product.image
                          ? `https://api-inventory.isavralabel.com/rn-aneka-jaya/uploads/${product.image}`
                          : "https://images.pexels.com/photos/3683091/pexels-photo-3683091.jpeg?auto=compress&cs=tinysrgb&w=400"
                      }
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
                    <p
                      className="text-gray-600 text-sm mb-3 line-clamp-3"
                      dangerouslySetInnerHTML={{
                        __html: product.description?.substring(0, 80) + "...",
                      }}
                    ></p>

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
          )}

          <div className="text-center mt-12" data-aos="fade-up">
            <Link
              to="/products"
              className="btn-primary inline-flex items-center px-8 py-4 text-lg"
            >
              Lihat Semua Produk
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div data-aos="fade-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Butuh Pakan Ternak Berkualitas?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Tim kami siap membantu Anda dengan konsultasi produk pakan,
              rekomendasi nutrisi, dan solusi kebutuhan peternakan
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors duration-200"
            >
              Hubungi Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div data-aos="fade-right">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Hubungi Kami
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Alamat</h3>
                    <p className="text-gray-600 whitespace-pre-line">
                      {settings.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Telepon</h3>
                    <p className="text-gray-600">{settings.phone}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Jam Operasional
                    </h3>
                    <p className="text-gray-600">
                      {settings.operating_hours}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <a
                  href={settings.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center"
                >
                  Buka di Maps
                </a>
              </div>
            </div>
            <div data-aos="fade-left">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.4!2d106.8569!3d-6.1944!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f4227f4b1a6b%3A0x301576d14feb1a89!2sMatraman%2C+East+Jakarta+City%2C+Jakarta!5e0!3m2!1sen!2sid!4v1"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
