const express = require('express');
const cors = require('cors');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();

// ============== MIDDLEWARE ==============
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ============== CONFIGURATION ==============
const PORT = process.env.PORT || 3000;
const OWNER_NUMBER = process.env.OWNER_NUMBER || '256759590343@c.us';
const BOT_NAME = process.env.BOT_NAME || 'ShacksTech MD';

// ============== DATABASE ==============
const database = {
  users: new Map(),
  bots: new Map(),
  logs: []
};

// ============== WHATSAPP CLIENT ==============
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox']
  }
});

let qrCodeData = null;
let clientReady = false;

client.on('qr', async (qr) => {
  qrCodeData = await qrcode.toDataURL(qr);
  console.log('QR Code generated');
});

client.on('ready', () => {
  clientReady = true;
  console.log('✅ WhatsApp Client Ready');
  addLog('[INFO] WhatsApp client connected');
});

client.on('message', async (message) => {
  // Handle incoming messages
  try {
    console.log('📨 Message received:', message.body);
  } catch (error) {
    console.error('Error handling message:', error);
  }
});

// ============== API ENDPOINTS ==============

// Get QR Code
app.get('/api/qrcode', (req, res) => {
  if (qrCodeData) {
    res.json({ success: true, qrcode: qrCodeData });
  } else {
    res.json({ success: false, message: 'QR code not available' });
  }
});

// Get Bot Status
app.get('/api/status', (req, res) => {
  res.json({
    bot: BOT_NAME,
    status: clientReady ? 'online' : 'offline',
    owner: OWNER_NUMBER,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Deploy Bot
app.post('/api/deploy', (req, res) => {
  try {
    const { botName, owner, prefix, mode, timezone } = req.body;

    const botConfig = {
      id: Date.now(),
      name: botName,
      owner,
      prefix,
      mode,
      timezone,
      deployedAt: new Date().toISOString(),
      status: 'active'
    };

    database.bots.set(botConfig.id, botConfig);
    addLog(`[DEPLOY] Bot "${botName}" deployed successfully`);

    res.json({ success: true, bot: botConfig });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate Pairing Code
app.post('/api/generate-pairing', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Validate phone number
    if (!phoneNumber || phoneNumber.length < 10) {
      return res.json({ success: false, message: 'Invalid phone number' });
    }

    // Generate pairing code
    const pairingCode = Math.floor(100000 + Math.random() * 900000).toString();
    const formattedCode = pairingCode.slice(0, 3) + '-' + pairingCode.slice(3);

    addLog(`[LINK] Pairing code generated for ${phoneNumber}`);

    res.json({
      success: true,
      pairingCode: formattedCode,
      expiresIn: 240, // 4 minutes
      phoneNumber
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify WhatsApp Number
app.post('/api/verify-whatsapp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Simulate verification
    const isValid = /^[0-9]{10,15}$/.test(phoneNumber.replace(/[^0-9]/g, ''));

    addLog(`[VERIFY] WhatsApp number ${phoneNumber} - ${isValid ? 'Valid' : 'Invalid'}`);

    res.json({ success: true, isValid, phoneNumber });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Logs
app.get('/api/logs', (req, res) => {
  res.json({ logs: database.logs.slice(-100) }); // Last 100 logs
});

// ============== LOGGING ==============
function addLog(message) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    message
  };
  database.logs.push(logEntry);
  console.log(logEntry.message);
}

// ============== ERROR HANDLING ==============
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  addLog(`[ERROR] ${error.message}`);
});

// ============== SERVER START ==============
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║    🤖 ShacksTech MD Server Started     ║
║    ================================     ║
║    Listening on: http://localhost:${PORT}  ║
║    Status: Ready                       ║
║    Owner: SHACKS TECH                 ║
║    Country: Uganda 🇺🇬                 ║
╚════════════════════════════════════════╝
  `);
  addLog('[INFO] Server started successfully');
  client.initialize();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

module.exports = app;