import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Edit2, Trash2, Plus, X, Loader, CreditCard, QrCode, ArrowLeft } from 'lucide-react';

const PaymentMethodManagement = () => {
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    type: 'bank',
    bank_name: '',
    account_name: '',
    account_number: '',
    is_active: true,
    display_order: 1
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

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
    fetchPaymentMethods();
  }, [token, navigate]);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/payment-methods/admin/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPaymentMethods(response.data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type) => {
    setFormData({
      type,
      bank_name: '',
      account_name: '',
      account_number: '',
      is_active: true,
      display_order: 1
    });
    setImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (method) => {
    setEditingMethod(method);
    setFormData({
      type: method.type,
      bank_name: method.bank_name || '',
      account_name: method.account_name || '',
      account_number: method.account_number || '',
      is_active: method.is_active,
      display_order: method.display_order
    });
    if (method.qris_image) {
      setImagePreview(`${API_URL}/uploads/${method.qris_image}`);
    }
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.type === 'qris' && !image && !imagePreview) {
      alert('Upload gambar QRIS');
      return;
    }

    if (formData.type === 'bank') {
      if (!formData.bank_name.trim()) {
        alert('Nama bank tidak boleh kosong');
        return;
      }
      if (!formData.account_name.trim()) {
        alert('Nama rekening tidak boleh kosong');
        return;
      }
      if (!formData.account_number.trim()) {
        alert('Nomor rekening tidak boleh kosong');
        return;
      }
    }

    try {
      setSubmitLoading(true);
      const data = new FormData();
      data.append('type', formData.type);
      data.append('bank_name', formData.bank_name);
      data.append('account_name', formData.account_name);
      data.append('account_number', formData.account_number);
      data.append('is_active', formData.is_active);
      data.append('display_order', formData.display_order);
      if (image) {
        data.append('qris_image', image);
      }

      if (editingMethod) {
        await axios.put(
          `${API_URL}/payment-methods/${editingMethod.id}`,
          data,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        await axios.post(
          `${API_URL}/payment-methods`,
          data,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
        );
      }

      closeForm();
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error saving payment method:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan metode pembayaran');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus metode pembayaran ini?')) {
      try {
        await axios.delete(`${API_URL}/payment-methods/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchPaymentMethods();
      } catch (error) {
        console.error('Error deleting payment method:', error);
        alert(error.response?.data?.message || 'Gagal menghapus metode pembayaran');
      }
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingMethod(null);
    setFormData({
      type: 'bank',
      bank_name: '',
      account_name: '',
      account_number: '',
      is_active: true,
      display_order: 0
    });
    setImage(null);
    setImagePreview(null);
  };

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
              <h1 className="text-xl font-bold text-gray-900">Metode Pembayaran</h1>
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
              setEditingMethod(null);
              handleTypeChange('bank');
              setShowForm(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Metode</span>
          </button>
        </div>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Loading...
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Belum ada metode pembayaran. Mulai dengan menambahkan metode baru.
            </div>
          ) : (
            paymentMethods.map(method => (
              <div key={method.id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {method.type === 'qris' ? (
                      <QrCode className="w-8 h-8 text-primary-600" />
                    ) : (
                      <CreditCard className="w-8 h-8 text-primary-600" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {method.type === 'qris' ? 'QRIS' : method.bank_name}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded ${method.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {method.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                  </div>
                </div>

                {method.type === 'qris' ? (
                  method.qris_image && (
                    <img
                      src={`${API_URL}/uploads/${method.qris_image}`}
                      alt="QRIS"
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Nama Rekening:</span> {method.account_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Nomor Rekening:</span> {method.account_number}
                    </p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(method)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(method.id)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingMethod ? 'Edit Metode' : 'Tambah Metode'}
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Selection */}
              {!editingMethod && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Pembayaran
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleTypeChange('bank')}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        formData.type === 'bank'
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">Bank</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange('qris')}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        formData.type === 'qris'
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <QrCode className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">QRIS</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Bank Fields */}
              {formData.type === 'bank' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Bank
                    </label>
                    <input
                      type="text"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Contoh: BCA, Mandiri"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Rekening
                    </label>
                    <input
                      type="text"
                      value={formData.account_name}
                      onChange={(e) => setFormData({...formData, account_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Nama pemilik rekening"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Rekening
                    </label>
                    <input
                      type="text"
                      value={formData.account_number}
                      onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Nomor rekening"
                    />
                  </div>
                </>
              )}

              {/* QRIS Image Field */}
              {formData.type === 'qris' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload QRIS
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {imagePreview && (
                    <div className="mt-3">
                      <img
                        src={imagePreview}
                        alt="QRIS Preview"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Active Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urutan Tampil
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {submitLoading && <Loader className="w-4 h-4 animate-spin" />}
                  <span>{editingMethod ? 'Update' : 'Tambah'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodManagement;

