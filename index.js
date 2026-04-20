const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Serve static files from the 'dist' directory
// Note: Vite builds the project into the 'dist' folder by default
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing - send all requests to index.html
// This allows client-side routing (like /login, /dashboard) to work
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
