const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Serve static files from the 'dist' directory
const distPath = path.join(__dirname, 'dist');

// Debugging: Log directory structure to help solve Render ENOENT issues
console.log('Current directory:', __dirname);
const fs = require('fs');
if (fs.existsSync(distPath)) {
    console.log('✅ Found dist folder');
    console.log('Dist contents:', fs.readdirSync(distPath));
} else {
    console.error('❌ dist folder MISSING at:', distPath);
    console.log('Current folder contents:', fs.readdirSync(__dirname));
}

app.use(express.static(distPath));

// Handle SPA routing - send all requests to index.html
// This allows client-side routing (like /login, /dashboard) to work
app.get('*all', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send(`Error: index.html not found. Check if the build command created the 'dist' folder. Path tried: ${indexPath}`);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
