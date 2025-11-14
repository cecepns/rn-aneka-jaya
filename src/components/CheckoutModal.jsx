import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Loader, AlertCircle } from 'lucide-react';

const CheckoutModal = ({ cart, totalPrice, paymentMethods, onClose, onCheckout }) => {
  const [formData, setFormData] = useState({
    buyer_name: '',
    buyer_address: '',
    buyer_phone: '',
    payment_method_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (paymentMethods.length > 0) {
      setFormData(prev => ({
        ...prev,
        payment_method_id: paymentMethods[0].id
      }));
    }
  }, [paymentMethods]);

  const generateOrderId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.buyer_name.trim()) {
      setError('Nama pembeli tidak boleh kosong');
      return;
    }
    if (!formData.buyer_address.trim()) {
      setError('Alamat tidak boleh kosong');
      return;
    }
    if (!formData.buyer_phone.trim()) {
      setError('Nomor telepon tidak boleh kosong');
      return;
    }
    if (!formData.payment_method_id) {
      setError('Pilih metode pembayaran');
      return;
    }

    try {
      setLoading(true);
      const order_id = generateOrderId();

      // Save order to backend
      await axios.post('https://api-inventory.isavralabel.com/rn-aneka-jaya/api/orders', {
        order_id,
        buyer_name: formData.buyer_name,
        buyer_address: formData.buyer_address,
        buyer_phone: formData.buyer_phone,
        payment_method_id: formData.payment_method_id,
        items_total: totalPrice
      });

      // Call parent checkout handler
      onCheckout(order_id, formData);
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const selectedPaymentMethod = paymentMethods.find(m => m.id === parseInt(formData.payment_method_id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Konfirmasi Pesanan</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Ringkasan Pesanan</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name} x{item.quantity}</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t flex justify-between">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="text-lg font-bold text-primary-600">
                {formatPrice(totalPrice)}
              </span>
            </div>
          </div>

          {/* Buyer Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Pembeli
            </label>
            <input
              type="text"
              name="buyer_name"
              value={formData.buyer_name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Nama lengkap"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Telepon
            </label>
            <input
              type="tel"
              name="buyer_phone"
              value={formData.buyer_phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="08xxxxxxxxxx"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alamat Pengiriman
            </label>
            <textarea
              name="buyer_address"
              value={formData.buyer_address}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Alamat lengkap"
              rows="3"
              required
            />
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Metode Pembayaran
            </label>
            <div className="space-y-2">
              {paymentMethods.map(method => (
                <label key={method.id} className="flex items-start p-3 border-2 rounded-lg cursor-pointer transition-colors"
                  style={{
                    borderColor: formData.payment_method_id === method.id.toString() ? '#3b82f6' : '#e5e7eb',
                    backgroundColor: formData.payment_method_id === method.id.toString() ? '#f0f9ff' : 'transparent'
                  }}
                >
                  <input
                    type="radio"
                    name="payment_method_id"
                    value={method.id}
                    checked={formData.payment_method_id === method.id.toString()}
                    onChange={handleInputChange}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {method.type === 'qris' ? 'QRIS' : method.bank_name}
                    </p>
                    {method.type === 'bank' && (
                      <p className="text-sm text-gray-600">
                        {method.account_name} - {method.account_number}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Method Details */}
          {selectedPaymentMethod && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-3">Detail Pembayaran:</h4>
              {selectedPaymentMethod.type === 'qris' ? (
                <div>
                  {selectedPaymentMethod.qris_image && (
                    <img
                      src={`https://api-inventory.isavralabel.com/rn-aneka-jaya/api/uploads/${selectedPaymentMethod.qris_image}`}
                      alt="QRIS"
                      className="w-48 h-48 object-contain"
                    />
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Bank:</span> {selectedPaymentMethod.bank_name}</p>
                  <p><span className="font-medium">Atas Nama:</span> {selectedPaymentMethod.account_name}</p>
                  <p><span className="font-medium">No. Rekening:</span> {selectedPaymentMethod.account_number}</p>
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              <span>Lanjutkan ke WhatsApp</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;

