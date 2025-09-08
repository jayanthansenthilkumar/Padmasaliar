// Authentication handlers
document.addEventListener('DOMContentLoaded', function() {
    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Admin form handler
    const adminForm = document.getElementById('adminForm');
    if (adminForm) {
        adminForm.addEventListener('submit', handleAdminLogin);
    }

    // Check if user is already logged in
    checkAuthStatus();
});

async function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    // Validate form
    if (!loginData.email || !loginData.password) {
        showAlert('error', 'Please fill in all fields');
        return;
    }

    // Show loading
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Logging in...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('api.php?action=login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();

        if (result.success) {
            showAlert('success', 'Login successful! Redirecting...', 'Welcome Back!');
            closeModal('loginModal');
            
            // Store user data
            localStorage.setItem('user', JSON.stringify(result.data));
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.php';
            }, 1500);
        } else {
            showAlert('error', result.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('error', 'Login failed. Please try again.');
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const registerData = {
        full_name: formData.get('full_name'),
        email: formData.get('email'),
        password: formData.get('password'),
        gender: formData.get('gender'),
        date_of_birth: formData.get('date_of_birth'),
        phone_number: formData.get('phone_number')
    };

    // Validate form
    const requiredFields = ['full_name', 'email', 'password', 'gender', 'date_of_birth', 'phone_number'];
    for (let field of requiredFields) {
        if (!registerData[field]) {
            showAlert('error', `Please fill in ${field.replace('_', ' ')}`);
            return;
        }
    }

    // Validate email
    if (!isValidEmail(registerData.email)) {
        showAlert('error', 'Please enter a valid email address');
        return;
    }

    // Validate phone
    if (!isValidPhone(registerData.phone_number)) {
        showAlert('error', 'Please enter a valid 10-digit phone number');
        return;
    }

    // Validate password
    if (registerData.password.length < 6) {
        showAlert('error', 'Password must be at least 6 characters long');
        return;
    }

    // Validate age (must be 18+)
    const birthDate = new Date(registerData.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18) {
        showAlert('error', 'You must be at least 18 years old to register');
        return;
    }

    // Show loading
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Creating Account...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('api.php?action=register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData)
        });

        const result = await response.json();

        if (result.success) {
            showAlert('success', 'Registration successful! Redirecting to dashboard...', 'Welcome!');
            closeModal('registerModal');
            
            // Store user data
            localStorage.setItem('user', JSON.stringify(result.data));
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.php';
            }, 1500);
        } else {
            showAlert('error', result.message);
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAlert('error', 'Registration failed. Please try again.');
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function handleAdminLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const adminData = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    // Validate form
    if (!adminData.email || !adminData.password) {
        showAlert('error', 'Please fill in all fields');
        return;
    }

    // Show loading
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Logging in...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('api.php?action=admin_login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(adminData)
        });

        const result = await response.json();

        if (result.success) {
            showAlert('success', 'Admin login successful! Redirecting...', 'Welcome Admin!');
            closeModal('adminModal');
            
            // Redirect to admin dashboard
            setTimeout(() => {
                window.location.href = 'admin/dashboard.php';
            }, 1500);
        } else {
            showAlert('error', result.message);
        }
    } catch (error) {
        console.error('Admin login error:', error);
        showAlert('error', 'Admin login failed. Please try again.');
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function handleLogout() {
    try {
        const response = await fetch('api.php?action=logout', {
            method: 'POST'
        });

        const result = await response.json();

        if (result.success) {
            // Clear local storage
            localStorage.removeItem('user');
            
            showAlert('success', 'Logged out successfully!');
            
            // Redirect to home page
            setTimeout(() => {
                window.location.href = 'index.php';
            }, 1500);
        }
    } catch (error) {
        console.error('Logout error:', error);
        showAlert('error', 'Logout failed. Please try again.');
    }
}

function checkAuthStatus() {
    // Check if we're on a protected page
    const protectedPages = ['dashboard.php', 'profile.php', 'search.php'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        const user = localStorage.getItem('user');
        if (!user) {
            // Redirect to home page if not authenticated
            window.location.href = 'index.php';
        }
    }
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
}

function showAlert(type, message, title = '') {
    const config = {
        text: message,
        confirmButtonColor: '#e91e63',
        timer: 3000,
        timerProgressBar: true
    };

    if (title) {
        config.title = title;
    }

    switch (type) {
        case 'success':
            config.icon = 'success';
            config.confirmButtonColor = '#4caf50';
            break;
        case 'error':
            config.icon = 'error';
            config.confirmButtonColor = '#f44336';
            break;
        case 'warning':
            config.icon = 'warning';
            config.confirmButtonColor = '#ff9800';
            break;
        case 'info':
            config.icon = 'info';
            config.confirmButtonColor = '#2196f3';
            break;
    }

    Swal.fire(config);
}
