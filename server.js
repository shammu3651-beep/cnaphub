require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const truecallerjs = require('truecallerjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public')); 

// Securely fetching tokens from environment variables
const searchData = {
    key: process.env.TRUECALLER_KEY,
    installationId: process.env.TRUECALLER_INSTALLATION_ID
};

app.get('/api/callerid', async (req, res) => {
    const number = req.query.number;
    
    if (!number) {
        return res.status(400).json({ status: "error", message: "Number is required" });
    }

    // Checking if credentials exist
    if (!searchData.key || !searchData.installationId) {
        console.error("Missing API Credentials in environment variables!");
        return res.status(500).json({ status: "error", message: "Server Configuration Error" });
    }

    try {
        const response = await truecallerjs.search(searchData, "IN", number);
        const data = response.json();

        if (data && data.data && data.data.length > 0) {
            const result = data.data[0];
            res.json({
                status: "success",
                name: result.name || "Unknown",
                number: number,
                carrier: result.phones && result.phones.length > 0 ? result.phones[0].carrier : "Unknown",
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

app.listen(PORT, () => {
    console.log(`🚀 OSINT API Server running at http://localhost:${PORT}`);
});
