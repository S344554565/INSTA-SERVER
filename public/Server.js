const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const login = require('tanvir143-api'); 

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Frontend load karne ke liye

let isRunning = false; 
let currentApi = null;

// 1. START SERVER ENDPOINT
app.post('/api/start', upload.single('messageFile'), async (req, res) => {
    if (isRunning) return res.status(400).json({ error: "Server pehle se chal raha hai." });

    const { cookies, threadId, timeDelay, hereName } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: "Message file (.txt) missing hai." });

    const messageContent = fs.readFileSync(file.path, 'utf8');
    const messages = messageContent.split('\n').filter(m => m.trim() !== '');

    if (messages.length === 0) return res.status(400).json({ error: "File khali hai." });

    try {
        currentApi = await login(cookies);
        console.log("✅ Login Successful by MR SURAJ's Tool!");
        
        isRunning = true;
        res.json({ status: "success", message: "Server Started 24/7!" });

        sendMessagesInLoop(currentApi, threadId, messages, parseInt(timeDelay), hereName);

    } catch (err) {
        console.error("❌ Login Failed:", err.message);
        res.status(500).json({ error: "Login failed. Cookies check karein." });
    }
});

// 2. STOP SERVER ENDPOINT
app.post('/api/stop', (req, res) => {
    isRunning = false;
    res.json({ status: "success", message: "Server stopped." });
});

// --- BACKGROUND MESSAGE LOOP ---
async function sendMessagesInLoop(api, threadId, messages, delaySeconds, hereName) {
    let index = 0;
    while (isRunning) {
        const message = messages[index % messages.length]; 
        try {
            await api.sendMessage(`${hereName}\n\n${message}`, threadId);
            console.log(`📤 Sent: "${message}"`);
        } catch (err) {
            console.error("❌ Send Error:", err.message);
        }
        index++;
        await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 MR SURAJ's Panel running on http://localhost:${PORT}`));
