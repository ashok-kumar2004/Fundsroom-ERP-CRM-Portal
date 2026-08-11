import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import productRoutes from './routes/product.routes';
import challanRoutes from './routes/challan.routes';
import dashboardRoutes from './routes/dashboard.routes';

dotenv.config();

const app = express();

// Production-Safe CORS Configuration
const allowedOrigins = process.env.FRONTEND_URL || process.env.CORS_ORIGIN;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman) or matching frontend URL
      if (!origin || !allowedOrigins || allowedOrigins === '*' || allowedOrigins.split(',').includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS Policy: Request from origin '${origin}' blocked.`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/challans', challanRoutes);
app.use('/dashboard', dashboardRoutes);

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
