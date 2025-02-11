const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();

// Improved CORS Configuration:
const allowedOrigins = [
    'http://localhost:8000', // For local development
    'https://calorie-estimator-frontend.netlify.app', // Your Netlify URL
    'https://www.calorie-estimator-frontend.netlify.app' // Your Netlify URL with www (important!)
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

app.use(express.json({ limit: '50mb' }));

const PAT = "86763a0db675447580417e53c63859d3";
const USER_ID = "clarifai";
const APP_ID = "main";
const MODEL_ID = "food-item-recognition";
const MODEL_VERSION_ID = "1d5fd481e0cf4826aa72ec3ff049e044";

app.post("/identify-food", async (req, res) => {
    console.log("Request received at /identify-food");
    // console.log("Request body (truncated):", JSON.stringify(req.body).slice(0, 200) + "..."); // Only for debugging
    // console.log("PAT:", PAT); // Only for debugging

    const clarifaiURL = `https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`;
    // console.log("Clarifai URL:", clarifaiURL); // Only for debugging

    try {
        const response = await axios.post(
            clarifaiURL,
            {
                user_app_id: { user_id: USER_ID, app_id: APP_ID },
                inputs: [{ data: { image: { base64: req.body.image } } }],
            },
            {
                headers: {
                    Authorization: `Key ${PAT}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // console.log("Clarifai Response Status:", response.status); // Only for debugging
        // console.log("Clarifai Response Data (truncated):", JSON.stringify(response.data).slice(0, 500) + "..."); // Only for debugging

        res.json(response.data);
    } catch (error) {
        console.error("Clarifai API Error:", error);
        if (error.response) {
            console.error("Clarifai Error Response Data:", error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            console.error("Full Error Object:", error); // Log the full error for debugging
            res.status(500).json({ error: error.message });
        }
    }
});

app.get('/', (req, res) => {
    res.send("Welcome to the Calorie Estimator Backend!");
});

// Use environment variable for port or default to 5000:
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
