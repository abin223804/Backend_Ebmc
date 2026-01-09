import express from 'express';
import adminRoutes from '../src/routes/adminRoutes.js';
const app = express();

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/users', adminRoutes);

export default app;
