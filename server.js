require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const ordersRouter = require('./routes/orders');
const dashboardRouter = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// Logger middleware for APIs
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Register routes
app.use('/orders', ordersRouter);
app.use('/dashboard', dashboardRouter);

// Base Route
app.get('/', (req, res) => {
    res.json({
        message: "SRI NIRVANA PLAZA - Room Service Order Management API is active",
        databaseMode: db.getMode()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled Server Error:", err);
    res.status(500).json({
        error: "Internal Server Error",
        message: err.message
    });
});

// Async startup
const startServer = async () => {
    try {
        // Connect to Database (MySQL with SQLite automatic fallback)
        await db.connectDb();
        
        // Listen
        app.listen(PORT, () => {
            console.log(`========================================================`);
            console.log(`Server is running on port ${PORT}`);
            console.log(`Database Mode: ${db.getMode().toUpperCase()}`);
            if (db.getMode() === 'sqlite') {
                console.log(`Local SQLite File: ${db.getSqlitePath()}`);
            }
            console.log(`API url: http://localhost:${PORT}`);
            console.log(`========================================================`);
        });
    } catch (err) {
        console.error("Critical Failure: Server failed to start: " + err.message);
        process.exit(1);
    }
};

startServer();
