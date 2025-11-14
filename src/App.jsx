import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { CartProvider } from './context/CartContext';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';

// Admin Pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import Settings from './pages/admin/Settings';
import NewsManagement from './pages/admin/NewsManagement';
import NewsCategoryManagement from './pages/admin/NewsCategoryManagement';
import PaymentMethodManagement from './pages/admin/PaymentMethodManagement';

function App() {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <div className="App overflow-x-hidden">
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/products" element={<ProductManagement />} />
            <Route path="/admin/categories" element={<CategoryManagement />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin/news" element={<NewsManagement />} />
            <Route path="/admin/news-categories" element={<NewsCategoryManagement />} />
            <Route path="/admin/payment-methods" element={<PaymentMethodManagement />} />
            
            {/* Public Routes */}
            <Route path="/*" element={
              <>
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/news" element={<News />} />
                    <Route path="/news/:slug" element={<NewsDetail />} />
                  </Routes>
                </main>
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;