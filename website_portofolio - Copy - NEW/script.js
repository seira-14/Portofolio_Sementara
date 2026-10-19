/* =========================================
   AOS INIT
========================================= */
AOS.init({
    duration: 900,
    easing: 'ease-out-cubic',
    once: true,
    offset: 80
});

/* =========================================
   THEME TOGGLE (DARK/LIGHT MODE)
========================================= */
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');
const body = document.body;

// Load theme from localStorage
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') {
    body.classList.add('light-mode');
    themeIcon.classList.remove('bi-sun-fill');
    themeIcon.classList.add('bi-moon-fill');
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    
    if (body.classList.contains('light-mode')) {
        themeIcon.classList.remove('bi-sun-fill');
        themeIcon.classList.add('bi-moon-fill');
        localStorage.setItem('theme', 'light');
    } else {
        themeIcon.classList.remove('bi-moon-fill');
        themeIcon.classList.add('bi-sun-fill');
        localStorage.setItem('theme', 'dark');
    }
});

/* =========================================
   TYPING ANIMATION
========================================= */
const typedTexts = [
    'Web Developer',
    'UI/UX Enthusiast',
    'Information Systems Student',
    'Front-End Developer',
    'Problem Solver'
];
const typedEl = document.getElementById('typed');
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
    const current = typedTexts[textIndex];
    if (isDeleting) {
        typedEl.textContent = current.substring(0, charIndex--);
        if (charIndex < 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % typedTexts.length;
            setTimeout(typeEffect, 400);
            return;
        }
        setTimeout(typeEffect, 50);
    } else {
        typedEl.textContent = current.substring(0, charIndex++);
        if (charIndex > current.length) {
            isDeleting = true;
            setTimeout(typeEffect, 1800);
            return;
        }
        setTimeout(typeEffect, 100);
    }
}
typeEffect();

/* =========================================
   NAVBAR SCROLL EFFECT & ACTIVE LINK
========================================= */
const navbar = document.getElementById('mainNav');
const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
const sections = document.querySelectorAll('section[id]');
const backToTop = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');

    if (scrollY > 400) backToTop.classList.add('show');
    else backToTop.classList.remove('show');

    let current = '';
    sections.forEach(section => {
        const top = section.offsetTop - 120;
        const height = section.offsetHeight;
        if (scrollY >= top && scrollY < top + height) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

/* =========================================
   SMOOTH SCROLL & CLOSE MOBILE MENU
========================================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            const navCollapse = document.getElementById('navMenu');
            const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
            if (bsCollapse) bsCollapse.hide();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

/* =========================================
   CONTACT FORM - LOCALSTORAGE DRAFT
========================================= */
const inputSubject = document.getElementById('inputSubject');
const inputMessage = document.getElementById('inputMessage');

// Load draft dari localStorage saat halaman dimuat
if (localStorage.getItem('draft_subject')) {
    inputSubject.value = localStorage.getItem('draft_subject');
}
if (localStorage.getItem('draft_message')) {
    inputMessage.value = localStorage.getItem('draft_message');
}

// Simpan draft setiap kali user mengetik (Subject & Message)
inputSubject.addEventListener('input', function() {
    localStorage.setItem('draft_subject', this.value);
});
inputMessage.addEventListener('input', function() {
    localStorage.setItem('draft_message', this.value);
});

/* =========================================
   CONTACT FORM - VALIDATION & SUBMIT KE MYSQL
========================================= */
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formNotification = document.getElementById('formNotification');
const notifIcon = document.getElementById('notifIcon');
const notifMessage = document.getElementById('notifMessage');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showNotification(type, message) {
    formNotification.className = `alert alert-${type} alert-dismissible fade show`;
    formNotification.style.display = 'block';
    
    if (type === 'success') {
        notifIcon.className = 'bi bi-check-circle-fill me-2';
    } else {
        notifIcon.className = 'bi bi-exclamation-circle-fill me-2';
    }
    notifMessage.textContent = message;
    
    setTimeout(() => {
        formNotification.classList.remove('show');
        setTimeout(() => {
            formNotification.style.display = 'none';
        }, 300);
    }, 5000);
}

function validateForm() {
    let isValid = true;
    const inputs = contactForm.querySelectorAll('[required]');
    
    inputs.forEach(input => {
        const value = input.value.trim();
        
        if (!value) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
        
        if (input.type === 'email' && value && !emailRegex.test(value)) {
            input.classList.add('is-invalid');
            isValid = false;
        }
    });
    
    return isValid;
}

// Hapus invalid saat user mengetik
contactForm.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', function() {
        this.classList.remove('is-invalid');
    });
});

// Submit form ke backend/contact.php
contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        showNotification('danger', 'Mohon lengkapi semua field dengan benar!');
        return;
    }
    
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i> Mengirim...';
    submitBtn.disabled = true;
    
    const formData = new FormData(contactForm);
    
    try {
        const response = await fetch('backend/contact.php', {
            method: 'POST',
            body: formData
        });
        
        // Coba parse JSON, fallback jika bukan JSON
        let result;
        const text = await response.text();
        try {
            result = JSON.parse(text);
        } catch (err) {
            throw new Error('Response tidak valid: ' + text.substring(0, 100));
        }
        
        if (response.ok && result && result.success) {
            showNotification('success', result.message || 'Pesan berhasil dikirim!');
            contactForm.reset();
            // Hapus draft setelah berhasil
            localStorage.removeItem('draft_subject');
            localStorage.removeItem('draft_message');
        } else {
            showNotification('danger', (result && result.message) || 'Gagal mengirim pesan. Silakan coba lagi.');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('danger', 'Terjadi kesalahan koneksi. Pastikan website dijalankan via localhost.');
    } finally {
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;
    }
});

/* =========================================
   SKILL PROGRESS BAR ANIMATION
========================================= */
const skillBars = document.querySelectorAll('.progress-bar');
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bar = entry.target;
            const width = bar.style.width;
            bar.style.width = '0';
            setTimeout(() => { bar.style.width = width; }, 200);
            skillObserver.unobserve(bar);
        }
    });
}, { threshold: 0.3 });
skillBars.forEach(bar => skillObserver.observe(bar));

/* =========================================
   PREVENT FLASH ON LOAD
========================================= */
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});