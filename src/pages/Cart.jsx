import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../hooks/useCart';
import { useSettings } from '../hooks/useSettings';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ShoppingCart, Trash2, Minus, Plus, MessageCircle, Phone, Info, AlertCircle } from 'lucide-react';
import CheckoutModal from '../components/CheckoutModal';

const Cart = () => {
  const { cart, removeFromCart, updateCartItemQuantity, getTotalPrice, getTotalItems, clearCart } = useCart();
  const { settings } = useSettings();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  const API_URL = 'https://api-inventory.isavralabel.com/rn-aneka-jaya/api';

  useEffect(() => {
    window.scrollTo(0, 0);
    AOS.init({
      duration: 600,
      once: true,
    });
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true);
      const response = await axios.get(`${API_URL}/payment-methods`);
      setPaymentMethods(response.data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price);
  };

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    setShowCheckoutModal(true);
  };

  const handleCheckoutSubmit = (order_id, formData) => {
    if (cart.length === 0) return;

    setIsCheckingOut(true);

    // Build message with cart items and order ID
    const cartDetails = cart
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} x${item.quantity} = ${formatPrice(item.price * item.quantity)}`
      )
      .join('\n');

    const totalPrice = getTotalPrice();
    const message = encodeURIComponent(
      `*ID PESANAN:* ${order_id}\n\n*NAMA:* ${formData.buyer_name}\n*ALAMAT:* ${formData.buyer_address}\n*TELEPON:* ${formData.buyer_phone}\n\n*PESANAN:*\n${cartDetails}\n\n*TOTAL:* ${formatPrice(totalPrice)}`
    );

    const whatsappUrl = `https://wa.me/${settings.phone.replace(/\D/g, '').replace(/^0/, '62')}?text=${message}`;

    // Close modal
    setShowCheckoutModal(false);

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');

    // Clear cart after opening WhatsApp
    setTimeout(() => {
      clearCart();
      setIsCheckingOut(false);
    }, 500);
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-16">
          <div className="text-center" data-aos="fade-up">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Keranjang Kosong</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Belum ada produk di keranjang Anda. Yuk, cari produk pakan berkualitas dari Mall Gudang Pakan Ternak
            </p>
            <Link to="/products" className="btn-primary inline-flex items-center px-8 py-4 text-lg">
              Lanjutkan Belanja
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Keranjang Belanja
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {getTotalItems()} item di keranjang Anda
            </p>
          </div>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div
                    key={item.id}
                    className="card p-4 flex flex-col sm:flex-row gap-4"
                    data-aos="fade-up"
                    data-aos-delay={index * 50}
                  >
                    {/* Product Image */}
                    <div className="w-full sm:w-24 h-24 flex-shrink-0">
                      <img
                        src={
                          item.image
                            ? `https://api-inventory.isavralabel.com/rn-aneka-jaya/uploads/${item.image}`
                            : 'https://images.pexels.com/photos/3683091/pexels-photo-3683091.jpeg?auto=compress&cs=tinysrgb&w=100'
                        }
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 flex flex-col justify-between border-r pr-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Harga: {formatPrice(item.price)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() =>
                              updateCartItemQuantity(item.id, item.quantity - 1)
                            }
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>
                          <span className="w-8 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartItemQuantity(item.id, item.quantity + 1)
                            }
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="sm:w-32 text-right">
                      <p className="text-sm text-gray-600 mb-2">Subtotal</p>
                      <p className="text-lg font-bold text-primary-600">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Link
                  to="/products"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  ← Lanjutkan Belanja
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div data-aos="fade-left">
              <div className="card p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Ringkasan Pesanan
                </h2>

                <div className="space-y-4 mb-6 pb-6 border-b">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(getTotalPrice())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Item</span>
                    <span className="font-semibold text-gray-900">
                      {getTotalItems()}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between mb-4">
                    <span className="text-lg font-semibold text-gray-900">
                      Total:
                    </span>
                    <span className="text-2xl font-bold text-primary-600">
                      {formatPrice(getTotalPrice())}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleCheckoutClick}
                    disabled={isCheckingOut || cart.length === 0 || loadingPaymentMethods}
                    className="btn-primary w-full py-3 text-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Pesan via WhatsApp</span>
                  </button>
                  <a
                    href={`tel:${settings.phone}`}
                    className="btn-secondary w-full py-3 text-lg font-semibold flex items-center justify-center space-x-2"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Hubungi Kami</span>
                  </a>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full py-3 text-lg font-semibold flex items-center justify-center space-x-2 border-2 border-red-500 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Hapus Semua</span>
                  </button>
                </div>

                <div className="flex items-start justify-center space-x-2 text-sm text-gray-500 mt-4">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Keranjang Anda akan dikosongkan setelah memesan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" data-aos="zoom-in">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Hapus Semua Item?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Anda yakin ingin menghapus semua item dari keranjang? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleClearCart}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <CheckoutModal
          cart={cart}
          totalPrice={getTotalPrice()}
          paymentMethods={paymentMethods}
          onClose={() => setShowCheckoutModal(false)}
          onCheckout={handleCheckoutSubmit}
        />
      )}
    </div>
  );
};

export default Cart;

