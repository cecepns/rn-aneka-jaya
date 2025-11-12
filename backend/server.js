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

  // Get total count
  const countQuery = 'SELECT COUNT(*) as total FROM products';
  db.query(countQuery, (err, countResult) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching product count' });
    }

    const total = countResult[0].total;

    // Get products with pagination
    const productsQuery = 'SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?';
    db.query(productsQuery, [limit, offset], (err, results) => {
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
        about_us: 'Gudang Pakan RN Aneka Jaya adalah supplier pakan ternak dan ikan berkualitas terpercaya yang menyediakan berbagai macam pakan unggas, ikan, suplemen, dan perlengkapan peternakan dengan harga kompetitif.'
      });
    }

    res.json(results[0]);
  });
});

app.put('/api/settings', verifyToken, (req, res) => {
  const { address, phone, maps_url, operating_hours, about_us } = req.body;

  // Check if settings exist
  const checkQuery = 'SELECT id FROM settings ORDER BY id DESC LIMIT 1';
  db.query(checkQuery, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error checking settings' });
    }

    if (results.length === 0) {
      // Insert new settings
      const insertQuery = 'INSERT INTO settings (address, phone, maps_url, operating_hours, about_us) VALUES (?, ?, ?, ?, ?)';
      db.query(insertQuery, [address, phone, maps_url, operating_hours, about_us], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error creating settings' });
        }
        res.json({ message: 'Settings created successfully' });
      });
    } else {
      // Update existing settings
      const updateQuery = 'UPDATE settings SET address = ?, phone = ?, maps_url = ?, operating_hours = ?, about_us = ? WHERE id = ?';
      db.query(updateQuery, [address, phone, maps_url, operating_hours, about_us, results[0].id], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error updating settings' });
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