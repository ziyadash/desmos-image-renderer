const express = require('express');
const fs = require('fs');
const potrace = require('potrace');
const path = require('path'); // For file path handling
const parseSVG = require('svg-path-parser'); // Ensure this is installed: npm install svg-path-parser

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' })); // Handle large Base64 payloads

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// serve the uploaded image
app.use('/uploaded_src_image.png', express.static(path.join(__dirname, 'uploaded_src_image.png')));

// Endpoint: Upload Image
app.post('/upload-image', (req, res) => {
    try {
        if (!req.body.image) {
            return res.status(400).json({ error: "No image data provided." });
        }

        const base64Image = req.body.image.split(';base64,').pop();
        const tempFilePath = path.join(__dirname, 'uploaded_src_image.png');

        fs.writeFileSync(tempFilePath, Buffer.from(base64Image, 'base64'));
        console.log("File uploaded!");

        res.json({ message: "File uploaded successfully!", filePath: tempFilePath });
    } catch (err) {
        console.error("Error saving file:", err);
        res.status(500).json({ error: "Failed to save image." });
    }
});

// Endpoint: Convert Image to SVG
app.post('/convert-to-svg', (req, res) => {
    try {
        if (!req.body.image) {
            return res.status(400).json({ error: "No image data provided." });
        }

        const base64Image = req.body.image.split(';base64,').pop();
        const tempFilePath = path.join(__dirname, 'temp.png');

        fs.writeFileSync(tempFilePath, Buffer.from(base64Image, 'base64'));

        // Convert PNG to SVG using Potrace
        potrace.trace(tempFilePath, (err, svg) => {
            if (err) {
                console.error('Potrace Error:', err);
                return res.status(500).json({ error: "Error during SVG conversion" });
            }

            try {
                // **Extract the `d` attribute from the SVG**
                const match = svg.match(/d="([^"]+)"/);
                if (!match || match.length < 2) {
                    throw new Error("SVG `d` attribute not found");
                }

                const dAttribute = match[1]; // Extract the `d` attribute
                const dFilePath = path.join(__dirname, 'd_attribute.txt');
                fs.writeFileSync(dFilePath, dAttribute, 'utf8'); // Save `d` attribute
                console.log(`d attribute written to ${dFilePath}`);

                // **Parse the path data**
                const parsedPath = parseSVG(dAttribute);

                // **Respond with parsed SVG data**
                res.json({ svg, parsed: parsedPath });
            } catch (parseErr) {
                console.error('Error extracting/parsing the d attribute:', parseErr.message);
                res.status(500).json({ error: "Error processing SVG data" });
            }
        });
    } catch (err) {
        console.error("Error processing request:", err);
        res.status(500).json({ error: "Unexpected error in processing image." });
    }
});

// Start the server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
