import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import helmet from 'helmet';
import morgan from 'morgan';

import adminRoutes from '../src/routes/adminRoutes.js';
import userRoutes from '../src/routes/userRoutes.js';
import individualProfileRoutes from '../src/routes/individualProfileRoutes.js';
import corporateProfileRoutes from '../src/routes/corporateProfileRoutes.js';
import riskManagementRoutes from '../src/routes/riskManagementRoutes.js';
import dropdownOptionsRoutes from '../src/routes/dropdownOptionsRoutes.js';
import errorHandler from "./middleware/errorHandler.js";
const app = express();


const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://eloquent-queijadas-4c6983.netlify.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // 🔥 CRITICAL

app.use(helmet());
app.use(morgan("combined"));

// Middleware
app.use(express.json());
app.use(cookieParser());




// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/individual-profile', individualProfileRoutes);
app.use('/corporate-profile', corporateProfileRoutes);
app.use('/risk-management', riskManagementRoutes);
app.use('/dropdown-options', dropdownOptionsRoutes);

app.use(errorHandler);

export default app;
