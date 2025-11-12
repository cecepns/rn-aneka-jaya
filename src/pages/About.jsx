import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Award, Users, DollarSign, Shield } from 'lucide-react';
import Logo from '../assets/logo.webp';

const About = () => {
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

  const values = [
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Pakan Berkualitas Tinggi',
      description: 'Kami hanya menyediakan pakan ternak dan ikan berkualitas premium dari produsen terpercaya dengan nutrisi lengkap.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Pelayanan Cepat & Profesional',
      description: 'Tim kami siap melayani kebutuhan Anda dengan cepat, ramah, dan profesional untuk kepuasan maksimal.'
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: 'Harga Kompetitif',
      description: 'Kami menawarkan harga yang terjangkau dengan sistem grosir untuk membantu menghemat biaya peternakan Anda.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Produk Terpercaya',
      description: 'Semua produk dijamin keasliannya dan disimpan dalam kondisi optimal sesuai standar penyimpanan pakan ternak.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6" data-aos="fade-up">
              Tentang Kami
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="200">
              Mengenal lebih dekat Gudang Pakan RN Aneka Jaya, supplier pakan ternak dan ikan berkualitas terpercaya
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div data-aos="fade-right">
              <img 
                src={Logo}
                alt="Gudang Pakan RN Aneka Jaya"
                className="rounded-2xl shadow-lg w-full h-auto"
              />
            </div>
            <div data-aos="fade-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Sejarah Kami
              </h2>
              <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                <p>
                  Gudang Pakan RN Aneka Jaya didirikan dengan visi untuk menjadi supplier pakan ternak dan ikan terpercaya yang dapat diandalkan oleh peternak dan penghobi di seluruh wilayah. Berawal dari keinginan untuk memberikan akses produk pakan berkualitas tinggi dengan harga yang kompetitif.
                </p>
                <p>
                  Kami telah melayani ribuan peternak dengan sepenuh hati, menyediakan berbagai macam pakan berkualitas mulai dari pakan ayam, bebek, ikan lele, nila, gurame, koi, hingga berbagai jenis pakan unggas dan ikan lainnya. Selain itu, kami juga menyediakan vitamin, suplemen ternak, dan perlengkapan peternakan untuk mendukung pertumbuhan hewan peliharaan Anda secara optimal.
                </p>
                <p>
                  Saat ini, Gudang Pakan RN Aneka Jaya terus berinovasi dengan menghadirkan produk-produk terbaru dan layanan yang lebih baik untuk memenuhi kebutuhan peternak modern, tanpa melupakan komitmen kami terhadap kualitas dan kepercayaan yang menjadi ciri khas kami.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Komitmen Kami
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dedikasi kami terhadap kesuksesan peternak Anda tercermin dalam setiap komitmen yang kami pegang teguh
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="card p-8 hover:shadow-lg transition-shadow duration-300"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-primary-600">{value.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div data-aos="fade-right">
              <h2 className="text-3xl font-bold text-white mb-6">
                Visi Kami
              </h2>
              <p className="text-primary-100 text-lg leading-relaxed">
                Menjadi supplier pakan ternak dan ikan terpercaya dan terdepan yang memberikan kontribusi nyata dalam meningkatkan produktivitas peternakan melalui penyediaan pakan berkualitas premium, harga kompetitif, dan pelayanan yang profesional.
              </p>
            </div>
            <div data-aos="fade-left">
              <h2 className="text-3xl font-bold text-white mb-6">
                Misi Kami
              </h2>
              <ul className="text-primary-100 text-lg space-y-3">
                <li className="flex items-start">
                  <span className="text-white mr-2">•</span>
                  Menyediakan pakan ternak dan ikan berkualitas tinggi dengan nutrisi lengkap dan harga kompetitif
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2">•</span>
                  Memberikan solusi lengkap untuk kebutuhan pakan dan suplemen ternak Anda
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2">•</span>
                  Memastikan ketersediaan stok pakan berkualitas dengan pengiriman yang cepat dan aman
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2">•</span>
                  Membangun kepercayaan peternak melalui layanan purna jual dan konsultasi produk yang profesional
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
