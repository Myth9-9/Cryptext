const path = require('path');
const express = require('express');
const Gun = require('gun');

const app = express();

// Serve Gun assets and mount the relay
app.use(Gun.serve);

// Serve static assets from the Svelte build
app.use(express.static(path.join(__dirname, 'public')));

// SPA fallback to index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Start the Gun relay bound to the same HTTP server
Gun({ web: server });

