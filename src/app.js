// import express from 'express';
// import cors from 'cors';
// import cookieParser from "cookie-parser";
// import helmet from 'helmet';
// import morgan from 'morgan';

// import adminRoutes from '../src/routes/adminRoutes.js';
// import userRoutes from '../src/routes/userRoutes.js';
// import individualProfileRoutes from '../src/routes/individualProfileRoutes.js';
// import corporateProfileRoutes from '../src/routes/corporateProfileRoutes.js';
// import riskManagementRoutes from '../src/routes/riskManagementRoutes.js';
// import dropdownOptionsRoutes from '../src/routes/dropdownOptionsRoutes.js';
// import errorHandler from "./middleware/errorHandler.js";
// const app = express();


// // const corsOptions = {
// //   origin: [
// //     "http://localhost:5173",
// //     "https://eloquent-queijadas-4c6983.netlify.app",
// //   ],
// //   credentials: true,
// //   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
// //   allowedHeaders: ["Content-Type", "Authorization"],
// // };

// const corsOptions = {
//   origin: (origin, callback) => {
//     if (!origin) return callback(null, true);

//     const allowedOrigins = [
//       "http://localhost:5173",
//       "https://eloquent-queijadas-4c6983.netlify.app",
//     ];

//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }

//     return callback(new Error("Not allowed by CORS"));
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: [
//     "Content-Type",
//     "Authorization",
//     "X-Requested-With" // 🔥 THIS FIXES IT
//   ],
// };


// app.use(cors(corsOptions));
// app.options("*", cors(corsOptions)); // 🔥 CRITICAL

// app.use(helmet());
// app.use(morgan("combined"));

// // Middleware
// app.use(express.json());
// app.use(cookieParser());




// // Routes
// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });

// app.use('/admin', adminRoutes);
// app.use('/user', userRoutes);
// app.use('/individual-profile', individualProfileRoutes);
// app.use('/corporate-profile', corporateProfileRoutes);
// app.use('/risk-management', riskManagementRoutes);
// app.use('/dropdown-options', dropdownOptionsRoutes);

// app.use(errorHandler);

// export default app;




import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";

import adminRoutes from "../src/routes/adminRoutes.js";
import userRoutes from "../src/routes/userRoutes.js";
import individualProfileRoutes from "../src/routes/individualProfileRoutes.js";
import corporateProfileRoutes from "../src/routes/corporateProfileRoutes.js";
import riskManagementRoutes from "../src/routes/riskManagementRoutes.js";
import dropdownOptionsRoutes from "../src/routes/dropdownOptionsRoutes.js";
import searchHistoryRoutes from "../src/routes/searchHistoryRoutes.js";
import dashboardRoutes from "../src/routes/dashboardRoutes.js";
import rbacRoutes from "../src/routes/rbacRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

/* ======================================================
   CORS CONFIG (STABLE + COOKIE SAFE)
====================================================== */
const allowedOrigins = [
  "http://localhost:5173",
  "https://eloquent-queijadas-4c6983.netlify.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, Postman, mobile apps
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true, // 🔥 REQUIRED FOR COOKIES
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
  ],
};

/* ======================================================
   MIDDLEWARE ORDER (VERY IMPORTANT)
====================================================== */
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // 🔥 Required for preflight

app.use(helmet());
app.use(morgan("combined"));

app.use(express.json());
app.use(cookieParser());

/* ======================================================
   ROUTES
====================================================== */

// Health check endpoint for deployment platforms
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    message: "Server is healthy and running"
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/individual-profile", individualProfileRoutes);
app.use("/corporate-profile", corporateProfileRoutes);
app.use("/risk-management", riskManagementRoutes);
app.use("/dropdown-options", dropdownOptionsRoutes);
app.use("/search-history", searchHistoryRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/rbac", rbacRoutes);

/* ======================================================
   ERROR HANDLER (LAST)
====================================================== */
app.use(errorHandler);

export default app;
