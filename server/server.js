import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
// Ensure 'dotenv/config' is at the very top of your main application file
// to load environment variables as early as possible.
import 'dotenv/config';

// Import your configuration and route files
import connectDB from './configs/db.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import { stripeWebhooks } from './controllers/orderController.js'; // Ensure this path is correct

const port = process.env.PORT || 4000;
const app = express();

// --- Global Middleware Configuration ---

// Stripe webhook must be placed *before* express.json()
// because Stripe sends raw JSON, and express.json() would parse it too early,
// preventing Stripe's signature verification.
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// Global middleware to parse JSON request bodies
// This should come after any middleware that needs raw request body (like Stripe webhooks)
app.use(express.json());

// Global middleware to parse cookies from request headers
app.use(cookieParser());

// CORS Configuration
// Specifies which frontend URLs are allowed to make requests to this backend.
// Crucial for security in a cross-origin setup.
const allowedOrigins = [
  'http://localhost:5173',
  'https://greencart-coral.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true // Important for sending/receiving cookies across origins
}));

// --- Database and Cloudinary Connection ---
// Use an IIFE (Immediately Invoked Function Expression) or an async main function
// to handle asynchronous startup operations gracefully.
(async () => {
  try {
    // Attempt to connect to the database
    console.log('Attempting to connect to the database...');
    await connectDB();
    console.log('Database connected successfully!');

    // Attempt to connect to Cloudinary
    console.log('Attempting to connect to Cloudinary...');
    await connectCloudinary();
    console.log('Cloudinary connected successfully!');

    // --- Routes ---
    // Define your API routes after successful database and Cloudinary connections.
    app.get('/', (req, res) => {
      res.send("API WORKING");
    });

    app.use('/api/user', userRouter);
    app.use('/api/seller', sellerRouter);
    app.use('/api/product', productRouter);
    app.use('/api/cart', cartRouter);
    app.use('/api/address', addressRouter);
    app.use('/api/order', orderRouter);

    // --- Server Start ---
    // Only start the server if all critical services (DB, Cloudinary) are connected.
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
      console.log(`Allowed origins for CORS: ${allowedOrigins.join(', ')}`);
    });

  } catch (error) {
    // If any connection fails, log the error and exit the process.
    // This prevents the server from running in a potentially broken state.
    console.error('SERVER STARTUP ERROR: Failed to connect to critical services:', error);
    process.exit(1); // Exit the process with a failure code
  }
})();

// --- Global Error Handling Middleware ---
// This middleware catches any errors that occur in your routes or other middleware
// and sends a generic error response. Place it last.
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the stack trace for debugging
  res.status(500).send('Something broke!');
});
