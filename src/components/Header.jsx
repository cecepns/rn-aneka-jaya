import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, ChevronDown } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useSettings } from '../hooks/useSettings';
import { apiEndpoints } from '../utils/api';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const location = useLocation();
  const { getTotalItems } = useCart();
  const { settings } = useSettings();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiEndpoints.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600';
  };

  const navigation = [
    { name: 'Beranda', href: '/' },
    { name: 'Tentang', href: '/about' },
    { name: 'Produk', href: '/products' },
    { name: 'Info & wawasan', href: '/news' },
    { name: 'Kontak', href: '/contact' },
  ];

  return (
    <header className="bg-white shadow-sm fixed w-full top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src={settings?.logo_image || '/logo.webp'} 
                alt="Mall Gudang Pakan Ternak" 
                className="w-20 h-auto rounded" 
              />
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navigation.map((item) => (
                item.name === 'Produk' ? (
                  <div key={item.name} className="relative group">
                    <Link
                      to={item.href}
                      className={`${isActive(item.href)} transition-colors duration-200 font-medium flex items-center space-x-1`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Link>
                    
                    {/* Dropdown menu */}
                    <div className="absolute left-0 mt-0 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2">
                      <Link
                        to="/products"
                        className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      >
                        Semua Produk
                      </Link>
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          to={`/products?category=${encodeURIComponent(category.name)}`}
                          className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${isActive(item.href)} transition-colors duration-200 font-medium`}
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors duration-200"
            >
              <ShoppingCart className="h-6 w-6" />
              {getTotalItems() > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {navigation.map((item) => (
                item.name === 'Produk' ? (
                  <div key={item.name}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`${isActive(item.href)} block w-full text-left px-3 py-2 text-base font-medium transition-colors duration-200 flex items-center justify-between`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Mobile dropdown menu */}
                    {isDropdownOpen && (
                      <div className="pl-4 space-y-1">
                        <Link
                          to="/products"
                          className="block px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Semua Produk
                        </Link>
                        {categories.map((category) => (
                          <Link
                            key={category.id}
                            to={`/products?category=${encodeURIComponent(category.name)}`}
                            className="block px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                            onClick={() => {
                              setIsMenuOpen(false);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${isActive(item.href)} block px-3 py-2 text-base font-medium transition-colors duration-200`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
