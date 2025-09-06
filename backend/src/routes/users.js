const express = require('express');
const pool = require('../db');

const router = express.Router();

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    // TODO: Add authentication middleware to get user ID from JWT
    const { username, email } = req.body;
    const userId = 1; // Placeholder - should come from JWT token

    const result = await pool.query(
      'UPDATE users SET username = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, email, username, avatar',
      [username, email, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Upload avatar (placeholder)
router.post('/avatar', async (req, res) => {
  try {
    // TODO: Implement file upload with multer
    res.json({
      success: true,
      data: { url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=updated' }
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;