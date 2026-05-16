const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

// GET /cart - Get all cart items (populated with product details)
router.get('/', async (req, res) => {
  try {
    const cartItems = await Cart.find().populate('productId');
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart items' });
  }
});

// POST /cart - Add item to cart
router.post('/', async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    // Check if item already exists in cart
    const existing = await Cart.findOne({ productId });
    if (existing) {
      existing.quantity += quantity || 1;
      await existing.save();
      const populated = await existing.populate('productId');
      return res.json(populated);
    }

    const cartItem = new Cart({ productId, quantity: quantity || 1 });
    await cartItem.save();
    const populated = await cartItem.populate('productId');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// PUT /cart/:id - Update quantity of a cart item
router.put('/:id', async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const cartItem = await Cart.findByIdAndUpdate(
      req.params.id,
      { quantity },
      { new: true }
    ).populate('productId');

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json(cartItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update quantity' });
  }
});

// DELETE /cart/:id - Remove item from cart
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Cart.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

module.exports = router;
