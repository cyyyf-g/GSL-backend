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
app.get('(.*)', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        const rootFiles = fs.readdirSync(__dirname);
        res.status(404).send(`
            <h1>GSL Portal - Deployment Error</h1>
            <p><strong>Error:</strong> index.html not found at <code>${indexPath}</code></p>
            <p>Check if your Build Command (<code>npm run build</code>) is running successfully.</p>
            <hr>
            <h3>Files found at root:</h3>
            <ul>${rootFiles.map(f => `<li>${f}</li>`).join('')}</ul>
        `);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
