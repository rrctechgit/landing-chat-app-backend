const express = require('express');
const cors = require('cors');
const path = require('path');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

app.use('/api', chatRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

module.exports = app;
