import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import adminRoutes from '../src/routes/adminRoutes.js';
import userRoutes from '../src/routes/userRoutes.js';
import individualProfileRoutes from '../src/routes/individualProfileRoutes.js';
import corporateProfileRoutes from '../src/routes/corporateProfileRoutes.js';
import errorHandler from "./middleware/errorHandler.js";
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(cors());

// Routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/individual-profile', individualProfileRoutes);
app.use('/corporate-profile', corporateProfileRoutes);

app.use(errorHandler);

export default app;
