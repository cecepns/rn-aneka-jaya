import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiEndpoints } from '../../utils/api';
import { MapPin, Phone, Map, Clock, Instagram, Facebook } from 'lucide-react';
import TikTokIcon from '../../components/TikTokIcon';

const Settings = () => {
  const [settings, setSettings] = useState({
    address: '',
    phone: '',
    maps_url: '',
    operating_hours: '',
    about_us: '',
    instagram_url: '',
    tiktok_url: '',
    facebook_url: '',
    hero_title: '',
    hero_description: '',
    banner_image: null,
    logo_image: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await apiEndpoints.getSettings();
      setSettings(response.data);
      if (response.data.banner_image) {
        setBannerPreview(response.data.banner_image);
      }
      if (response.data.logo_image) {
        setLogoPreview(response.data.logo_image);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Set default values if no settings exist
      setSettings({
        address: 'Jl Transeram Waihatu, Kairatu Barat, Kab SBB',
        phone: '085243008899',
        maps_url: 'https://maps.app.goo.gl/nwkqSVyAXtdTC37HA',
        operating_hours: 'Setiap Hari: 07.00 - 21.00 WIT',
        about_us: 'Gudang Pakan RN Aneka Jaya adalah supplier pakan ternak dan ikan berkualitas terpercaya.',
        instagram_url: '',
        tiktok_url: '',
        facebook_url: '',
        hero_title: 'Selamat Datang di<br/>Gudang Pakan<br/>RN Aneka Jaya',
        hero_description: 'Supplier pakan berkualitas terpercaya',
        banner_image: null,
        logo_image: null
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value
    });
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSettings({
        ...settings,
        banner_image: file
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSettings({
        ...settings,
        logo_image: file
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const formData = new FormData();
      
      // Add text fields
      formData.append('address', settings.address);
      formData.append('phone', settings.phone);
      formData.append('maps_url', settings.maps_url);
      formData.append('operating_hours', settings.operating_hours);
      formData.append('about_us', settings.about_us);
      formData.append('instagram_url', settings.instagram_url);
      formData.append('tiktok_url', settings.tiktok_url);
      formData.append('facebook_url', settings.facebook_url);
      formData.append('hero_title', settings.hero_title);
      formData.append('hero_description', settings.hero_description);
      
      // Add image files if they exist
      if (settings.banner_image instanceof File) {
        formData.append('banner_image', settings.banner_image);
      }
      if (settings.logo_image instanceof File) {
        formData.append('logo_image', settings.logo_image);
      }

      await apiEndpoints.updateSettings(formData);
      alert('Pengaturan berhasil disimpan!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Terjadi kesalahan saat menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/admin/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

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
              <h1 className="text-xl font-bold text-gray-900">Pengaturan</h1>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pengaturan Toko</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Alamat Toko
              </label>
              <textarea
                id="address"
                name="address"
                rows="3"
                className="input-field"
                value={settings.address}
                onChange={handleChange}
                placeholder="Masukkan alamat lengkap toko"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Telepon
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="input-field"
                value={settings.phone}
                onChange={handleChange}
                placeholder="Contoh: 085243008899"
              />
            </div>

            <div>
              <label htmlFor="maps_url" className="block text-sm font-medium text-gray-700 mb-2">
                Link Google Maps
              </label>
              <input
                type="url"
                id="maps_url"
                name="maps_url"
                className="input-field"
                value={settings.maps_url}
                onChange={handleChange}
                placeholder="https://maps.app.goo.gl/..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Salin link dari Google Maps untuk menampilkan lokasi toko
              </p>
            </div>

            <div>
              <label htmlFor="operating_hours" className="block text-sm font-medium text-gray-700 mb-2">
                Jam Operasional
              </label>
              <input
                type="text"
                id="operating_hours"
                name="operating_hours"
                className="input-field"
                value={settings.operating_hours}
                onChange={handleChange}
                placeholder="Contoh: Setiap Hari: 07.00 - 21.00 WIT"
              />
              <p className="text-sm text-gray-500 mt-1">
                Masukkan jam operasional toko Anda
              </p>
            </div>

            <div>
              <label htmlFor="about_us" className="block text-sm font-medium text-gray-700 mb-2">
                Tentang Kami
              </label>
              <textarea
                id="about_us"
                name="about_us"
                rows="5"
                className="input-field"
                value={settings.about_us}
                onChange={handleChange}
                placeholder="Ceritakan tentang toko Anda..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Deskripsi singkat tentang toko yang akan ditampilkan di website
              </p>
            </div>

            {/* Hero Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Halaman Beranda (Hero)</h3>
              
              <div>
                <label htmlFor="hero_title" className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Hero
                </label>
                <textarea
                  id="hero_title"
                  name="hero_title"
                  rows="3"
                  className="input-field"
                  value={settings.hero_title}
                  onChange={handleChange}
                  placeholder="Masukkan judul hero (gunakan &lt;br/&gt; untuk baris baru)"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Gunakan &lt;br/&gt; untuk membuat baris baru
                </p>
              </div>

              <div className="mt-4">
                <label htmlFor="hero_description" className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi Hero
                </label>
                <textarea
                  id="hero_description"
                  name="hero_description"
                  rows="3"
                  className="input-field"
                  value={settings.hero_description}
                  onChange={handleChange}
                  placeholder="Masukkan deskripsi hero"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="banner_image" className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image
                </label>
                <input
                  type="file"
                  id="banner_image"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="input-field"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload gambar banner untuk hero section
                </p>
                {bannerPreview && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <img 
                      src={bannerPreview} 
                      alt="Banner Preview" 
                      className="max-w-xs h-auto rounded-lg border border-gray-300"
                    />
                  </div>
                )}
              </div>

              <div className="mt-4">
                <label htmlFor="logo_image" className="block text-sm font-medium text-gray-700 mb-2">
                  Logo
                </label>
                <input
                  type="file"
                  id="logo_image"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="input-field"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload logo toko Anda
                </p>
                {logoPreview && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <img 
                      src={logoPreview} 
                      alt="Logo Preview" 
                      className="w-20 h-20 object-contain rounded-lg border border-gray-300"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Social Media Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Media Sosial</h3>
              
              <div>
                <label htmlFor="instagram_url" className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                <input
                  type="url"
                  id="instagram_url"
                  name="instagram_url"
                  className="input-field"
                  value={settings.instagram_url}
                  onChange={handleChange}
                  placeholder="https://instagram.com/username"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="tiktok_url" className="block text-sm font-medium text-gray-700 mb-2">
                  TikTok
                </label>
                <input
                  type="url"
                  id="tiktok_url"
                  name="tiktok_url"
                  className="input-field"
                  value={settings.tiktok_url}
                  onChange={handleChange}
                  placeholder="https://tiktok.com/@username"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="facebook_url" className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook
                </label>
                <input
                  type="url"
                  id="facebook_url"
                  name="facebook_url"
                  className="input-field"
                  value={settings.facebook_url}
                  onChange={handleChange}
                  placeholder="https://facebook.com/username"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-end space-x-4">
                <Link
                  to="/admin/dashboard"
                  className="btn-secondary px-6 py-2"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
              </div>
            </div>
          </form>

          {/* Preview Section */}
          <div className="mt-12 pt-8 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview Kontak</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Alamat</h4>
                    <p className="text-gray-600">{settings.address || 'Belum diatur'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-primary-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Telepon</h4>
                    <p className="text-gray-600">{settings.phone || 'Belum diatur'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Map className="w-5 h-5 text-primary-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Maps</h4>
                    <p className="text-gray-600">
                      {settings.maps_url ? (
                        <a href={settings.maps_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                          Lihat di Google Maps
                        </a>
                      ) : (
                        'Belum diatur'
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-primary-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Jam Operasional</h4>
                    <p className="text-gray-600">{settings.operating_hours || 'Belum diatur'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Instagram className="w-5 h-5 text-primary-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Instagram</h4>
                    <p className="text-gray-600">
                      {settings.instagram_url ? (
                        <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                          Kunjungi Instagram
                        </a>
                      ) : (
                        'Belum diatur'
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TikTokIcon size={20} className="w-5 h-5 text-primary-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">TikTok</h4>
                    <p className="text-gray-600">
                      {settings.tiktok_url ? (
                        <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                          Kunjungi TikTok
                        </a>
                      ) : (
                        'Belum diatur'
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Facebook className="w-5 h-5 text-primary-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Facebook</h4>
                    <p className="text-gray-600">
                      {settings.facebook_url ? (
                        <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                          Kunjungi Facebook
                        </a>
                      ) : (
                        'Belum diatur'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
