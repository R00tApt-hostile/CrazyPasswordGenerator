document.getElementById('generate').addEventListener('click', generatePassword);
document.getElementById('copy').addEventListener('click', copyPassword);
document.getElementById('length').addEventListener('input', updateLengthValue);
document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

function generatePassword() {
    const length = document.getElementById('length').value;
    const uppercase = document.getElementById('uppercase').checked;
    const numbers = document.getElementById('numbers').checked;
    const symbols = document.getElementById('symbols').checked;

    let charset = 'abcdefghijklmnopqrstuvwxyz';
    if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (numbers) charset += '0123456789';
    if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }

    document.getElementById('password').textContent = password;
    updateStrengthMeter(password);
}

function updateLengthValue() {
    document.getElementById('lengthValue').textContent = document.getElementById('length').value;
}

function updateStrengthMeter(password) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    // Calculate strength (0-100)
    let strength = 0;
    if (password.length >= 12) strength += 40;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;

    strengthBar.style.width = `${strength}%`;

    // Update color and text
    if (strength < 40) {
        strengthBar.style.background = 'var(--strength-weak)';
        strengthText.textContent = 'Strength: Weak';
    } else if (strength < 80) {
        strengthBar.style.background = 'var(--strength-medium)';
        strengthText.textContent = 'Strength: Medium';
    } else {
        strengthBar.style.background = 'var(--strength-strong)';
        strengthText.textContent = 'Strength: Strong';
    }
}

function copyPassword() {
    const password = document.getElementById('password').textContent;
    if (password === 'Click "Generate"') return;

    navigator.clipboard.writeText(password)
        .then(() => alert('Password copied!'))
        .catch(() => alert('Failed to copy.'));
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const toggleBtn = document.getElementById('darkModeToggle');
    toggleBtn.textContent = document.body.classList.contains('dark-mode') ? '☀️ Light Mode' : '🌓 Dark Mode';
}
