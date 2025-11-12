import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiEndpoints } from '../../utils/api';
import Pagination from '../../components/Pagination';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingVariant, setEditingVariant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image: null
  });
  const [variantFormData, setVariantFormData] = useState({
    name: '',
    price: '',
    stock: '',
    image: null
  });
  const [variantImagePreview, setVariantImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link'],
      ['clean']
    ],
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await apiEndpoints.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

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

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleDescriptionChange = (content) => {
    setFormData(prev => ({
      ...prev,
      description: content
    }));
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        image: null
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        image: null
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleVariantInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setVariantFormData(prev => ({
        ...prev,
        [name]: file
      }));
      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setVariantImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setVariantFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const openVariantModal = async (product, variant = null) => {
    try {
      // Fetch product with its variants from server
      const response = await apiEndpoints.getProductVariants(product.id);
      const productWithVariants = response.data;
      
      if (variant) {
        setEditingVariant(variant);
        setVariantFormData({
          name: variant.name,
          price: variant.price,
          stock: variant.stock,
          image: null
        });
        // Set preview to existing image
        if (variant.image) {
          setVariantImagePreview(`https://api-inventory.isavralabel.com/rn-aneka-jaya/uploads/${variant.image}`);
        } else {
          setVariantImagePreview(null);
        }
      } else {
        setEditingVariant(null);
        setVariantFormData({
          name: '',
          price: '',
          stock: '',
          image: null
        });
        setVariantImagePreview(null);
      }
      setEditingProduct(productWithVariants);
      setShowVariantModal(true);
    } catch (error) {
      console.error('Error loading product variants:', error);
      alert('Terjadi kesalahan saat memuat varian produk');
    }
  };

  const closeVariantModal = () => {
    setShowVariantModal(false);
    setEditingVariant(null);
    setEditingProduct(null);
    setVariantImagePreview(null);
  };

  const handleVariantSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      Object.keys(variantFormData).forEach(key => {
        if (variantFormData[key] !== null) {
          submitData.append(key, variantFormData[key]);
        }
      });

      if (editingVariant) {
        await apiEndpoints.updateVariant(editingVariant.id, submitData);
      } else {
        submitData.append('product_id', editingProduct.id);
        await apiEndpoints.createVariant(submitData);
      }
      
      closeVariantModal();
      fetchProducts();
      alert(editingVariant ? 'Varian berhasil diupdate!' : 'Varian berhasil ditambahkan!');
    } catch (error) {
      console.error('Error saving variant:', error);
      alert('Terjadi kesalahan saat menyimpan varian');
    }
  };

  const handleVariantDelete = async (variantId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus varian ini?')) {
      try {
        await apiEndpoints.deleteVariant(variantId);
        fetchProducts();
        alert('Varian berhasil dihapus!');
      } catch (error) {
        console.error('Error deleting variant:', error);
        alert('Terjadi kesalahan saat menghapus varian');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          submitData.append(key, formData[key]);
        }
      });

      if (editingProduct) {
        await apiEndpoints.updateProduct(editingProduct.id, submitData);
      } else {
        await apiEndpoints.createProduct(submitData);
      }
      
      closeModal();
      fetchProducts();
      alert(editingProduct ? 'Produk berhasil diupdate!' : 'Produk berhasil ditambahkan!');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Terjadi kesalahan saat menyimpan produk');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        await apiEndpoints.deleteProduct(id);
        fetchProducts();
        alert('Produk berhasil dihapus!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Terjadi kesalahan saat menghapus produk');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
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
            <div className="flex items-center space-x-4">
              <Link to="/admin/dashboard" className="text-gray-500 hover:text-gray-700">
                ← Dashboard
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Manajemen Produk</h1>
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Daftar Produk</h2>
          <button
            onClick={() => openModal()}
            className="btn-primary px-6 py-2"
          >
            + Tambah Produk
          </button>
        </div>

        {/* Products Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harga
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stok
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img 
                            src={product.image ? `https://api-inventory.isavralabel.com/rn-aneka-jaya/uploads/${product.image}` : 'https://images.pexels.com/photos/3683091/pexels-photo-3683091.jpeg?auto=compress&cs=tinysrgb&w=100'}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover mr-4"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: product.description?.substring(0, 50) + '...' }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          product.stock < 10 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {product.stock} item
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openVariantModal(product)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Kelola varian"
                          >
                            Varian
                          </button>
                          <button
                            onClick={() => openModal(product)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Variant Modal */}
      {showVariantModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Kelola Varian - {editingProduct.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Tambahkan atau edit varian produk dengan harga dan stok yang berbeda</p>
                </div>
                <button
                  onClick={closeVariantModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Variant List */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4">Daftar Varian</h4>
                {editingProduct.variants && editingProduct.variants.length > 0 ? (
                  <div className="space-y-3">
                    {editingProduct.variants.map((variant) => (
                      <div key={variant.id} className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                        <div className="flex items-center space-x-3">
                          {variant.image && (
                            <img 
                              src={`https://api-inventory.isavralabel.com/rn-aneka-jaya/uploads/${variant.image}`}
                              alt={variant.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{variant.name}</div>
                            <div className="text-sm text-gray-500">
                              Rp{variant.price?.toLocaleString('id-ID')} • Stok: {variant.stock}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openVariantModal(editingProduct, variant)}
                            className="text-primary-600 hover:text-primary-900 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleVariantDelete(variant.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Belum ada varian. Tambahkan varian baru di bawah.</p>
                )}
              </div>

              {/* Variant Form */}
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  {editingVariant ? 'Edit Varian' : 'Tambah Varian Baru'}
                </h4>
                <form onSubmit={handleVariantSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Varian *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="input-field"
                      value={variantFormData.name}
                      onChange={handleVariantInputChange}
                      placeholder="Contoh: Ukuran S, Warna Merah, dll"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Harga *
                      </label>
                      <input
                        type="number"
                        name="price"
                        required
                        min="0"
                        className="input-field"
                        value={variantFormData.price}
                        onChange={handleVariantInputChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stok *
                      </label>
                      <input
                        type="number"
                        name="stock"
                        required
                        min="0"
                        className="input-field"
                        value={variantFormData.stock}
                        onChange={handleVariantInputChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gambar Varian
                    </label>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      className="input-field"
                      onChange={handleVariantInputChange}
                    />
                    {variantImagePreview && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                        <img 
                          src={variantImagePreview}
                          alt="Preview"
                          className="w-32 h-32 rounded-lg object-cover border border-gray-200"
                        />
                      </div>
                    )}
                    {editingVariant && editingVariant.image && !variantImagePreview && (
                      <p className="text-sm text-gray-500 mt-1">
                        Gambar saat ini: {editingVariant.image}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button
                      type="button"
                      onClick={closeVariantModal}
                      className="btn-secondary px-6 py-2"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="btn-primary px-6 py-2"
                    >
                      {editingVariant ? 'Update Varian' : 'Simpan Varian'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Produk *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi *
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    modules={quillModules}
                    className="mb-4"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Harga *
                    </label>
                    <input
                      type="number"
                      name="price"
                      required
                      min="0"
                      className="input-field"
                      value={formData.price}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stok *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      required
                      min="0"
                      className="input-field"
                      value={formData.stock}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <select
                    name="category"
                    required
                    className="input-field"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Kelola kategori di <Link to="/admin/categories" className="text-primary-600 hover:text-primary-700">halaman kategori</Link>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gambar Produk
                  </label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    className="input-field"
                    onChange={handleInputChange}
                  />
                  {editingProduct && editingProduct.image && (
                    <p className="text-sm text-gray-500 mt-1">
                      Gambar saat ini: {editingProduct.image}
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-secondary px-6 py-2"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-6 py-2"
                  >
                    {editingProduct ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;