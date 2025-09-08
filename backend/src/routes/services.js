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

// Get single service with full details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get service with seller details
    const serviceResult = await pool.query(
      `SELECT s.*, u.username as seller_username, u.avatar as seller_avatar, 
              u.name as seller_name, u.bio as seller_bio, u.location as seller_location,
              u.phone as seller_phone, u.website as seller_website, u.years_experience
       FROM services s 
       JOIN users u ON s.seller_id = u.id 
       WHERE s.id = $1`,
      [id]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Get service gallery
    const galleryResult = await pool.query(
      'SELECT image_url, caption, display_order FROM service_galleries WHERE service_id = $1 ORDER BY display_order',
      [id]
    );

    // Get service reviews with user details
    const reviewsResult = await pool.query(
      `SELECT r.*, u.username, u.avatar, u.name 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.service_id = $1 
       ORDER BY r.created_at DESC`,
      [id]
    );

    const row = serviceResult.rows[0];
    const service = {
      id: row.id.toString(),
      title: row.title,
      description: row.description,
      price: parseFloat(row.price),
      image: row.image,
      category: row.category,
      rating: parseFloat(row.rating),
      reviews_count: row.reviews_count,
      created_at: row.created_at,
      gallery: galleryResult.rows.map(img => ({
        url: img.image_url,
        caption: img.caption,
        order: img.display_order
      })),
      seller: {
        id: row.seller_id,
        username: row.seller_username,
        name: row.seller_name,
        avatar: row.seller_avatar,
        bio: row.seller_bio,
        location: row.seller_location,
        phone: row.seller_phone,
        website: row.seller_website,
        years_experience: row.years_experience,
        rating: parseFloat(row.rating)
      },
      reviews: reviewsResult.rows.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        user: {
          username: review.username,
          name: review.name,
          avatar: review.avatar
        }
      }))
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

// Get seller profile
router.get('/seller/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Get seller details
    const sellerResult = await pool.query(
      'SELECT id, username, name, avatar, bio, location, phone, website, years_experience, created_at FROM users WHERE username = $1',
      [username]
    );

    if (sellerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Seller not found'
      });
    }

    const seller = sellerResult.rows[0];

    // Get seller's services
    const servicesResult = await pool.query(
      'SELECT * FROM services WHERE seller_id = $1 ORDER BY created_at DESC',
      [seller.id]
    );

    // Get seller's average rating from their services
    const ratingResult = await pool.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as total_services FROM services WHERE seller_id = $1',
      [seller.id]
    );

    // Get total reviews for seller's services
    const reviewsCountResult = await pool.query(
      `SELECT COUNT(*) as total_reviews 
       FROM reviews r 
       JOIN services s ON r.service_id = s.id 
       WHERE s.seller_id = $1`,
      [seller.id]
    );

    const sellerProfile = {
      id: seller.id,
      username: seller.username,
      name: seller.name,
      avatar: seller.avatar,
      bio: seller.bio,
      location: seller.location,
      phone: seller.phone,
      website: seller.website,
      years_experience: seller.years_experience,
      member_since: seller.created_at,
      stats: {
        avg_rating: parseFloat(ratingResult.rows[0].avg_rating || 0),
        total_services: parseInt(ratingResult.rows[0].total_services || 0),
        total_reviews: parseInt(reviewsCountResult.rows[0].total_reviews || 0)
      },
      services: servicesResult.rows.map(service => ({
        id: service.id.toString(),
        title: service.title,
        description: service.description,
        price: parseFloat(service.price),
        image: service.image,
        category: service.category,
        rating: parseFloat(service.rating),
        reviews_count: service.reviews_count
      }))
    };

    res.json({
      success: true,
      data: sellerProfile
    });

  } catch (error) {
    console.error('Get seller profile error:', error);
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