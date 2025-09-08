// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInUp 0.8s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .about-text, .contact-item');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        observer.observe(el);
    });

    // Contact form handler
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
});

// Modal functions
function showLoginModal() {
    showModal('loginModal');
}

function showRegisterModal() {
    showModal('registerModal');
}

function showAdminModal() {
    showModal('adminModal');
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        const firstInput = modal.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset form
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

function switchModal(currentModalId, targetModalId) {
    closeModal(currentModalId);
    setTimeout(() => showModal(targetModalId), 300);
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            closeModal(modal.id);
        }
    });
});

// Close modal with Escape key
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const openModal = document.querySelector('.modal[style*="display: block"]');
        if (openModal) {
            closeModal(openModal.id);
        }
    }
});

// Mobile menu toggle
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const menuToggle = document.querySelector('.mobile-menu-toggle i');
    
    if (navMenu.style.display === 'flex') {
        navMenu.style.display = 'none';
        menuToggle.className = 'ri-menu-line';
    } else {
        navMenu.style.display = 'flex';
        navMenu.style.flexDirection = 'column';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '100%';
        navMenu.style.left = '0';
        navMenu.style.right = '0';
        navMenu.style.background = 'white';
        navMenu.style.padding = '1rem';
        navMenu.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
        menuToggle.className = 'ri-close-line';
    }
}

// Contact form handler
function handleContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const contactData = {
        name: formData.get('name') || event.target.querySelector('input[type="text"]').value,
        email: formData.get('email') || event.target.querySelector('input[type="email"]').value,
        message: formData.get('message') || event.target.querySelector('textarea').value
    };

    // Basic validation
    if (!contactData.name || !contactData.email || !contactData.message) {
        Swal.fire({
            icon: 'error',
            title: 'Missing Information',
            text: 'Please fill in all fields.',
            confirmButtonColor: '#e91e63'
        });
        return;
    }

    if (!isValidEmail(contactData.email)) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Email',
            text: 'Please enter a valid email address.',
            confirmButtonColor: '#e91e63'
        });
        return;
    }

    // Show success message (in a real app, you'd send this to a server)
    Swal.fire({
        icon: 'success',
        title: 'Message Sent!',
        text: 'Thank you for your message. We\'ll get back to you soon!',
        confirmButtonColor: '#4caf50',
        timer: 3000,
        timerProgressBar: true
    });

    // Reset form
    event.target.reset();
}

// Utility function for email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Add some interactive effects
document.addEventListener('mousemove', function(e) {
    const floatingHearts = document.querySelectorAll('.floating-hearts i');
    floatingHearts.forEach((heart, index) => {
        const speed = (index + 1) * 0.01;
        const x = (e.clientX * speed) % window.innerWidth;
        const y = (e.clientY * speed) % window.innerHeight;
        
        heart.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) rotate(${x * 0.1}deg)`;
    });
});

// Preloader (if needed)
window.addEventListener('load', function() {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
});

// Add loading states to buttons
function addLoadingToButton(button, text = 'Loading...') {
    const originalText = button.innerHTML;
    button.innerHTML = `<div class="loading"></div> ${text}`;
    button.disabled = true;
    
    return function() {
        button.innerHTML = originalText;
        button.disabled = false;
    };
}

// Form validation helpers
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#f44336';
            isValid = false;
        } else {
            field.style.borderColor = '#e9ecef';
        }
    });

    return isValid;
}

// Add input validation effects
document.addEventListener('input', function(e) {
    if (e.target.matches('input, textarea, select')) {
        const field = e.target;
        
        if (field.hasAttribute('required')) {
            if (field.value.trim()) {
                field.style.borderColor = '#4caf50';
            } else {
                field.style.borderColor = '#f44336';
            }
        }

        // Email validation
        if (field.type === 'email' && field.value) {
            if (isValidEmail(field.value)) {
                field.style.borderColor = '#4caf50';
            } else {
                field.style.borderColor = '#f44336';
            }
        }

        // Phone validation
        if (field.name === 'phone_number' && field.value) {
            if (/^[0-9]{10}$/.test(field.value)) {
                field.style.borderColor = '#4caf50';
            } else {
                field.style.borderColor = '#f44336';
            }
        }
    }
});

// Typing effect for hero title (optional enhancement)
function typeEffect(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function typing() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(typing, speed);
        }
    }
    
    typing();
}

// Initialize typing effect if hero title exists
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
    const originalText = heroTitle.textContent;
    // Uncomment the line below to enable typing effect
    // typeEffect(heroTitle, originalText);
}

// Parallax effect for hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-hearts i');
    const speed = 0.5;

    parallaxElements.forEach(element => {
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });
});

// Add ripple effect to buttons
document.addEventListener('click', function(e) {
    if (e.target.matches('.btn')) {
        const button = e.target;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        // Add ripple styles if not already added
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                .btn {
                    position: relative;
                    overflow: hidden;
                }
                .ripple {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.6);
                    transform: scale(0);
                    animation: ripple-animation 0.6s linear;
                    pointer-events: none;
                }
                @keyframes ripple-animation {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
});
