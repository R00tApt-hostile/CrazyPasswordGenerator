// ====================== Core Functionality ======================
let currentMode = 'password';
let timeout;

// DOM Elements
const elements = {
    password: document.getElementById('password'),
    passphrase: document.getElementById('passphrase'),
    length: document.getElementById('length'),
    lengthValue: document.getElementById('lengthValue'),
    uppercase: document.getElementById('uppercase'),
    numbers: document.getElementById('numbers'),
    symbols: document.getElementById('symbols'),
    wordCount: document.getElementById('wordCount'),
    wordCountValue: document.getElementById('wordCountValue'),
    separator: document.getElementById('separator'),
    strengthBar: document.querySelector('.strength-bar'),
    strengthText: document.querySelector('.strength-text'),
    passwordSection: document.getElementById('passwordSection'),
    phraseSection: document.getElementById('phraseSection'),
    pwMode: document.getElementById('pwMode'),
    phraseMode: document.getElementById('phraseMode')
};

// Event Listeners
document.getElementById('generate').addEventListener('click', generate);
document.getElementById('copy').addEventListener('click', copyToClipboard);
document.getElementById('export').addEventListener('click', exportEncrypted);
document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
document.getElementById('length').addEventListener('input', updateLengthValue);
document.getElementById('wordCount').addEventListener('input', updateWordCountValue);
elements.pwMode.addEventListener('click', () => switchMode('password'));
elements.phraseMode.addEventListener('click', () => switchMode('phrase'));

// Mode Switching
function switchMode(mode) {
    currentMode = mode;
    if (mode === 'password') {
        elements.passwordSection.style.display = 'block';
        elements.phraseSection.style.display = 'none';
        elements.pwMode.classList.add('active');
        elements.phraseMode.classList.remove('active');
    } else {
        elements.passwordSection.style.display = 'none';
        elements.phraseSection.style.display = 'block';
        elements.pwMode.classList.remove('active');
        elements.phraseMode.classList.add('active');
    }
    generate();
}

// Password Generation
function generate() {
    clearTimeout(timeout);
    let output;

    if (currentMode === 'password') {
        output = generatePassword();
        updateStrengthMeter(output);
        elements.password.textContent = output;
        timeout = setTimeout(() => {
            elements.password.textContent = "Expired 🔒";
        }, 30000);
    } else {
        output = generatePassphrase();
        elements.passphrase.textContent = output;
    }
}

function generatePassword() {
    const length = elements.length.value;
    const uppercase = elements.uppercase.checked;
    const numbers = elements.numbers.checked;
    const symbols = elements.symbols.checked;

    let charset = 'abcdefghijklmnopqrstuvwxyz';
    if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (numbers) charset += '0123456789';
    if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    return Array.from({ length }, () => 
        charset[Math.floor(Math.random() * charset.length)]
    ).join('');
}

function generatePassphrase() {
    const wordCount = elements.wordCount.value;
    const separator = elements.separator.value;
    return Array.from({ length: wordCount }, () => 
        words[Math.floor(Math.random() * words.length)]
    ).join(separator);
}

// ====================== Privacy Features ======================
// 1. Password Leak Checker (via HIBP API)
async function checkPasswordLeak(password) {
    const hash = CryptoJS.SHA1(password).toString();
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5).toUpperCase();

    try {
        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
        const leakedHashes = await response.text();
        if (leakedHashes.includes(suffix)) {
            alert("⚠️ This password was found in a data breach!");
        }
    } catch (e) {
        console.error("Leak check failed (offline?)");
    }
}

// 2. Offline PWA Support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(registration => {
            console.log('SW registered');
        }).catch(err => {
            console.log('SW registration failed');
        });
    });
}

// 3. Self-Destructing Passwords (handled in generate())

// 4. Export as Encrypted File
function exportEncrypted() {
    const password = currentMode === 'password' 
        ? elements.password.textContent 
        : elements.passphrase.textContent;

    if (password.includes("Generate") || password.includes("Expired")) return;

    const key = prompt("Set an encryption key (don't forget it!):");
    if (!key) return;

    const encrypted = CryptoJS.AES.encrypt(password, key).toString();
    const blob = new Blob([encrypted], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `secure-password.encrypted.txt`;
    a.click();
}

// ====================== UI Helpers ======================
function updateLengthValue() {
    elements.lengthValue.textContent = elements.length.value;
}

function updateWordCountValue() {
    elements.wordCountValue.textContent = elements.wordCount.value;
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const btn = document.getElementById('darkModeToggle');
    btn.textContent = document.body.classList.contains('dark-mode') 
        ? '☀️ Light Mode' 
        : '🌓 Dark Mode';
}

function copyToClipboard() {
    const text = currentMode === 'password' 
        ? elements.password.textContent 
        : elements.passphrase.textContent;

    if (text.includes("Generate") || text.includes("Expired")) return;

    navigator.clipboard.writeText(text).then(() => {
        alert("Copied! Remember to clear clipboard later.");
    });
}

// Strength Meter
function updateStrengthMeter(password) {
    let strength = 0;
    if (password.length >= 12) strength += 40;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;

    elements.strengthBar.style.width = `${strength}%`;

    if (strength < 40) {
        elements.strengthBar.style.background = 'var(--strength-weak)';
        elements.strengthText.textContent = 'Strength: Weak';
    } else if (strength < 80) {
        elements.strengthBar.style.background = 'var(--strength-medium)';
        elements.strengthText.textContent = 'Strength: Medium';
    } else {
        elements.strengthBar.style.background = 'var(--strength-strong)';
        elements.strengthText.textContent = 'Strength: Strong';
    }

    // Auto-check for leaks (comment out if too slow)
    checkPasswordLeak(password);
}

// ====================== PWA Installation ======================
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installPWA').style.display = 'block';
});

document.getElementById('installPWA').addEventListener('click', () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
        document.getElementById('installPWA').style.display = 'none';
    });
});
