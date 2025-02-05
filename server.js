const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();

// Improved CORS Configuration:
const allowedOrigins = ['http://localhost:8000', 'null', 'https://calorie-estimator-frontend.netlify.app']; // Add other origins if needed

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) { // Allow requests with no origin (like Postman)
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
    console.log("Request body (truncated):", JSON.stringify(req.body).slice(0, 200) + "..."); // Truncate for large bodies
    console.log("PAT:", PAT);

    const clarifaiURL = `https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`; // Correct URL
    console.log("Clarifai URL:", clarifaiURL); // Log the URL!

    try {
        const response = await axios.post(
            clarifaiURL, // Use the correctly constructed URL variable
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

        console.log("Clarifai Response Status:", response.status);
        console.log("Clarifai Response Data (truncated):", JSON.stringify(response.data).slice(0, 500) + "...");

        res.json(response.data);
    } catch (error) {
        console.error("Clarifai API Error:", error);
        if (error.response) {
            console.error("Clarifai Error Response Data:", error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

app.get('/', (req, res) => {  // Add this root route handler
    res.send("Welcome to the Calorie Estimator Backend!"); 
});

app.listen(5000, () => console.log("Server running on port 5000"));
