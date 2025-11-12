import { Link } from "react-router-dom";
import { useSettings } from "../hooks/useSettings";

const Footer = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl font-bold">
                Gudang Pakan RN Aneka Jaya
              </span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Gudang Pakan RN Aneka Jaya adalah toko yang menyediakan berbagai
              jenis pakan ternak dan ikan berkualitas untuk memenuhi kebutuhan
              peternak dan penghobi. Kami melayani penjualan pakan ayam, pakan
              bebek, pakan ikan lele, nila, gurame, koi, dan berbagai jenis
              pakan unggas maupun ikan lainnya dengan harga terjangkau.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Menu
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Tentang
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Produk
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Kontak
            </h3>
            <div className="space-y-2 text-gray-300">
              <p className="text-sm whitespace-pre-line">{settings.address}</p>
              <p className="text-sm">
                <a
                  href={`tel:${settings.phone}`}
                  className="hover:text-white transition-colors"
                >
                  {settings.phone}
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Gudang Pakan RN Aneka Jaya. Semua hak cipta dilindungi
            undang-undang.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
