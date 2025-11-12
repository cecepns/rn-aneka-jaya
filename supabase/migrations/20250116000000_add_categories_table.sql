-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default categories for sembako (grocery store)
INSERT INTO categories (name, description) VALUES
('Beras', 'Berbagai jenis dan merk beras berkualitas'),
('Minyak Goreng', 'Minyak goreng dalam berbagai ukuran'),
('Gula', 'Gula pasir dan gula merah'),
('Tepung', 'Tepung terigu, beras, dan jenis tepung lainnya'),
('Bumbu Dapur', 'Garam, merica, dan bumbu masak lainnya'),
('Mie Instan', 'Berbagai merk mie instan'),
('Minuman', 'Minuman kemasan dan sirup'),
('Susu & Produk Susu', 'Susu bubuk, UHT, dan produk olahan susu'),
('Makanan Ringan', 'Snack dan makanan ringan'),
('Kebutuhan Dapur', 'Peralatan dan kebutuhan dapur lainnya')
ON DUPLICATE KEY UPDATE name=name;


