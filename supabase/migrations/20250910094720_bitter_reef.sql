/*
# Database Setup untuk Apotik Ghanim

1. Database
   - Nama: apotik_ghanim

2. Tables
   - `products`: Menyimpan data produk obat-obatan
   - `settings`: Menyimpan pengaturan apotek (alamat, telepon, dll)
   - `messages`: Menyimpan pesan dari contact form

3. Default Data
   - Admin login: username=admin, password=admin123
   - Sample products data
   - Default settings
*/

-- Create Database
CREATE DATABASE IF NOT EXISTS apotik_ghanim;
USE apotik_ghanim;

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  category VARCHAR(100) NOT NULL,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  address TEXT,
  phone VARCHAR(20),
  maps_url TEXT,
  about_us TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('unread', 'read') DEFAULT 'unread',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Settings
INSERT INTO settings (address, phone, maps_url, about_us) VALUES (
  'RT.12/RW.1, Palmeriam, Kec. Matraman, Kota Jakarta Timur, DKI Jakarta 13110',
  '088210232391',
  'https://maps.app.goo.gl/nwkqSVyAXtdTC37HA',
  'Apotik Ghanim adalah apotek terpercaya yang telah melayani masyarakat Jakarta Timur sejak tahun 2010. Kami berkomitmen menyediakan obat-obatan dan produk kesehatan berkualitas dengan pelayanan yang prima dan harga yang terjangkau.'
);

-- Insert Sample Products
INSERT INTO products (name, description, price, stock, category) VALUES
('Paracetamol 500mg', '<p>Paracetamol adalah obat yang digunakan untuk meredakan nyeri dan menurunkan demam. Obat ini efektif untuk mengatasi sakit kepala, sakit gigi, nyeri otot, dan demam ringan hingga sedang.</p><p><strong>Dosis:</strong> Dewasa 1-2 tablet setiap 4-6 jam, maksimal 8 tablet per hari.</p>', 5000, 100, 'Obat Bebas'),

('Amoxicillin 500mg', '<p>Amoxicillin adalah antibiotik golongan penisilin yang digunakan untuk mengobati berbagai infeksi bakteri seperti infeksi saluran pernapasan, infeksi kulit, dan infeksi saluran kemih.</p><p><strong>Perhatian:</strong> Harus dihabiskan sesuai petunjuk dokter meskipun sudah merasa sembuh.</p>', 25000, 50, 'Obat Keras'),

('Vitamin C 1000mg', '<p>Suplemen vitamin C dosis tinggi untuk meningkatkan daya tahan tubuh dan membantu proses penyembuhan. Vitamin C juga berperan sebagai antioksidan yang melindungi sel-sel tubuh dari radikal bebas.</p><p><strong>Manfaat:</strong> Meningkatkan imunitas, membantu penyerapan zat besi, dan menjaga kesehatan kulit.</p>', 45000, 75, 'Vitamin & Suplemen'),

('Betadine Solution 60ml', '<p>Antiseptik topikal yang mengandung povidone iodine untuk membersihkan luka dan mencegah infeksi. Efektif membunuh bakteri, virus, dan jamur pada permukaan kulit.</p><p><strong>Cara pakai:</strong> Oleskan secukupnya pada area yang akan diobati 2-3 kali sehari.</p>', 18000, 30, 'Obat Bebas'),

('Antimo Tablet', '<p>Obat untuk mencegah dan mengatasi mabuk perjalanan. Mengandung dimenhydrinate yang efektif mengurangi mual, muntah, dan pusing akibat mabuk kendaraan.</p><p><strong>Dosis:</strong> Dewasa 1-2 tablet, diminum 30 menit sebelum bepergian.</p>', 8000, 60, 'Obat Bebas Terbatas'),

('Mylanta Tablet', '<p>Antasida yang digunakan untuk mengatasi gangguan lambung seperti maag, kembung, dan perut kembung. Mengandung aluminium hidroksida dan magnesium hidroksida.</p><p><strong>Cara pakai:</strong> Kunyah 1-2 tablet setelah makan dan sebelum tidur.</p>', 12000, 40, 'Obat Bebas'),

('Tolak Angin Cair', '<p>Obat herbal tradisional untuk mengatasi masuk angin, perut kembung, mual, dan gejala flu ringan. Terbuat dari bahan-bahan alami seperti jahe, meniran, dan adas.</p><p><strong>Khasiat:</strong> Menghangatkan badan dan melancarkan pencernaan.</p>', 7000, 80, 'Herbal'),

('Thermometer Digital', '<p>Termometer digital dengan akurasi tinggi untuk mengukur suhu tubuh. Dilengkapi dengan layar LCD yang mudah dibaca dan alarm otomatis saat pengukuran selesai.</p><p><strong>Fitur:</strong> Pengukuran cepat 10 detik, memory penyimpanan, dan tahan air.</p>', 65000, 20, 'Alat Kesehatan'),

('Baby Oil 200ml', '<p>Minyak bayi yang lembut dan aman untuk kulit sensitif bayi. Diformulasikan khusus untuk melembapkan kulit bayi dan mencegah ruam popok.</p><p><strong>Manfaat:</strong> Melembapkan kulit, mudah diserap, dan tidak menyebabkan iritasi.</p>', 22000, 35, 'Perawatan Bayi'),

('Curcuma Plus Syrup', '<p>Suplemen herbal berbentuk sirup untuk meningkatkan nafsu makan anak. Mengandung ekstrak temulawak, madu, dan vitamin yang baik untuk tumbuh kembang anak.</p><p><strong>Dosis:</strong> Anak 1-5 tahun: 1 sendok teh 2x sehari. Anak 6-12 tahun: 1 sendok makan 2x sehari.</p>', 35000, 25, 'Herbal');

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Show tables to verify
SHOW TABLES;