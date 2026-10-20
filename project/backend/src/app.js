const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const errorHandler = require('./shared/middleware/error-handler.middleware');
const config = require('./shared/config/environment');

const { globalLimiter } = require('./shared/middleware/rate-limit.middleware');


const app = express();

// Hosting platforms (Render, Railway, Heroku) put a proxy in front of the app.
// Without this, req.ip is the proxy's address and the rate limiter treats all users as one.
if (config.env === 'production') {
  app.set('trust proxy', 1);
}

app.use(helmet());
app.use(cors({ origin: config.frontend.url, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: config.env
  });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'Bibliography API v2',
    version: '2.0.0'
  });
});

app.use('/api', globalLimiter);


app.use('/api/auth', require('./features/auth/auth.routes'));
app.use('/api/labels', require('./features/labels/labels.routes')); 
app.use('/api/items', require('./features/items/items.routes')); 
app.use('/api/collections', require('./features/collections/collections.routes'));
app.use('/api/item-labels', require('./features/items-labels/item-labels.routes'));
app.use('/api/metadata', require('./features/metadata/metadata.routes'));
app.use('/api/export', require('./features/export/export.routes'));
app.use('/api/collection-sharing', require('./features/collection-sharing/collection-sharing.routes'));
app.use('/api/workspaces', require('./features/workspaces/workspace.routes'));
app.use('/api/comments', require('./features/comments/comments.routes'));
app.use('/api/history', require('./features/history/history.routes'));
app.use('/api/citations', require('./features/citations/citation.routes'));

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;