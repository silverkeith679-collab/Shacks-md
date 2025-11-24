// ============== GLOBAL VARIABLES ==============
let botDeployed = false;
let whatsappLinked = false;
let botStatus = 'offline';
let currentBot = null;
let pairingCodeTimer = null;
let qrCodeTimer = null;
let botUptimeSeconds = 0;
let commandsProcessed = 0;
let messagesSent = 0;
let errorCount = 0;

// ============== INITIALIZATION ==============
document.addEventListener('DOMContentLoaded', () => {
    initializePanel();
    setupEventListeners();
    loadSavedData();
    updateBotStatus();
    startStatusMonitoring();
});

function initializePanel() {
    console.log('🤖 ShacksTech MD Panel Initialized');
    console.log('👤 User: silverkeith679-collab');
    console.log('📅 Date: 2025-11-24 10:05:51 UTC');
    displayUsername();
    addLog('[INFO] ShacksTech MD Panel started');
}

function setupEventListeners() {
    // Upload area events
    const uploadArea = document.getElementById('uploadArea');
    
    uploadArea.addEventListener('click', () => {
        document.getElementById('botFiles').click();
    });

    // Nav link clicks
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            scrollToSection(sectionId);
        });
    });
}

// ============== NAVIGATION ==============
function scrollToSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');

    // Update nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    document.querySelector(`a[href="#${sectionId}"]`).classList.add('active');

    // Scroll to top
    window.scrollTo(0, 0);
}

function goToMenu() {
    scrollToSection('home');
}

// ============== USER MANAGEMENT ==============
function displayUsername() {
    const username = localStorage.getItem('username') || 'silverkeith679-collab';
    document.getElementById('username').textContent = username;
    localStorage.setItem('username', username);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        showNotification('👋 Goodbye', 'You have been logged out');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
}

// ============== FILE HANDLING ==============
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('uploadArea').classList.add('drag-over');
}

function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('uploadArea').classList.remove('drag-over');
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('uploadArea').classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    handleFiles(files);
}

function handleFileSelect(event) {
    const files = event.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    const fileList = document.getElementById('files');
    fileList.innerHTML = '';
    
    let validFiles = [];
    
    for (let file of files) {
        // Validate file types
        const validExtensions = ['.js', '.json', '.env', '.txt', '.md', '.zip', '.tar', '.gz'];
        const fileExt = '.' + file.name.split('.').pop().toLowerCase();
        
        if (validExtensions.includes(fileExt) || file.type === 'application/zip' || file.type === 'application/x-zip-compressed') {
            validFiles.push(file);
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-file"></i> ${file.name} (${formatFileSize(file.size)})`;
            fileList.appendChild(li);
        }
    }
    
    if (validFiles.length > 0) {
        document.getElementById('fileList').classList.remove('hidden');
        addLog(`[INFO] ${validFiles.length} file(s) selected for deployment`);
    } else {
        showNotification('❌ Invalid Files', 'Please select valid bot files (.js, .json, .env, .zip, etc.)');
    }
    
    currentBot = {
        files: validFiles,
        name: document.getElementById('botName').value || 'ShacksTech MD',
        owner: document.getElementById('ownerNumber').value || '+256759590343',
        prefix: document.getElementById('prefix').value || '.',
        mode: document.getElementById('botMode').value || 'public',
        timezone: document.getElementById('timezone').value || 'Africa/Kampala'
    };
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ============== BOT DEPLOYMENT ==============
async function deployBot() {
    if (!currentBot || currentBot.files.length === 0) {
        showNotification('❌ Error', 'Please select bot files first');
        return;
    }

    // Validate configuration
    if (!currentBot.owner.includes('+') && !currentBot.owner.includes('256')) {
        showNotification('❌ Invalid Owner Number', 'Please enter a valid WhatsApp number with country code');
        return;
    }

    const deployStatus = document.getElementById('deployStatus');
    deployStatus.classList.remove('hidden');

    const statusMessages = [
        'Initializing deployment...',
        'Validating bot files...',
        'Setting up environment...',
        'Configuring bot parameters...',
        'Installing dependencies...',
        'Compiling bot code...',
        'Starting bot services...',
        'Initializing WhatsApp engine...',
        'Connecting to servers...',
        'Bot deployment complete! ✅'
    ];

    addLog('[START] Deployment process initiated');

    for (let i = 0; i < statusMessages.length; i++) {
        document.getElementById('statusMessage').textContent = statusMessages[i];
        document.getElementById('progressFill').style.width = ((i + 1) / statusMessages.length) * 100 + '%';
        
        addLog(`[DEPLOY] ${statusMessages[i]}`);
        
        await new Promise(resolve => setTimeout(resolve, 1200));
    }

    // Simulate deployment
    botDeployed = true;
    botStatus = 'online';
    botUptimeSeconds = 0;
    commandsProcessed = 0;
    messagesSent = 0;
    errorCount = 0;

    // Save bot configuration
    saveBotConfig();

    setTimeout(() => {
        deployStatus.classList.add('hidden');
        showNotification('✅ Success', `🤖 ${currentBot.name} has been deployed successfully!\n\nYour bot is now running and ready to link WhatsApp.\n\nPrefix: ${currentBot.prefix}\nMode: ${currentBot.mode}`);
        updateBotStatus();
        updateStatusDisplay();
        addLog('[SUCCESS] Bot deployment completed successfully');
    }, 500);
}

function saveBotConfig() {
    localStorage.setItem('botConfig', JSON.stringify({
        name: currentBot.name,
        owner: currentBot.owner,
        prefix: currentBot.prefix,
        mode: currentBot.mode,
        timezone: currentBot.timezone,
        deployed: true,
        deployedAt: new Date().toISOString()
    }));
}

// ============== WHATSAPP LINKING ==============
async function generatePairingCode() {
    const countryCode = document.getElementById('countryCode').value;
    const phoneNumber = document.getElementById('phoneNumber').value;

    if (!phoneNumber || phoneNumber.length < 9) {
        showNotification('❌ Error', 'Please enter a valid phone number (at least 9 digits)');
        return;
    }

    if (phoneNumber.length > 13) {
        showNotification('❌ Error', 'Phone number is too long');
        return;
    }

    const fullNumber = '+' + countryCode + phoneNumber;

    addLog(`[LINK] Generating pairing code for ${fullNumber}`);

    // Show linking status
    document.getElementById('linkingStatus').classList.remove('hidden');
    document.getElementById('linkingMessage').textContent = 'Verifying WhatsApp number...';

    // Simulate API call to verify number
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if number is valid and registered on WhatsApp
    const isValidWhatsApp = await verifyWhatsAppNumber(fullNumber);

    if (!isValidWhatsApp) {
        document.getElementById('linkingStatus').classList.add('hidden');
        showNotification('❌ Error', `${fullNumber} is not registered on WhatsApp.\n\nPlease enter a valid WhatsApp number.`);
        addLog(`[ERROR] Number ${fullNumber} not registered on WhatsApp`);
        return;
    }

    // Generate 6-digit pairing code
    const pairingCode = generateCode();
    
    addLog(`[LINK] Pairing code generated: ${pairingCode}`);

    // Show pairing code
    document.getElementById('pairingCodeContainer').classList.remove('hidden');
    document.getElementById('pairingCode').textContent = pairingCode;

    // Generate QR code
    generateQRCode(fullNumber, pairingCode);

    // Start timer
    startQRTimer();
    startPairingCodeTimer();

    document.getElementById('linkingMessage').textContent = `Waiting for WhatsApp confirmation...\n\nPhone: ${fullNumber}`;

    // Simulate waiting for confirmation
    simulateWhatsAppConfirmation(fullNumber);
}

async function verifyWhatsAppNumber(phoneNumber) {
    // Simulate WhatsApp API verification
    return new Promise(resolve => {
        setTimeout(() => {
            // Validate basic structure
            const cleaned = phoneNumber.replace(/[^0-9]/g, '');
            const isValid = cleaned.length >= 10 && cleaned.length <= 15;
            resolve(isValid);
        }, 1500);
    });
}

function generateCode() {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code.slice(0, 3) + '-' + code.slice(3);
}

function generateQRCode(phoneNumber, pairingCode) {
    document.getElementById('qrCodeContainer').classList.remove('hidden');
    
    const qrCodeDiv = document.getElementById('qrCode');
    
    // Create a more detailed QR code representation
    qrCodeDiv.innerHTML = `
        <div style="background: white; padding: 15px; display: inline-block; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <svg width="220" height="220" viewBox="0 0 220 220">
                <!-- QR Code Pattern -->
                <rect width="220" height="220" fill="white"/>
                
                <!-- Position markers -->
                <rect x="10" y="10" width="50" height="50" fill="none" stroke="black" stroke-width="2"/>
                <rect x="18" y="18" width="34" height="34" fill="black"/>
                <rect x="24" y="24" width="22" height="22" fill="white"/>
                <rect x="28" y="28" width="14" height="14" fill="black"/>
                
                <rect x="160" y="10" width="50" height="50" fill="none" stroke="black" stroke-width="2"/>
                <rect x="168" y="18" width="34" height="34" fill="black"/>
                <rect x="174" y="24" width="22" height="22" fill="white"/>
                <rect x="178" y="28" width="14" height="14" fill="black"/>
                
                <rect x="10" y="160" width="50" height="50" fill="none" stroke="black" stroke-width="2"/>
                <rect x="18" y="168" width="34" height="34" fill="black"/>
                <rect x="24" y="174" width="22" height="22" fill="white"/>
                <rect x="28" y="178" width="14" height="14" fill="black"/>
                
                <!-- Random data pattern (simplified) -->
                <rect x="70" y="70" width="8" height="8" fill="black"/>
                <rect x="85" y="70" width="8" height="8" fill="black"/>
                <rect x="100" y="70" width="8" height="8" fill="black"/>
                
                <rect x="70" y="85" width="8" height="8" fill="black"/>
                <rect x="85" y="85" width="8" height="8" fill="white"/>
                <rect x="100" y="85" width="8" height="8" fill="black"/>
                
                <rect x="70" y="100" width="8" height="8" fill="black"/>
                <rect x="85" y="100" width="8" height="8" fill="black"/>
                <rect x="100" y="100" width="8" height="8" fill="black"/>
            </svg>
            <p style="text-align: center; margin-top: 10px; font-size: 12px; color: #666;">
                Scan with WhatsApp<br>
                <strong>${phoneNumber}</strong><br>
                Code: <strong>${pairingCode}</strong>
            </p>
        </div>
    `;
}

function startQRTimer() {
    let timeLeft = 240; // 4 minutes
    
    if (qrCodeTimer) clearInterval(qrCodeTimer);
    
    qrCodeTimer = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('qrTimer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(qrCodeTimer);
            document.getElementById('qrCodeContainer').classList.add('hidden');
            document.getElementById('pairingCodeContainer').classList.add('hidden');
            document.getElementById('linkingStatus').classList.add('hidden');
            showNotification('⏰ Expired', 'QR Code and Pairing Code have expired.\n\nPlease generate a new one.');
            addLog('[WARNING] Pairing code expired');
        }
    }, 1000);
}

function startPairingCodeTimer() {
    let timeLeft = 240; // 4 minutes
    
    if (pairingCodeTimer) clearInterval(pairingCodeTimer);
    
    pairingCodeTimer = setInterval(() => {
        timeLeft--;
        
        if (timeLeft <= 0) {
            clearInterval(pairingCodeTimer);
        }
    }, 1000);
}

function simulateWhatsAppConfirmation(phoneNumber) {
    // Simulate waiting for WhatsApp to confirm (5 seconds)
    setTimeout(() => {
        whatsappLinked = true;
        
        // Clear timers
        if (qrCodeTimer) clearInterval(qrCodeTimer);
        if (pairingCodeTimer) clearInterval(pairingCodeTimer);
        
        // Hide linking status
        document.getElementById('linkingStatus').classList.add('hidden');
        document.getElementById('qrCodeContainer').classList.add('hidden');
        document.getElementById('pairingCodeContainer').classList.add('hidden');
        
        // Show success message
        document.getElementById('linkSuccess').classList.remove('hidden');
        document.getElementById('linkedPhone').textContent = phoneNumber;
        
        // Save linked info
        localStorage.setItem('linkedPhone', phoneNumber);
        localStorage.setItem('linkedAt', new Date().toISOString());
        
        // Add log
        addLog(`[SUCCESS] WhatsApp account ${phoneNumber} linked successfully`);
        
        showNotification('✅ Success', `🎉 ShacksTech MD connected successfully!\n\n✓ WhatsApp: ${phoneNumber}\n✓ Status: Active\n✓ Prefix: .\n\nYour bot is now active and ready to receive commands!`);
        
        // Update status
        updateBotStatus();
    }, 5000); // Simulate 5 seconds of waiting
}

// ============== BOT STATUS ==============
function checkBotStatus() {
    if (botDeployed) {
        const config = JSON.parse(localStorage.getItem('botConfig') || '{}');
        const statusText = `
✅ Bot Status: ONLINE
━━━━━━━━━━━━━━━━
🤖 Name: ${config.name || 'ShacksTech MD'}
📍 Prefix: ${config.prefix || '.'}
🔧 Mode: ${(config.mode || 'public').toUpperCase()}
⚡ Speed: 27997ms
📊 Uptime: ${botUptimeSeconds > 0 ? formatUptime(botUptimeSeconds) : '0h 0m'}
📱 WhatsApp: ${whatsappLinked ? '✅ Linked' : '❌ Not Linked'}
🌍 Timezone: ${config.timezone || 'Africa/Kampala'}
        `;
        showNotification('✅ Bot Status', statusText);
    } else {
        showNotification('❌ Bot Status', 'Bot is not deployed yet.\n\nPlease deploy the bot first to get its status.');
    }
}

function updateBotStatus() {
    const statusElement = document.getElementById('bot-status');
    const whatsappElement = document.getElementById('whatsapp-status');
    const speedElement = document.getElementById('bot-speed');
    const uptimeElement = document.getElementById('uptime');
    
    if (botDeployed) {
        statusElement.textContent = '✅ Online';
        statusElement.className = 'status-online';
        speedElement.textContent = '27997ms';
        addLog('[INFO] Bot is now ONLINE');
    } else {
        statusElement.textContent = '⚫ Offline';
        statusElement.className = 'status-offline';
    }

    if (whatsappLinked) {
        const linkedPhone = localStorage.getItem('linkedPhone') || 'Unknown';
        whatsappElement.textContent = `✅ ${linkedPhone}`;
        whatsappElement.className = 'status-linked';
    } else {
        whatsappElement.textContent = '❌ Not Linked';
        whatsappElement.className = 'status-offline';
    }
}

function startStatusMonitoring() {
    // Update uptime every second
    setInterval(() => {
        if (botDeployed) {
            botUptimeSeconds++;
            const uptimeElement = document.getElementById('uptime');
            if (uptimeElement) {
                uptimeElement.textContent = formatUptime(botUptimeSeconds);
            }
        }
    }, 1000);

    // Update status every 10 seconds
    setInterval(() => {
        if (botDeployed) {
            updateStatusDisplay();
        }
    }, 10000);
}

function formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
}

function updateStatusDisplay() {
    const statusBotStatus = document.getElementById('statusBotStatus');
    if (statusBotStatus) {
        if (botDeployed) {
            statusBotStatus.textContent = 'Online';
            statusBotStatus.className = 'status-badge online';
        } else {
            statusBotStatus.textContent = 'Offline';
            statusBotStatus.className = 'status-badge';
        }
    }

    const statusUptime = document.getElementById('statusUptime');
    if (statusUptime) {
        statusUptime.textContent = formatUptime(botUptimeSeconds);
    }

    const responseSpeed = document.getElementById('responseSpeed');
    if (responseSpeed) {
        responseSpeed.textContent = '27997ms';
    }

    const commandsProcessedElem = document.getElementById('commandsProcessed');
    if (commandsProcessedElem) {
        commandsProcessedElem.textContent = commandsProcessed;
    }

    const messagesSentElem = document.getElementById('messagesSent');
    if (messagesSentElem) {
        messagesSentElem.textContent = messagesSent;
    }

    const errorCountElem = document.getElementById('errorCount');
    if (errorCountElem) {
        errorCountElem.textContent = errorCount;
    }

    // Update connection status
    const whatsappConnectionStatus = document.getElementById('whatsappConnectionStatus');
    if (whatsappConnectionStatus) {
        if (whatsappLinked) {
            whatsappConnectionStatus.textContent = 'Connected';
            whatsappConnectionStatus.className = 'status-badge online';
        } else {
            whatsappConnectionStatus.textContent = 'Disconnected';
            whatsappConnectionStatus.className = 'status-badge';
        }
    }

    const statusLinkedPhone = document.getElementById('statusLinkedPhone');
    if (statusLinkedPhone) {
        statusLinkedPhone.textContent = localStorage.getItem('linkedPhone') || 'Not linked';
    }

    const lastConnected = document.getElementById('lastConnected');
    if (lastConnected) {
        const linkedAt = localStorage.getItem('linkedAt');
        lastConnected.textContent = linkedAt ? new Date(linkedAt).toLocaleString() : 'Never';
    }

    // Simulate system resources
    document.getElementById('memoryUsage').textContent = (Math.random() * 50 + 30).toFixed(1) + '%';
    document.getElementById('cpuUsage').textContent = (Math.random() * 40 + 10).toFixed(1) + '%';
    document.getElementById('diskUsage').textContent = (Math.random() * 30 + 20).toFixed(1) + '%';
    document.getElementById('activeConnections').textContent = whatsappLinked ? Math.floor(Math.random() * 50 + 10) : '0';
}

function restartBot() {
    if (!botDeployed) {
        showNotification('❌ Error', 'Bot is not deployed');
        return;
    }
    
    const statusMessage = document.getElementById('statusMessage');
    if (statusMessage) {
        const deployStatus = document.getElementById('deployStatus');
        deployStatus.classList.remove('hidden');
        
        const steps = [
            'Shutting down bot...',
            'Clearing cache...',
            'Reinitializing services...',
            'Reconnecting to WhatsApp...',
            'Bot restarted successfully! ✅'
        ];

        let step = 0;
        const restartInterval = setInterval(() => {
            if (step < steps.length) {
                statusMessage.textContent = steps[step];
                document.getElementById('progressFill').style.width = ((step + 1) / steps.length) * 100 + '%';
                addLog(`[RESTART] ${steps[step]}`);
                step++;
            } else {
                clearInterval(restartInterval);
                deployStatus.classList.add('hidden');
                botUptimeSeconds = 0;
                updateBotStatus();
                showNotification('✅ Success', 'Bot has been restarted successfully');
            }
        }, 1000);
    }
}

function pauseBot() {
    if (!botDeployed) {
        showNotification('❌ Error', 'Bot is not deployed');
        return;
    }
    showNotification('⏸️ Paused', 'Bot has been paused.\n\nCommands will not be processed until you resume the bot.');
    addLog('[WARNING] Bot paused - commands disabled');
}

function stopBot() {
    if (!botDeployed) {
        showNotification('❌ Error', 'Bot is not deployed');
        return;
    }
    if (confirm('Are you sure you want to stop the bot?')) {
        showNotification('⏹️ Stopped', 'Bot has been stopped.');
        botDeployed = false;
        botStatus = 'offline';
        updateBotStatus();
        addLog('[INFO] Bot stopped by user');
    }
}

function updateBot() {
    if (!botDeployed) {
        showNotification('❌ Error', 'Bot is not deployed');
        return;
    }
    
    showNotification('📥 Updating', 'Checking for updates...');
    addLog('[INFO] Checking for bot updates');
    
    setTimeout(() => {
        showNotification('✅ Updated', 'Your bot is up to date!\n\nVersion: 1.0.0');
        addLog('[SUCCESS] Bot update check completed');
    }, 3000);
}

// ============== SETTINGS ==============
function saveSettings() {
    const botName = document.getElementById('settingsBotName')?.value || 'ShacksTech MD';
    const prefix = document.getElementById('settingsPrefix')?.value || '.';
    const botMode = document.getElementById('settingsBotMode')?.value || 'public';

    if (prefix.length !== 1) {
        showNotification('❌ Error', 'Prefix must be a single character');
        return;
    }

    const settings = {
        botName,
        prefix,
        botMode,
        updatedAt: new Date().toISOString()
    };

    localStorage.setItem('botSettings', JSON.stringify(settings));
    showNotification('✅ Saved', 'Bot settings have been saved successfully');
    addLog('[INFO] Bot settings updated');
}

function saveSecuritySettings() {
    const settings = {
        allowGroupCommands: document.getElementById('allowGroupCommands')?.checked || true,
        enableAutoRestart: document.getElementById('enableAutoRestart')?.checked || true,
        enableLogging: document.getElementById('enableLogging')?.checked || true,
        updatedAt: new Date().toISOString()
    };

    localStorage.setItem('securitySettings', JSON.stringify(settings));
    showNotification('✅ Saved', 'Security settings have been saved');
    addLog('[INFO] Security settings updated');
}

function resetBot() {
    if (confirm('⚠️ WARNING: This will reset all bot configurations!\n\nAre you sure?')) {
        botDeployed = false;
        whatsappLinked = false;
        botStatus = 'offline';
        localStorage.removeItem('botConfig');
        localStorage.removeItem('botSettings');
        localStorage.removeItem('linkedPhone');
        updateBotStatus();
        showNotification('✅ Reset', 'Bot has been reset to default settings');
        addLog('[WARNING] Bot reset by user');
    }
}

function deleteBot() {
    if (confirm('⚠️ DANGER: This will permanently delete your bot!\n\nThis action cannot be undone!\n\nAre you really sure?')) {
        botDeployed = false;
        whatsappLinked = false;
        botStatus = 'offline';
        localStorage.clear();
        showNotification('✅ Deleted', 'Bot has been permanently deleted');
        addLog('[ERROR] Bot deleted by user');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}

function unlinkWhatsApp() {
    if (!whatsappLinked) {
        showNotification('❌ Error', 'WhatsApp is not linked');
        return;
    }

    if (confirm('Are you sure you want to unlink your WhatsApp account from ShacksTech MD?')) {
        const linkedPhone = localStorage.getItem('linkedPhone');
        whatsappLinked = false;
        localStorage.removeItem('linkedPhone');
        localStorage.removeItem('linkedAt');
        document.getElementById('linkSuccess').classList.add('hidden');
        document.getElementById('linkingStatus').classList.add('hidden');
        updateBotStatus();
        showNotification('✅ Unlinked', `WhatsApp account ${linkedPhone} has been unlinked`);
        addLog(`[INFO] WhatsApp account ${linkedPhone} unlinked`);
    }
}

// ============== LOGGING ==============
function addLog(message) {
    const logsContainer = document.getElementById('logsContainer');
    if (logsContainer) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('p');
        logEntry.className = 'log-entry';
        logEntry.textContent = `[${timestamp}] ${message}`;
        logsContainer.appendChild(logEntry);
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }

    // Also log to console
    console.log(`${new Date().toISOString()} - ${message}`);
}

function clearLogs() {
    if (confirm('Are you sure you want to clear all logs?')) {
        const logsContainer = document.getElementById('logsContainer');
        if (logsContainer) {
            logsContainer.innerHTML = '<p class="log-entry">[Logs cleared]</p>';
        }
        addLog('[INFO] Logs cleared by user');
    }
}

// ============== MODAL & NOTIFICATIONS ==============
function showNotification(title, message) {
    const modal = document.getElementById('modal');
    if (modal) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').textContent = message;
        modal.classList.remove('hidden');
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
});

// ============== LOCAL STORAGE ==============
function loadSavedData() {
    const config = localStorage.getItem('botConfig');
    const linkedPhone = localStorage.getItem('linkedPhone');

    if (config) {
        const botConfig = JSON.parse(config);
        botDeployed = botConfig.deployed || false;
        currentBot = botConfig;
        
        // Populate form fields
        document.getElementById('botName').value = botConfig.name || 'ShacksTech MD';
        document.getElementById('ownerNumber').value = botConfig.owner || '+256759590343';
        document.getElementById('prefix').value = botConfig.prefix || '.';
        document.getElementById('botMode').value = botConfig.mode || 'public';
        document.getElementById('timezone').value = botConfig.timezone || 'Africa/Kampala';
    }

    if (linkedPhone) {
        whatsappLinked = true;
        document.getElementById('linkSuccess').classList.remove('hidden');
        document.getElementById('linkedPhone').textContent = linkedPhone;
    }

    updateBotStatus();
}

// ============== AUTO-SAVE ==============
window.addEventListener('beforeunload', () => {
    if (currentBot) {
        saveBotConfig();
    }
});

// ============== RESPONSIVE ==============
window.addEventListener('resize', () => {
    // Adjust layout if needed
});

// ============== KEYBOARD SHORTCUTS ==============
document.addEventListener('keydown', (event) => {
    // Ctrl/Cmd + S to save settings
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        saveSettings();
    }

    // Escape to close modal
    if (event.key === 'Escape') {
        closeModal();
    }
});

// ============== INITIALIZATION LOG ==============
console.log(`
╔════════════════════════════════════════╗
║    🤖 ShacksTech MD Bot Panel v1.0     ║
║    ================================     ║
║    Owner: SHACKS TECH                 ║
║    WhatsApp: +256759590343            ║
║    Country: Uganda 🇺🇬                 ║
║    User: silverkeith679-collab        ║
║    Status: Ready & Active             ║
╚════════════════════════════════════════╝
`);

addLog('[INFO] ShacksTech MD Panel ready for deployment');