import express from 'express';
import userRoutes from './routes/userRoutes.js';
const app = express();

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/users', userRoutes);

export default app;
