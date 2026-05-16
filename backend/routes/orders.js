const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// POST /orders - Place an order (clears the cart after placing)
router.post('/', async (req, res) => {
  try {
    const { items, totalAmount, address, mobile, paymentDone } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must have at least one item' });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ error: 'Invalid total amount' });
    }
    
    if (!address || !mobile || paymentDone === undefined) {
      return res.status(400).json({ error: 'Missing checkout details' });
    }

    const order = new Order({ items, totalAmount, address, mobile, paymentDone });
    await order.save();

    // Clear the cart after placing order
    await Cart.deleteMany({});

    res.status(201).json({ message: 'Order placed successfully!', order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// GET /orders - Get all orders (optional, for reference)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;
