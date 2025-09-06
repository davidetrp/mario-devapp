const express = require('express');
const pool = require('../db');

const router = express.Router();

// Get all services with optional search and filters
router.get('/', async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, rating } = req.query;
    
    let query = `
      SELECT s.*, u.username as seller_username, u.avatar as seller_avatar 
      FROM services s 
      JOIN users u ON s.seller_id = u.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    // Search query
    if (q) {
      paramCount++;
      query += ` AND (s.title ILIKE $${paramCount} OR s.description ILIKE $${paramCount} OR s.category ILIKE $${paramCount})`;
      params.push(`%${q}%`);
    }

    // Category filter
    if (category) {
      paramCount++;
      query += ` AND s.category ILIKE $${paramCount}`;
      params.push(category);
    }

    // Price filters
    if (minPrice) {
      paramCount++;
      query += ` AND s.price >= $${paramCount}`;
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      paramCount++;
      query += ` AND s.price <= $${paramCount}`;
      params.push(parseFloat(maxPrice));
    }

    // Rating filter
    if (rating) {
      paramCount++;
      query += ` AND s.rating >= $${paramCount}`;
      params.push(parseFloat(rating));
    }

    query += ' ORDER BY s.created_at DESC';

    const result = await pool.query(query, params);

    // Transform data to match frontend format
    const services = result.rows.map(row => ({
      id: row.id.toString(),
      title: row.title,
      description: row.description,
      price: parseFloat(row.price),
      image: row.image,
      category: row.category,
      seller: {
        username: row.seller_username,
        avatar: row.seller_avatar,
        rating: parseFloat(row.rating)
      },
      rating: parseFloat(row.rating),
      reviews: row.reviews_count
    }));

    res.json({
      success: true,
      data: services
    });

  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get single service
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT s.*, u.username as seller_username, u.avatar as seller_avatar 
       FROM services s 
       JOIN users u ON s.seller_id = u.id 
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    const row = result.rows[0];
    const service = {
      id: row.id.toString(),
      title: row.title,
      description: row.description,
      price: parseFloat(row.price),
      image: row.image,
      category: row.category,
      seller: {
        username: row.seller_username,
        avatar: row.seller_avatar,
        rating: parseFloat(row.rating)
      },
      rating: parseFloat(row.rating),
      reviews: row.reviews_count
    };

    res.json({
      success: true,
      data: service
    });

  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create service (protected route)
router.post('/', async (req, res) => {
  try {
    // TODO: Add authentication middleware
    const { title, description, price, image, category } = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, price, and category are required'
      });
    }

    // For now, use first user as seller (in real app, get from JWT token)
    const sellerId = 1;

    const result = await pool.query(
      'INSERT INTO services (title, description, price, image, category, seller_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, price, image || '', category, sellerId]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update service (protected route)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, image, category } = req.body;

    const result = await pool.query(
      'UPDATE services SET title = $1, description = $2, price = $3, image = $4, category = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [title, description, price, image, category, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete service (protected route)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM services WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: { message: 'Service deleted successfully' }
    });

  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;