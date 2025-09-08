<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Padma Saliar Matrimony - Find Your Perfect Match</title>
    <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
    <link href="assets/css/style.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>
    <div class="landing-container">
        <!-- Header -->
        <header class="header">
            <div class="container">
                <div class="nav-brand">
                    <i class="ri-heart-line"></i>
                    <span>Padma Saliar Matrimony</span>
                </div>
                <nav class="nav-menu">
                    <a href="#home" class="nav-link">Home</a>
                    <a href="#about" class="nav-link">About</a>
                    <a href="#features" class="nav-link">Features</a>
                    <a href="#contact" class="nav-link">Contact</a>
                    <div class="nav-buttons">
                        <button class="btn btn-outline" onclick="showLoginModal()">Login</button>
                        <button class="btn btn-primary" onclick="showRegisterModal()">Register</button>
                        <button class="btn btn-admin" onclick="showAdminModal()">Admin</button>
                    </div>
                </nav>
                <div class="mobile-menu-toggle" onclick="toggleMobileMenu()">
                    <i class="ri-menu-line"></i>
                </div>
            </div>
        </header>

        <!-- Hero Section -->
        <section id="home" class="hero">
            <div class="hero-background">
                <div class="floating-hearts">
                    <i class="ri-heart-fill"></i>
                    <i class="ri-heart-line"></i>
                    <i class="ri-heart-fill"></i>
                    <i class="ri-heart-line"></i>
                    <i class="ri-heart-fill"></i>
                </div>
            </div>
            <div class="container">
                <div class="hero-content">
                    <h1 class="hero-title">Find Your Perfect Life Partner</h1>
                    <p class="hero-subtitle">Join thousands of happy couples who found their soulmate through Padma Saliar Matrimony</p>
                    <div class="hero-buttons">
                        <button class="btn btn-primary btn-large" onclick="showRegisterModal()">
                            <i class="ri-user-add-line"></i>
                            Join Now
                        </button>
                        <button class="btn btn-outline btn-large" onclick="showLoginModal()">
                            <i class="ri-login-box-line"></i>
                            Sign In
                        </button>
                    </div>
                    <div class="hero-stats">
                        <div class="stat-item">
                            <div class="stat-number">10,000+</div>
                            <div class="stat-label">Happy Couples</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">50,000+</div>
                            <div class="stat-label">Active Members</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">98%</div>
                            <div class="stat-label">Success Rate</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section id="features" class="features">
            <div class="container">
                <div class="section-header">
                    <h2>Why Choose Padma Saliar Matrimony?</h2>
                    <p>We provide the best platform to find your perfect match with advanced features and personalized service</p>
                </div>
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="ri-shield-check-line"></i>
                        </div>
                        <h3>Verified Profiles</h3>
                        <p>All profiles are manually verified to ensure authenticity and safety</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="ri-search-2-line"></i>
                        </div>
                        <h3>Advanced Search</h3>
                        <p>Find matches based on your preferences with our smart search filters</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="ri-user-heart-line"></i>
                        </div>
                        <h3>Compatibility Matching</h3>
                        <p>Our algorithm suggests the most compatible matches for you</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="ri-customer-service-2-line"></i>
                        </div>
                        <h3>24/7 Support</h3>
                        <p>Our dedicated team is available to help you throughout your journey</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="ri-lock-line"></i>
                        </div>
                        <h3>Privacy & Security</h3>
                        <p>Your personal information is safe and secure with us</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="ri-smartphone-line"></i>
                        </div>
                        <h3>Mobile Friendly</h3>
                        <p>Access your account anywhere, anytime with our responsive design</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- About Section -->
        <section id="about" class="about">
            <div class="container">
                <div class="about-content">
                    <div class="about-text">
                        <h2>About Padma Saliar Matrimony</h2>
                        <p>We are dedicated to helping people find their perfect life partner. With years of experience in matchmaking, we understand the importance of finding someone who shares your values, dreams, and aspirations.</p>
                        <p>Our platform combines traditional values with modern technology to create meaningful connections that last a lifetime.</p>
                        <div class="about-features">
                            <div class="about-feature">
                                <i class="ri-check-line"></i>
                                <span>Trusted by thousands</span>
                            </div>
                            <div class="about-feature">
                                <i class="ri-check-line"></i>
                                <span>Professional matchmaking</span>
                            </div>
                            <div class="about-feature">
                                <i class="ri-check-line"></i>
                                <span>Personalized service</span>
                            </div>
                        </div>
                    </div>
                    <div class="about-image">
                        <div class="about-card">
                            <i class="ri-heart-pulse-line"></i>
                            <h3>Your Journey to Love Starts Here</h3>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Contact Section -->
        <section id="contact" class="contact">
            <div class="container">
                <div class="section-header">
                    <h2>Get in Touch</h2>
                    <p>Have questions? We're here to help you find your perfect match</p>
                </div>
                <div class="contact-grid">
                    <div class="contact-info">
                        <div class="contact-item">
                            <i class="ri-phone-line"></i>
                            <div>
                                <h4>Phone</h4>
                                <p>+91 98765 43210</p>
                            </div>
                        </div>
                        <div class="contact-item">
                            <i class="ri-mail-line"></i>
                            <div>
                                <h4>Email</h4>
                                <p>contact@padmasaliar.com</p>
                            </div>
                        </div>
                        <div class="contact-item">
                            <i class="ri-map-pin-line"></i>
                            <div>
                                <h4>Address</h4>
                                <p>123 Matrimony Street, City, State 12345</p>
                            </div>
                        </div>
                    </div>
                    <div class="contact-form">
                        <form>
                            <div class="form-group">
                                <input type="text" placeholder="Your Name" required>
                            </div>
                            <div class="form-group">
                                <input type="email" placeholder="Your Email" required>
                            </div>
                            <div class="form-group">
                                <textarea placeholder="Your Message" rows="5" required></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary">Send Message</button>
                        </form>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <div class="container">
                <div class="footer-content">
                    <div class="footer-brand">
                        <i class="ri-heart-line"></i>
                        <span>Padma Saliar Matrimony</span>
                    </div>
                    <div class="footer-links">
                        <a href="#privacy">Privacy Policy</a>
                        <a href="#terms">Terms of Service</a>
                        <a href="#support">Support</a>
                    </div>
                    <div class="footer-social">
                        <a href="#"><i class="ri-facebook-line"></i></a>
                        <a href="#"><i class="ri-twitter-line"></i></a>
                        <a href="#"><i class="ri-instagram-line"></i></a>
                        <a href="#"><i class="ri-linkedin-line"></i></a>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2025 Padma Saliar Matrimony. All rights reserved.</p>
                </div>
            </div>
        </footer>
    </div>

    <!-- Login Modal -->
    <div id="loginModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="ri-login-box-line"></i> Login</h2>
                <span class="close" onclick="closeModal('loginModal')">&times;</span>
            </div>
            <form id="loginForm">
                <div class="form-group">
                    <label for="loginEmail">Email</label>
                    <input type="email" id="loginEmail" name="email" required>
                </div>
                <div class="form-group">
                    <label for="loginPassword">Password</label>
                    <input type="password" id="loginPassword" name="password" required>
                </div>
                <button type="submit" class="btn btn-primary btn-full">
                    <i class="ri-login-box-line"></i>
                    Login
                </button>
            </form>
            <div class="modal-footer">
                <p>Don't have an account? <a href="#" onclick="switchModal('loginModal', 'registerModal')">Register here</a></p>
            </div>
        </div>
    </div>

    <!-- Register Modal -->
    <div id="registerModal" class="modal">
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h2><i class="ri-user-add-line"></i> Register</h2>
                <span class="close" onclick="closeModal('registerModal')">&times;</span>
            </div>
            <form id="registerForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="fullName">Full Name</label>
                        <input type="text" id="fullName" name="full_name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <div class="form-group">
                        <label for="gender">Gender</label>
                        <select id="gender" name="gender" required>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="dateOfBirth">Date of Birth</label>
                        <input type="date" id="dateOfBirth" name="date_of_birth" required>
                    </div>
                    <div class="form-group">
                        <label for="phoneNumber">Phone Number</label>
                        <input type="tel" id="phoneNumber" name="phone_number" required>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary btn-full">
                    <i class="ri-user-add-line"></i>
                    Register
                </button>
            </form>
            <div class="modal-footer">
                <p>Already have an account? <a href="#" onclick="switchModal('registerModal', 'loginModal')">Login here</a></p>
            </div>
        </div>
    </div>

    <!-- Admin Login Modal -->
    <div id="adminModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="ri-admin-line"></i> Admin Login</h2>
                <span class="close" onclick="closeModal('adminModal')">&times;</span>
            </div>
            <form id="adminForm">
                <div class="form-group">
                    <label for="adminEmail">Admin Email</label>
                    <input type="email" id="adminEmail" name="email" required>
                </div>
                <div class="form-group">
                    <label for="adminPassword">Admin Password</label>
                    <input type="password" id="adminPassword" name="password" required>
                </div>
                <button type="submit" class="btn btn-admin btn-full">
                    <i class="ri-login-box-line"></i>
                    Admin Login
                </button>
            </form>
        </div>
    </div>

    <script src="assets/js/auth.js"></script>
    <script src="assets/js/main.js"></script>
</body>
</html>
