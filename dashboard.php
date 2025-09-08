<?php
require_once 'config.php';

// Check if user is logged in
if (!isLoggedIn()) {
    redirectTo('index.php');
}

$user_id = $_SESSION['user_id'];
$user_name = $_SESSION['user_name'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Padma Saliar Matrimony</title>
    <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
    <link href="assets/css/style.css" rel="stylesheet">
    <link href="assets/css/dashboard.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>
    <div class="dashboard-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="sidebar-brand">
                    <i class="ri-heart-line"></i>
                    <span>Padma Saliar</span>
                </div>
            </div>
            
            <nav class="sidebar-nav">
                <ul>
                    <li>
                        <a href="#dashboard" class="nav-item active" data-section="dashboard">
                            <i class="ri-dashboard-line"></i>
                            <span>Dashboard</span>
                        </a>
                    </li>
                    <li>
                        <a href="#profile" class="nav-item" data-section="profile">
                            <i class="ri-user-line"></i>
                            <span>My Profile</span>
                        </a>
                    </li>
                    <li>
                        <a href="#search" class="nav-item" data-section="search">
                            <i class="ri-search-2-line"></i>
                            <span>Search Profiles</span>
                        </a>
                    </li>
                    <li>
                        <a href="#requests" class="nav-item" data-section="requests">
                            <i class="ri-heart-line"></i>
                            <span>Contact Requests</span>
                        </a>
                    </li>
                    <li>
                        <a href="#matches" class="nav-item" data-section="matches">
                            <i class="ri-user-heart-line"></i>
                            <span>My Matches</span>
                        </a>
                    </li>
                    <li>
                        <a href="#messages" class="nav-item" data-section="messages">
                            <i class="ri-message-line"></i>
                            <span>Messages</span>
                        </a>
                    </li>
                </ul>
            </nav>
            
            <div class="sidebar-footer">
                <button class="btn btn-outline btn-full" onclick="handleLogout()">
                    <i class="ri-logout-box-line"></i>
                    Logout
                </button>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Header -->
            <header class="dashboard-header">
                <div class="header-left">
                    <button class="sidebar-toggle" onclick="toggleSidebar()">
                        <i class="ri-menu-line"></i>
                    </button>
                    <h1 id="page-title">Dashboard</h1>
                </div>
                <div class="header-right">
                    <div class="user-info">
                        <span>Welcome, <?php echo htmlspecialchars($user_name); ?></span>
                        <div class="user-avatar">
                            <i class="ri-user-fill"></i>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Dashboard Content -->
            <div class="content-area">
                <!-- Dashboard Section -->
                <section id="dashboard-section" class="content-section active">
                    <div class="welcome-card">
                        <div class="welcome-content">
                            <h2>Welcome back, <?php echo htmlspecialchars($user_name); ?>!</h2>
                            <p>Find your perfect life partner with Padma Saliar Matrimony</p>
                        </div>
                        <div class="welcome-illustration">
                            <i class="ri-heart-pulse-line"></i>
                        </div>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="ri-user-line"></i>
                            </div>
                            <div class="stat-content">
                                <h3 id="profile-completion">0%</h3>
                                <p>Profile Completion</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="ri-heart-line"></i>
                            </div>
                            <div class="stat-content">
                                <h3 id="received-requests">0</h3>
                                <p>Received Requests</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="ri-send-plane-line"></i>
                            </div>
                            <div class="stat-content">
                                <h3 id="sent-requests">0</h3>
                                <p>Sent Requests</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="ri-group-line"></i>
                            </div>
                            <div class="stat-content">
                                <h3 id="available-profiles">0</h3>
                                <p>Available Profiles</p>
                            </div>
                        </div>
                    </div>

                    <div class="dashboard-grid">
                        <div class="profile-summary-card">
                            <h3>Profile Summary</h3>
                            <div class="profile-summary" id="profile-summary">
                                <!-- Profile summary will be loaded here -->
                            </div>
                            <div class="card-actions">
                                <button class="btn btn-primary" onclick="switchSection('profile')">
                                    <i class="ri-edit-line"></i>
                                    Edit Profile
                                </button>
                            </div>
                        </div>

                        <div class="recent-requests-card">
                            <h3>Recent Requests</h3>
                            <div class="recent-requests" id="recent-requests">
                                <!-- Recent requests will be loaded here -->
                            </div>
                            <div class="card-actions">
                                <button class="btn btn-outline" onclick="switchSection('requests')">
                                    <i class="ri-eye-line"></i>
                                    View All
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="suggested-matches">
                        <h3>Suggested Matches</h3>
                        <div class="matches-grid" id="suggested-matches-grid">
                            <!-- Suggested matches will be loaded here -->
                        </div>
                        <div class="text-center">
                            <button class="btn btn-primary" onclick="switchSection('search')">
                                <i class="ri-search-2-line"></i>
                                Browse More Profiles
                            </button>
                        </div>
                    </div>
                </section>

                <!-- Profile Section -->
                <section id="profile-section" class="content-section">
                    <div class="section-header">
                        <h2>My Profile</h2>
                        <div class="header-actions">
                            <button class="btn btn-primary" onclick="saveProfile()">
                                <i class="ri-save-line"></i>
                                Save Changes
                            </button>
                        </div>
                    </div>

                    <div class="profile-form-container">
                        <form id="profile-form">
                            <!-- Profile Photo Section -->
                            <div class="photo-section">
                                <div class="photo-upload">
                                    <div class="photo-preview" id="photo-preview">
                                        <i class="ri-user-line"></i>
                                    </div>
                                    <div class="photo-actions">
                                        <input type="file" id="photo-input" accept="image/*" style="display: none;">
                                        <button type="button" class="btn btn-outline" onclick="document.getElementById('photo-input').click()">
                                            <i class="ri-camera-line"></i>
                                            Upload Photo
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Basic Information -->
                            <div class="form-section">
                                <h3>Basic Information</h3>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label>Full Name</label>
                                        <input type="text" name="full_name" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Email</label>
                                        <input type="email" name="email" readonly>
                                    </div>
                                    <div class="form-group">
                                        <label>Phone Number</label>
                                        <input type="tel" name="phone_number" readonly>
                                    </div>
                                    <div class="form-group">
                                        <label>Date of Birth</label>
                                        <input type="date" name="date_of_birth" readonly>
                                    </div>
                                    <div class="form-group">
                                        <label>Gender</label>
                                        <select name="gender" disabled>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Birth Place</label>
                                        <input type="text" name="birth_place">
                                    </div>
                                    <div class="form-group">
                                        <label>Birth Time</label>
                                        <input type="time" name="birth_time">
                                    </div>
                                    <div class="form-group">
                                        <label>Gothram</label>
                                        <input type="text" name="gothram">
                                    </div>
                                </div>
                            </div>

                            <!-- Address Information -->
                            <div class="form-section">
                                <h3>Address Information</h3>
                                <div class="form-grid">
                                    <div class="form-group full-width">
                                        <label>Address</label>
                                        <textarea name="address" rows="3"></textarea>
                                    </div>
                                    <div class="form-group">
                                        <label>House Name</label>
                                        <input type="text" name="house_name">
                                    </div>
                                    <div class="form-group">
                                        <label>City</label>
                                        <input type="text" name="city">
                                    </div>
                                    <div class="form-group">
                                        <label>State</label>
                                        <input type="text" name="state">
                                    </div>
                                    <div class="form-group">
                                        <label>Country</label>
                                        <input type="text" name="country" value="India">
                                    </div>
                                </div>
                            </div>

                            <!-- Family Information -->
                            <div class="form-section">
                                <h3>Family Information</h3>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label>Father's Name</label>
                                        <input type="text" name="father_name">
                                    </div>
                                    <div class="form-group">
                                        <label>Mother's Name</label>
                                        <input type="text" name="mother_name">
                                    </div>
                                    <div class="form-group">
                                        <label>Number of Siblings</label>
                                        <input type="number" name="siblings_count" min="0">
                                    </div>
                                    <div class="form-group">
                                        <label>Family Status</label>
                                        <select name="family_status">
                                            <option value="">Select</option>
                                            <option value="Joint">Joint Family</option>
                                            <option value="Nuclear">Nuclear Family</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Family Income</label>
                                        <input type="number" name="family_income" step="0.01">
                                    </div>
                                </div>
                            </div>

                            <!-- Education & Career -->
                            <div class="form-section">
                                <h3>Education & Career</h3>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label>Highest Qualification</label>
                                        <input type="text" name="highest_qualification">
                                    </div>
                                    <div class="form-group">
                                        <label>Institution Name</label>
                                        <input type="text" name="institution_name">
                                    </div>
                                    <div class="form-group">
                                        <label>Graduation Year</label>
                                        <input type="number" name="graduation_year" min="1950" max="2030">
                                    </div>
                                    <div class="form-group">
                                        <label>Occupation</label>
                                        <input type="text" name="occupation">
                                    </div>
                                    <div class="form-group">
                                        <label>Annual Income</label>
                                        <input type="number" name="annual_income" step="0.01">
                                    </div>
                                </div>
                            </div>

                            <!-- Lifestyle & Preferences -->
                            <div class="form-section">
                                <h3>Lifestyle & Preferences</h3>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label>Diet Preference</label>
                                        <select name="diet_preference">
                                            <option value="">Select</option>
                                            <option value="Vegetarian">Vegetarian</option>
                                            <option value="Non-Vegetarian">Non-Vegetarian</option>
                                            <option value="Eggetarian">Eggetarian</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Smoking Habit</label>
                                        <select name="smoking_habit">
                                            <option value="">Select</option>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Drinking Habit</label>
                                        <select name="drinking_habit">
                                            <option value="">Select</option>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Mother Tongue</label>
                                        <input type="text" name="mother_tongue">
                                    </div>
                                    <div class="form-group">
                                        <label>Community Certificate</label>
                                        <input type="text" name="community_certificate">
                                    </div>
                                </div>
                            </div>

                            <!-- About Me -->
                            <div class="form-section">
                                <h3>About Me</h3>
                                <div class="form-group full-width">
                                    <label>Tell us about yourself</label>
                                    <textarea name="about_me" rows="5" placeholder="Write something about yourself..."></textarea>
                                </div>
                            </div>
                        </form>
                    </div>
                </section>

                <!-- Search Section -->
                <section id="search-section" class="content-section">
                    <div class="section-header">
                        <h2>Search Profiles</h2>
                        <div class="header-actions">
                            <button class="btn btn-outline" onclick="clearFilters()">
                                <i class="ri-refresh-line"></i>
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    <div class="search-container">
                        <!-- Search Filters -->
                        <div class="search-filters">
                            <h3>Search Filters</h3>
                            <form id="search-filters-form">
                                <div class="filter-group">
                                    <label>Age Range</label>
                                    <div class="range-inputs">
                                        <input type="number" name="min_age" placeholder="Min" min="18" max="80">
                                        <span>to</span>
                                        <input type="number" name="max_age" placeholder="Max" min="18" max="80">
                                    </div>
                                </div>
                                <div class="filter-group">
                                    <label>City</label>
                                    <input type="text" name="city" placeholder="Enter city">
                                </div>
                                <div class="filter-group">
                                    <label>State</label>
                                    <input type="text" name="state" placeholder="Enter state">
                                </div>
                                <div class="filter-group">
                                    <label>Qualification</label>
                                    <input type="text" name="qualification" placeholder="Enter qualification">
                                </div>
                                <div class="filter-group">
                                    <label>Occupation</label>
                                    <input type="text" name="occupation" placeholder="Enter occupation">
                                </div>
                                <button type="button" class="btn btn-primary btn-full" onclick="searchProfiles()">
                                    <i class="ri-search-2-line"></i>
                                    Search
                                </button>
                            </form>
                        </div>

                        <!-- Search Results -->
                        <div class="search-results">
                            <div class="results-header">
                                <h3>Search Results</h3>
                                <div class="results-count" id="results-count">
                                    <!-- Results count will be shown here -->
                                </div>
                            </div>
                            <div class="profiles-grid" id="search-profiles-grid">
                                <!-- Search results will be loaded here -->
                            </div>
                            <div class="search-pagination" id="search-pagination">
                                <!-- Pagination will be shown here -->
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Contact Requests Section -->
                <section id="requests-section" class="content-section">
                    <div class="section-header">
                        <h2>Contact Requests</h2>
                        <div class="header-actions">
                            <select id="requests-filter" class="filter-select">
                                <option value="received">Received Requests</option>
                                <option value="sent">Sent Requests</option>
                            </select>
                        </div>
                    </div>

                    <div class="requests-container" id="requests-container">
                        <!-- Contact requests will be loaded here -->
                    </div>
                </section>

                <!-- Other sections can be added here -->
                <section id="matches-section" class="content-section">
                    <div class="section-header">
                        <h2>My Matches</h2>
                    </div>
                    <div class="coming-soon">
                        <i class="ri-heart-line"></i>
                        <h3>Coming Soon</h3>
                        <p>This feature is under development and will be available soon!</p>
                    </div>
                </section>

                <section id="messages-section" class="content-section">
                    <div class="section-header">
                        <h2>Messages</h2>
                    </div>
                    <div class="coming-soon">
                        <i class="ri-message-line"></i>
                        <h3>Coming Soon</h3>
                        <p>Messaging feature will be available soon!</p>
                    </div>
                </section>
            </div>
        </main>
    </div>

    <!-- Profile Modal -->
    <div id="profileModal" class="modal">
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h2><i class="ri-user-line"></i> Profile Details</h2>
                <span class="close" onclick="closeModal('profileModal')">&times;</span>
            </div>
            <div class="modal-body" id="profile-modal-content">
                <!-- Profile details will be loaded here -->
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="sendContactRequestFromModal()">
                    <i class="ri-heart-line"></i>
                    Send Contact Request
                </button>
            </div>
        </div>
    </div>

    <script>
        // Pass user data to JavaScript
        window.userData = {
            user_id: <?php echo $user_id; ?>,
            user_name: '<?php echo addslashes($user_name); ?>'
        };
    </script>
    <script src="assets/js/auth.js"></script>
    <script src="assets/js/dashboard.js"></script>
</body>
</html>
