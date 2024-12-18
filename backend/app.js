const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');
const analyticsRoutes = require('./routes/analytics');
const charactersRoutes = require('./routes/characters');
const equipmentRoutes = require('./routes/equipment');

const app = express();

mongoose.connect(
    'mongodb+srv://davidcalderwood5:' +
    process.env.MONGO_ATLAS_PW +
    '@cluster0.3fnx6.mongodb.net/&w=majority&appName=Cluster0'
)
    .then(() => {
        console.log('Connected to database!');
    })
    .catch(() => {
        console.log('Connection FAILED');
    });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/images', express.static(path.join('backend/images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-Width, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    next();
});

app.use('/api/posts', postsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/characters', charactersRoutes);
app.use('/api/equipment', equipmentRoutes);

module.exports = app;