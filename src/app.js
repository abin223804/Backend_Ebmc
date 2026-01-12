import express from 'express';
import cookieParser from "cookie-parser";
import adminRoutes from '../src/routes/adminRoutes.js';
import userRoutes from '../src/routes/userRoutes.js';
import errorHandler from "./middleware/errorHandler.js";
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

app.use(errorHandler);

export default app;
