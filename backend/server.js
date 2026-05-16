const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// -----------comment these if using 2 separate VMs (backend VM + frontend VM)
// If using 1 VM: uncomment these AND run 'npm run build' in frontend first
// NOTE: Vite builds to 'dist/', NOT 'build/' like CRA


app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});
//-----------------------------
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected successfully');

    const Product = require('./models/Product');
    await Product.deleteMany({});
    await Product.insertMany([
      {
        name: 'Wireless Bluetooth Headphones',
        price: 2499,
        description: 'Premium over-ear headphones with noise cancellation and 30hr battery life.',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
      },
      {
        name: 'Mechanical Keyboard',
        price: 3999,
        description: 'RGB backlit mechanical keyboard with tactile switches, perfect for gaming and coding.',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop',
      },
      {
        name: 'USB-C Hub 7-in-1',
        price: 1299,
        description: 'Multiport adapter with HDMI, USB 3.0, SD card reader, and Power Delivery.',
        image: 'https://images.unsplash.com/photo-1625895197185-efcec01cffe0?w=400&h=300&fit=crop',
      },
      {
        name: 'Portable Power Bank 20000mAh',
        price: 1799,
        description: 'Fast-charging power bank with dual USB ports and LED charge indicator.',
        image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop',
      },
      {
        name: 'Webcam 1080p HD',
        price: 2199,
        description: 'Full HD webcam with built-in microphone, auto-focus, and plug-and-play setup.',
        image: 'https://images.unsplash.com/photo-1587826379670-686c781b78e2?w=400&h=300&fit=crop',
      },
      {
        name: 'Mouse Pad XL Gaming',
        price: 599,
        description: 'Extra-large desk mat with non-slip rubber base and smooth fabric surface.',
        image: 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=400&h=300&fit=crop',
      },
      {
        name: 'Wireless Gaming Mouse',
        price: 1899,
        description: 'Ergonomic wireless mouse with 6 programmable buttons and 12000 DPI sensor.',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop',
      },
      {
        name: 'LED Desk Lamp',
        price: 899,
        description: 'Touch-sensitive desk lamp with adjustable brightness, USB charging port, and eye-care mode.',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop',
      },
      {
        name: 'Laptop Stand Adjustable',
        price: 1199,
        description: 'Foldable aluminium laptop stand with adjustable height, improves posture and airflow.',
        image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=300&fit=crop',
      },
      {
        name: 'Smart Fitness Band',
        price: 2999,
        description: 'Fitness tracker with heart rate monitor, sleep tracking, and 10-day battery life.',
        image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&h=300&fit=crop',
      },
    ]);
    console.log('10 sample products seeded successfully');

    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });