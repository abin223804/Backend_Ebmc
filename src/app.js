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

const allowedOrigins = [
  "http://localhost:5173",
  "https://your-production-frontend.com",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));


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
