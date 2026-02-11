const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads-apotik-ghanim'));

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'toko_bagus_waihatu'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads-apotik-ghanim/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// JWT verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Authentication Routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign(
      { id: 1, username: 'admin' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({ token, message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Products Routes
app.get('/api/products', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const category = req.query.category || null;

  // Build WHERE clause based on filters
  let whereClause = '';
  let queryParams = [];
  
  if (category) {
    whereClause = 'WHERE category = ?';
    queryParams.push(category);
  }

  // Get total count
  const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
  db.query(countQuery, queryParams, (err, countResult) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching product count' });
    }

    const total = countResult[0].total;

    // Get products with pagination and category filter
    const productsQuery = `SELECT * FROM products ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const productsParams = [...queryParams, limit, offset];
    
    db.query(productsQuery, productsParams, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching products' });
      }

      res.json({
        products: results,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit)
      });
    });
  });
});

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'SELECT * FROM products WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching product' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = results[0];

    // Fetch variants for this product
    const variantQuery = 'SELECT * FROM product_variants WHERE product_id = ? ORDER BY created_at ASC';
    db.query(variantQuery, [id], (variantErr, variants) => {
      if (variantErr) {
        console.error('Error fetching variants:', variantErr);
        variants = [];
      }
      
      res.json({
        ...product,
        variants: variants || []
      });
    });
  });
});

app.post('/api/products', verifyToken, upload.single('image'), (req, res) => {
  const { name, description, price, stock, category } = req.body;
  const image = req.file ? req.file.filename : null;

  const query = 'INSERT INTO products (name, description, price, stock, category, image) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [name, description, price, stock, category, image], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating product' });
    }

    res.status(201).json({ 
      id: result.insertId, 
      message: 'Product created successfully' 
    });
  });
});

app.put('/api/products/:id', verifyToken, upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, category } = req.body;

  // If a new image is uploaded, fetch old image to delete after successful update
  if (req.file) {
    const newImage = req.file.filename;
    const getOldImageQuery = 'SELECT image FROM products WHERE id = ?';

    db.query(getOldImageQuery, [id], (selectErr, selectResults) => {
      if (selectErr) {
        return res.status(500).json({ message: 'Error fetching product' });
      }

      if (selectResults.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const oldImage = selectResults[0].image;
      const updateQuery = 'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ?, image = ? WHERE id = ?';
      const updateParams = [name, description, price, stock, category, newImage, id];

      db.query(updateQuery, updateParams, (updateErr, updateResult) => {
        if (updateErr) {
          return res.status(500).json({ message: 'Error updating product' });
        }

        if (updateResult.affectedRows === 0) {
          return res.status(404).json({ message: 'Product not found' });
        }

        // Delete old image file if it exists and is different from the new one
        if (oldImage && oldImage !== newImage) {
          const oldImagePath = path.join('uploads-apotik-ghanim', oldImage);
          fs.unlink(oldImagePath, (unlinkErr) => {
            // Ignore file not found; log other errors
            if (unlinkErr && unlinkErr.code !== 'ENOENT') {
              console.error('Failed to delete old image:', unlinkErr);
            }
          });
        }

        res.json({ message: 'Product updated successfully' });
      });
    });
  } else {
    // Update without changing image
    const query = 'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ? WHERE id = ?';
    const params = [name, description, price, stock, category, id];

    db.query(query, params, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating product' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json({ message: 'Product updated successfully' });
    });
  }
});

app.delete('/api/products/:id', verifyToken, (req, res) => {
  const { id } = req.params;

  // Fetch image file name before deleting the product
  const getImageQuery = 'SELECT image FROM products WHERE id = ?';
  db.query(getImageQuery, [id], (selectErr, selectResults) => {
    if (selectErr) {
      return res.status(500).json({ message: 'Error fetching product' });
    }

    if (selectResults.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const imageToDelete = selectResults[0].image;

    const deleteQuery = 'DELETE FROM products WHERE id = ?';
    db.query(deleteQuery, [id], (deleteErr, deleteResult) => {
      if (deleteErr) {
        return res.status(500).json({ message: 'Error deleting product' });
      }

      if (deleteResult.affectedRows === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Attempt to delete the associated image file (best-effort)
      if (imageToDelete) {
        const imagePath = path.join('uploads-apotik-ghanim', imageToDelete);
        fs.unlink(imagePath, (unlinkErr) => {
          if (unlinkErr && unlinkErr.code !== 'ENOENT') {
            console.error('Failed to delete product image:', unlinkErr);
          }
        });
      }

      res.json({ message: 'Product deleted successfully' });
    });
  });
});

// Settings Routes
app.get('/api/settings', (req, res) => {
  const query = 'SELECT * FROM settings ORDER BY id DESC LIMIT 1';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching settings' });
    }

    if (results.length === 0) {
      // Return default settings
      return res.json({
        address: 'Jl Transeram Waihatu, Kairatu Barat, Kab SBB',
        phone: '085243008899',
        maps_url: 'https://maps.app.goo.gl/nwkqSVyAXtdTC37HA',
        operating_hours: 'Setiap Hari: 07.00 - 21.00 WIT',
        about_us: 'Mall Gudang Pakan Ternak adalah supplier pakan ternak dan ikan berkualitas terpercaya yang menyediakan berbagai macam pakan unggas, ikan, suplemen, dan perlengkapan peternakan dengan harga kompetitif.',
        instagram_url: '',
        tiktok_url: '',
        facebook_url: '',
        hero_title: 'Selamat Datang di<br/>Gudang Pakan<br/>RN Aneka Jaya',
        hero_description: 'Supplier pakan ternak dan ikan berkualitas terpercaya yang menyediakan berbagai macam pakan unggas, ikan, suplemen, dan perlengkapan peternakan dengan harga kompetitif untuk mendukung produktivitas peternakan Anda.',
        banner_image: null,
        logo_image: null
      });
    }

    // Map banner_image to full URL if exists
    if (results[0].banner_image) {
      results[0].banner_image = `https://api-inventory.isavralabel.com/rn-aneka-jaya/uploads/${results[0].banner_image}`;
    }
    if (results[0].logo_image) {
      results[0].logo_image = `https://api-inventory.isavralabel.com/rn-aneka-jaya/uploads/${results[0].logo_image}`;
    }

    res.json(results[0]);
  });
});

app.put('/api/settings', verifyToken, upload.fields([
  { name: 'banner_image', maxCount: 1 },
  { name: 'logo_image', maxCount: 1 }
]), (req, res) => {
  const { address, phone, maps_url, operating_hours, about_us, instagram_url, tiktok_url, facebook_url, hero_title, hero_description } = req.body;
  
  const bannerImage = req.files?.banner_image?.[0]?.filename || null;
  const logoImage = req.files?.logo_image?.[0]?.filename || null;

  // Check if settings exist
  const checkQuery = 'SELECT id, banner_image, logo_image FROM settings ORDER BY id DESC LIMIT 1';
  db.query(checkQuery, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error checking settings' });
    }

    if (results.length === 0) {
      // Insert new settings
      const insertQuery = 'INSERT INTO settings (address, phone, maps_url, operating_hours, about_us, instagram_url, tiktok_url, facebook_url, hero_title, hero_description, banner_image, logo_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      db.query(insertQuery, [address, phone, maps_url, operating_hours, about_us, instagram_url, tiktok_url, facebook_url, hero_title, hero_description, bannerImage, logoImage], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error creating settings' });
        }
        res.json({ message: 'Settings created successfully' });
      });
    } else {
      // Update existing settings
      const oldBannerImage = results[0].banner_image;
      const oldLogoImage = results[0].logo_image;

      const updateQuery = 'UPDATE settings SET address = ?, phone = ?, maps_url = ?, operating_hours = ?, about_us = ?, instagram_url = ?, tiktok_url = ?, facebook_url = ?, hero_title = ?, hero_description = ?, banner_image = COALESCE(?, banner_image), logo_image = COALESCE(?, logo_image) WHERE id = ?';
      db.query(updateQuery, [address, phone, maps_url, operating_hours, about_us, instagram_url, tiktok_url, facebook_url, hero_title, hero_description, bannerImage, logoImage, results[0].id], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error updating settings' });
        }

        // Delete old images if new ones were uploaded
        if (bannerImage && oldBannerImage && oldBannerImage !== bannerImage) {
          const oldBannerPath = path.join('uploads-apotik-ghanim', oldBannerImage);
          fs.unlink(oldBannerPath, (unlinkErr) => {
            if (unlinkErr && unlinkErr.code !== 'ENOENT') {
              console.error('Failed to delete old banner:', unlinkErr);
            }
          });
        }

        if (logoImage && oldLogoImage && oldLogoImage !== logoImage) {
          const oldLogoPath = path.join('uploads-apotik-ghanim', oldLogoImage);
          fs.unlink(oldLogoPath, (unlinkErr) => {
            if (unlinkErr && unlinkErr.code !== 'ENOENT') {
              console.error('Failed to delete old logo:', unlinkErr);
            }
          });
        }

        res.json({ message: 'Settings updated successfully' });
      });
    }
  });
});

// Categories Routes
app.get('/api/categories', (req, res) => {
  const query = 'SELECT * FROM categories ORDER BY name ASC';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching categories' });
    }
    res.json(results);
  });
});

app.post('/api/categories', verifyToken, (req, res) => {
  const { name, description } = req.body;
  
  const query = 'INSERT INTO categories (name, description) VALUES (?, ?)';
  db.query(query, [name, description || ''], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating category' });
    }
    
    res.status(201).json({
      id: result.insertId,
      message: 'Category created successfully'
    });
  });
});

app.put('/api/categories/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  
  const query = 'UPDATE categories SET name = ?, description = ? WHERE id = ?';
  db.query(query, [name, description || '', id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating category' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category updated successfully' });
  });
});

app.delete('/api/categories/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM categories WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting category' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  });
});

// Variants Routes
app.post('/api/variants', verifyToken, upload.single('image'), (req, res) => {
  const { product_id, name, price, stock } = req.body;
  const image = req.file ? req.file.filename : null;

  const query = 'INSERT INTO product_variants (product_id, name, price, stock, image) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [product_id, name, price, stock, image], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating variant' });
    }

    res.status(201).json({ 
      id: result.insertId, 
      message: 'Variant created successfully' 
    });
  });
});

app.put('/api/variants/:id', verifyToken, upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { name, price, stock } = req.body;

  if (req.file) {
    const newImage = req.file.filename;
    const getOldImageQuery = 'SELECT image FROM product_variants WHERE id = ?';

    db.query(getOldImageQuery, [id], (selectErr, selectResults) => {
      if (selectErr) {
        return res.status(500).json({ message: 'Error fetching variant' });
      }

      if (selectResults.length === 0) {
        return res.status(404).json({ message: 'Variant not found' });
      }

      const oldImage = selectResults[0].image;
      const updateQuery = 'UPDATE product_variants SET name = ?, price = ?, stock = ?, image = ? WHERE id = ?';
      const updateParams = [name, price, stock, newImage, id];

      db.query(updateQuery, updateParams, (updateErr, updateResult) => {
        if (updateErr) {
          return res.status(500).json({ message: 'Error updating variant' });
        }

        if (updateResult.affectedRows === 0) {
          return res.status(404).json({ message: 'Variant not found' });
        }

        // Delete old image file if it exists and is different from the new one
        if (oldImage && oldImage !== newImage) {
          const oldImagePath = path.join('uploads-apotik-ghanim', oldImage);
          fs.unlink(oldImagePath, (unlinkErr) => {
            if (unlinkErr && unlinkErr.code !== 'ENOENT') {
              console.error('Failed to delete old image:', unlinkErr);
            }
          });
        }

        res.json({ message: 'Variant updated successfully' });
      });
    });
  } else {
    const updateQuery = 'UPDATE product_variants SET name = ?, price = ?, stock = ? WHERE id = ?';
    const updateParams = [name, price, stock, id];

    db.query(updateQuery, updateParams, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating variant' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Variant not found' });
      }

      res.json({ message: 'Variant updated successfully' });
    });
  }
});

app.delete('/api/variants/:id', verifyToken, (req, res) => {
  const { id } = req.params;

  const getImageQuery = 'SELECT image FROM product_variants WHERE id = ?';
  db.query(getImageQuery, [id], (selectErr, selectResults) => {
    if (selectErr) {
      return res.status(500).json({ message: 'Error fetching variant' });
    }

    if (selectResults.length === 0) {
      return res.status(404).json({ message: 'Variant not found' });
    }

    const imageToDelete = selectResults[0].image;

    const deleteQuery = 'DELETE FROM product_variants WHERE id = ?';
    db.query(deleteQuery, [id], (deleteErr, deleteResult) => {
      if (deleteErr) {
        return res.status(500).json({ message: 'Error deleting variant' });
      }

      if (deleteResult.affectedRows === 0) {
        return res.status(404).json({ message: 'Variant not found' });
      }

      // Attempt to delete the associated image file (best-effort)
      if (imageToDelete) {
        const imagePath = path.join('uploads-apotik-ghanim', imageToDelete);
        fs.unlink(imagePath, (unlinkErr) => {
          if (unlinkErr && unlinkErr.code !== 'ENOENT') {
            console.error('Failed to delete variant image:', unlinkErr);
          }
        });
      }

      res.json({ message: 'Variant deleted successfully' });
    });
  });
});

// News Categories Routes
app.get('/api/news-categories', (req, res) => {
  const query = 'SELECT * FROM news_categories ORDER BY name ASC';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching news categories' });
    }
    res.json(results);
  });
});

app.post('/api/news-categories', verifyToken, (req, res) => {
  const { name, description } = req.body;
  
  const query = 'INSERT INTO news_categories (name, description) VALUES (?, ?)';
  db.query(query, [name, description || ''], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating news category' });
    }
    
    res.status(201).json({
      id: result.insertId,
      message: 'News category created successfully'
    });
  });
});

app.put('/api/news-categories/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  
  const query = 'UPDATE news_categories SET name = ?, description = ? WHERE id = ?';
  db.query(query, [name, description || '', id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating news category' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'News category not found' });
    }
    
    res.json({ message: 'News category updated successfully' });
  });
});

app.delete('/api/news-categories/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM news_categories WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting news category' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'News category not found' });
    }
    
    res.json({ message: 'News category deleted successfully' });
  });
});

// News Routes
app.get('/api/news', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const status = req.query.status || 'published';

  const countQuery = 'SELECT COUNT(*) as total FROM news WHERE status = ?';
  db.query(countQuery, [status], (err, countResult) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching news count' });
    }

    const total = countResult[0].total;

    const newsQuery = `
      SELECT n.*, nc.name as category_name 
      FROM news n 
      LEFT JOIN news_categories nc ON n.category_id = nc.id 
      WHERE n.status = ? 
      ORDER BY n.created_at DESC 
      LIMIT ? OFFSET ?
    `;
    db.query(newsQuery, [status, limit, offset], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching news' });
      }

      res.json({
        news: results,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit)
      });
    });
  });
});

app.get('/api/news/:slug', (req, res) => {
  const { slug } = req.params;
  
  const query = `
    SELECT n.*, nc.name as category_name 
    FROM news n 
    LEFT JOIN news_categories nc ON n.category_id = nc.id 
    WHERE n.slug = ?
  `;
  db.query(query, [slug], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching news' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json(results[0]);
  });
});

app.post('/api/news', verifyToken, upload.single('image'), (req, res) => {
  const { title, slug, description, category_id, author, status } = req.body;
  const image = req.file ? req.file.filename : null;

  // Generate slug if not provided
  const finalSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  const query = `
    INSERT INTO news (title, slug, description, category_id, image, author, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [title, finalSlug, description, category_id, image, author, status], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating news' });
    }

    res.status(201).json({ 
      id: result.insertId, 
      message: 'News created successfully' 
    });
  });
});

app.put('/api/news/:id', verifyToken, upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { title, slug, description, category_id, author, status } = req.body;

  if (req.file) {
    const newImage = req.file.filename;
    const getOldImageQuery = 'SELECT image FROM news WHERE id = ?';

    db.query(getOldImageQuery, [id], (selectErr, selectResults) => {
      if (selectErr) {
        return res.status(500).json({ message: 'Error fetching news' });
      }

      if (selectResults.length === 0) {
        return res.status(404).json({ message: 'News not found' });
      }

      const oldImage = selectResults[0].image;
      const finalSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      
      const updateQuery = `
        UPDATE news 
        SET title = ?, slug = ?, description = ?, category_id = ?, image = ?, author = ?, status = ? 
        WHERE id = ?
      `;
      const updateParams = [title, finalSlug, description, category_id, newImage, author, status, id];

      db.query(updateQuery, updateParams, (updateErr, updateResult) => {
        if (updateErr) {
          return res.status(500).json({ message: 'Error updating news' });
        }

        if (updateResult.affectedRows === 0) {
          return res.status(404).json({ message: 'News not found' });
        }

        if (oldImage && oldImage !== newImage) {
          const oldImagePath = path.join('uploads-apotik-ghanim', oldImage);
          fs.unlink(oldImagePath, (unlinkErr) => {
            if (unlinkErr && unlinkErr.code !== 'ENOENT') {
              console.error('Failed to delete old image:', unlinkErr);
            }
          });
        }

        res.json({ message: 'News updated successfully' });
      });
    });
  } else {
    const finalSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    
    const query = `
      UPDATE news 
      SET title = ?, slug = ?, description = ?, category_id = ?, author = ?, status = ? 
      WHERE id = ?
    `;
    const params = [title, finalSlug, description, category_id, author, status, id];

    db.query(query, params, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating news' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'News not found' });
      }

      res.json({ message: 'News updated successfully' });
    });
  }
});

app.delete('/api/news/:id', verifyToken, (req, res) => {
  const { id } = req.params;

  const getImageQuery = 'SELECT image FROM news WHERE id = ?';
  db.query(getImageQuery, [id], (selectErr, selectResults) => {
    if (selectErr) {
      return res.status(500).json({ message: 'Error fetching news' });
    }

    if (selectResults.length === 0) {
      return res.status(404).json({ message: 'News not found' });
    }

    const imageToDelete = selectResults[0].image;

    const deleteQuery = 'DELETE FROM news WHERE id = ?';
    db.query(deleteQuery, [id], (deleteErr, deleteResult) => {
      if (deleteErr) {
        return res.status(500).json({ message: 'Error deleting news' });
      }

      if (deleteResult.affectedRows === 0) {
        return res.status(404).json({ message: 'News not found' });
      }

      if (imageToDelete) {
        const imagePath = path.join('uploads-apotik-ghanim', imageToDelete);
        fs.unlink(imagePath, (unlinkErr) => {
          if (unlinkErr && unlinkErr.code !== 'ENOENT') {
            console.error('Failed to delete news image:', unlinkErr);
          }
        });
      }

      res.json({ message: 'News deleted successfully' });
    });
  });
});

// Payment Methods Routes
app.get('/api/payment-methods', (req, res) => {
  const query = 'SELECT * FROM payment_methods WHERE is_active = TRUE ORDER BY display_order ASC, id ASC';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching payment methods' });
    }
    res.json(results);
  });
});

app.get('/api/payment-methods/admin/all', verifyToken, (req, res) => {
  const query = 'SELECT * FROM payment_methods ORDER BY display_order ASC, id ASC';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching payment methods' });
    }
    res.json(results);
  });
});

app.post('/api/payment-methods', verifyToken, upload.single('qris_image'), (req, res) => {
  const { type, bank_name, account_name, account_number, is_active, display_order } = req.body;
  const qris_image = req.file ? req.file.filename : null;

  if (type === 'qris' && !qris_image) {
    return res.status(400).json({ message: 'QRIS image is required for QRIS type' });
  }

  if (type === 'bank' && (!bank_name || !account_name || !account_number)) {
    return res.status(400).json({ message: 'Bank name, account name, and account number are required for bank type' });
  }

  const query = `
    INSERT INTO payment_methods (type, qris_image, bank_name, account_name, account_number, is_active, display_order) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [type, qris_image, bank_name, account_name, account_number, is_active === 'true' || is_active === true ? 1 : 0, display_order || 0], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating payment method' });
    }

    res.status(201).json({
      id: result.insertId,
      message: 'Payment method created successfully'
    });
  });
});

app.put('/api/payment-methods/:id', verifyToken, upload.single('qris_image'), (req, res) => {
  const { id } = req.params;
  const { type, bank_name, account_name, account_number, is_active, display_order } = req.body;

  if (type === 'bank' && (!bank_name || !account_name || !account_number)) {
    return res.status(400).json({ message: 'Bank name, account name, and account number are required for bank type' });
  }

  if (req.file) {
    const newImage = req.file.filename;
    const getOldImageQuery = 'SELECT qris_image FROM payment_methods WHERE id = ?';

    db.query(getOldImageQuery, [id], (selectErr, selectResults) => {
      if (selectErr) {
        return res.status(500).json({ message: 'Error fetching payment method' });
      }

      if (selectResults.length === 0) {
        return res.status(404).json({ message: 'Payment method not found' });
      }

      const oldImage = selectResults[0].qris_image;
      
      const updateQuery = `
        UPDATE payment_methods 
        SET type = ?, qris_image = ?, bank_name = ?, account_name = ?, account_number = ?, is_active = ?, display_order = ? 
        WHERE id = ?
      `;
      const updateParams = [type, newImage, bank_name, account_name, account_number, is_active === 'true' || is_active === true ? 1 : 0, display_order || 0, id];

      db.query(updateQuery, updateParams, (updateErr, updateResult) => {
        if (updateErr) {
          return res.status(500).json({ message: 'Error updating payment method' });
        }

        if (updateResult.affectedRows === 0) {
          return res.status(404).json({ message: 'Payment method not found' });
        }

        if (oldImage && oldImage !== newImage) {
          const oldImagePath = path.join('uploads-apotik-ghanim', oldImage);
          fs.unlink(oldImagePath, (unlinkErr) => {
            if (unlinkErr && unlinkErr.code !== 'ENOENT') {
              console.error('Failed to delete old image:', unlinkErr);
            }
          });
        }

        res.json({ message: 'Payment method updated successfully' });
      });
    });
  } else {
    const updateQuery = `
      UPDATE payment_methods 
      SET type = ?, bank_name = ?, account_name = ?, account_number = ?, is_active = ?, display_order = ? 
      WHERE id = ?
    `;
    const updateParams = [type, bank_name, account_name, account_number, is_active === 'true' || is_active === true ? 1 : 0, display_order || 0, id];

    db.query(updateQuery, updateParams, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating payment method' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Payment method not found' });
      }

      res.json({ message: 'Payment method updated successfully' });
    });
  }
});

app.delete('/api/payment-methods/:id', verifyToken, (req, res) => {
  const { id } = req.params;

  const getImageQuery = 'SELECT qris_image FROM payment_methods WHERE id = ?';
  db.query(getImageQuery, [id], (selectErr, selectResults) => {
    if (selectErr) {
      return res.status(500).json({ message: 'Error fetching payment method' });
    }

    if (selectResults.length === 0) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    const imageToDelete = selectResults[0].qris_image;

    const deleteQuery = 'DELETE FROM payment_methods WHERE id = ?';
    db.query(deleteQuery, [id], (deleteErr, deleteResult) => {
      if (deleteErr) {
        return res.status(500).json({ message: 'Error deleting payment method' });
      }

      if (deleteResult.affectedRows === 0) {
        return res.status(404).json({ message: 'Payment method not found' });
      }

      if (imageToDelete) {
        const imagePath = path.join('uploads-apotik-ghanim', imageToDelete);
        fs.unlink(imagePath, (unlinkErr) => {
          if (unlinkErr && unlinkErr.code !== 'ENOENT') {
            console.error('Failed to delete payment method image:', unlinkErr);
          }
        });
      }

      res.json({ message: 'Payment method deleted successfully' });
    });
  });
});

// Orders Routes
app.post('/api/orders', (req, res) => {
  const { order_id, buyer_name, buyer_address, buyer_phone, payment_method_id, items_total } = req.body;

  const query = `
    INSERT INTO orders (order_id, buyer_name, buyer_address, buyer_phone, payment_method_id, items_total) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [order_id, buyer_name, buyer_address, buyer_phone, payment_method_id, items_total], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating order' });
    }

    res.status(201).json({
      id: result.insertId,
      message: 'Order created successfully'
    });
  });
});

// Contact Routes
app.post('/api/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  const query = 'INSERT INTO messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [name, email, phone, subject, message], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error sending message' });
    }

    res.status(201).json({ 
      message: 'Message sent successfully',
      id: result.insertId
    });
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large' });
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({ message: 'Only image files are allowed' });
  }

  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;