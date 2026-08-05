const express = require('express');
const cors = require('cors');
const truecallerjs = require('truecallerjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public')); // Frontend folder ko serve karne ke liye

// ⚠️ IMPORTANT: Yahan apne generated tokens daalo
const searchData = {
    key: "YOUR_BEARER_TOKEN_HERE",
    installationId: "YOUR_INSTALLATION_ID_HERE"
};

// API Endpoint
app.get('/api/callerid', async (req, res) => {
    const number = req.query.number;
    
    if (!number) {
        return res.status(400).json({ status: "error", message: "Number is required" });
    }

    try {
        // Search logic using truecallerjs
        const response = await truecallerjs.search(searchData, "IN", number);
        const data = response.json();

        if (data && data.data && data.data.length > 0) {
            const result = data.data[0];
            res.json({
                status: "success",
                name: result.name || "Unknown",
                number: number,
                carrier: result.phones[0].carrier || "Unknown",
                email: result.internetAddresses && result.internetAddresses.length > 0 ? result.internetAddresses[0].id : "Not Found"
            });
        } else {
            res.status(404).json({ status: "error", message: "No records found for this number" });
        }
    } catch (error) {
        console.error("Lookup Error:", error);
        res.status(500).json({ status: "error", message: "Internal API Error" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 OSINT API Server running at http://localhost:${PORT}`);
});
