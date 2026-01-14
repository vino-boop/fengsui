import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support large payloads for images if needed

app.get('/', (req, res) => {
    res.send('AI Feng Shui Master Server is running');
});

app.post('/api/analyze', async (req, res) => {
    try {
        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Server configuration error: API Key missing' });
        }

        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid request format' });
        }

        const response = await fetch(DEEPSEEK_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: messages,
                response_format: { type: "json_object" },
                temperature: 0.6
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('DeepSeek API Error:', response.status, errorText);
            return res.status(response.status).json({ error: `DeepSeek API Error: ${errorText}` });
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Analysis Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
