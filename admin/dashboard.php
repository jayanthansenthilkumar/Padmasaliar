<?php
require_once '../config.php';

// Check if admin is logged in
if (!isAdmin()) {
    redirectTo('../index.php');
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Padma Saliar Matrimony</title>
    <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
    <link href="../assets/css/style.css" rel="stylesheet">
    <link href="../assets/css/dashboard.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="dashboard-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="sidebar-brand">
                    <i class="ri-admin-line"></i>
                    <span>Admin Panel</span>
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
                        <a href="#users" class="nav-item" data-section="users">
                            <i class="ri-user-line"></i>
                            <span>Users</span>
                        </a>
                    </li>
                    <li>
                        <a href="#requests" class="nav-item" data-section="requests">
                            <i class="ri-heart-line"></i>
                            <span>Contact Requests</span>
                        </a>
                    </li>
                    <li>
                        <a href="#reports" class="nav-item" data-section="reports">
                            <i class="ri-bar-chart-line"></i>
                            <span>Reports</span>
                        </a>
                    </li>
                    <li>
                        <a href="#settings" class="nav-item" data-section="settings">
                            <i class="ri-settings-line"></i>
                            <span>Settings</span>
                        </a>
                    </li>
                </ul>
            </nav>
            
            <div class="sidebar-footer">
                <button class="btn btn-outline btn-full" onclick="handleAdminLogout()">
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
                    <div class="admin-info">
                        <span>Welcome, Admin</span>
                        <i class="ri-admin-fill"></i>
                    </div>
                </div>
            </header>

            <!-- Dashboard Content -->
            <div class="content-area">
                <!-- Dashboard Section -->
                <section id="dashboard-section" class="content-section active">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="ri-user-line"></i>
                            </div>
                            <div class="stat-content">
                                <h3 id="total-users">0</h3>
                                <p>Total Users</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="ri-user-add-line"></i>
                            </div>
                            <div class="stat-content">
                                <h3 id="new-users">0</h3>
                                <p>New Users (This Month)</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="ri-heart-line"></i>
                            </div>
                            <div class="stat-content">
                                <h3 id="total-requests">0</h3>
                                <p>Contact Requests</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="ri-check-line"></i>
                            </div>
                            <div class="stat-content">
                                <h3 id="successful-matches">0</h3>
                                <p>Successful Matches</p>
                            </div>
                        </div>
                    </div>

                    <div class="charts-grid">
                        <div class="chart-card">
                            <h3>User Registration Trends</h3>
                            <canvas id="registrationChart"></canvas>
                        </div>
                        <div class="chart-card">
                            <h3>Gender Distribution</h3>
                            <canvas id="genderChart"></canvas>
                        </div>
                    </div>

                    <div class="recent-activity">
                        <h3>Recent Activity</h3>
                        <div class="activity-list" id="recent-activity-list">
                            <!-- Activity items will be loaded here -->
                        </div>
                    </div>
                </section>

                <!-- Users Section -->
                <section id="users-section" class="content-section">
                    <div class="section-header">
                        <h2>User Management</h2>
                        <div class="header-actions">
                            <input type="text" placeholder="Search users..." id="user-search" class="search-input">
                            <button class="btn btn-primary" onclick="refreshUsers()">
                                <i class="ri-refresh-line"></i>
                                Refresh
                            </button>
                        </div>
                    </div>

                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Gender</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="users-table-body">
                                <!-- Users will be loaded here -->
                            </tbody>
                        </table>
                    </div>

                    <div class="pagination" id="users-pagination">
                        <!-- Pagination will be generated here -->
                    </div>
                </section>

                <!-- Contact Requests Section -->
                <section id="requests-section" class="content-section">
                    <div class="section-header">
                        <h2>Contact Requests</h2>
                        <div class="header-actions">
                            <select id="request-filter" class="filter-select">
                                <option value="">All Requests</option>
                                <option value="Pending">Pending</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                            <button class="btn btn-primary" onclick="refreshRequests()">
                                <i class="ri-refresh-line"></i>
                                Refresh
                            </button>
                        </div>
                    </div>

                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Sender</th>
                                    <th>Receiver</th>
                                    <th>Message</th>
                                    <th>Status</th>
                                    <th>Sent At</th>
                                    <th>Response Date</th>
                                </tr>
                            </thead>
                            <tbody id="requests-table-body">
                                <!-- Requests will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </section>

                <!-- Reports Section -->
                <section id="reports-section" class="content-section">
                    <div class="section-header">
                        <h2>Reports & Analytics</h2>
                    </div>

                    <div class="reports-grid">
                        <div class="report-card">
                            <h3>User Statistics</h3>
                            <div class="report-stats">
                                <div class="report-stat">
                                    <span class="stat-label">Male Users:</span>
                                    <span class="stat-value" id="male-users">0</span>
                                </div>
                                <div class="report-stat">
                                    <span class="stat-label">Female Users:</span>
                                    <span class="stat-value" id="female-users">0</span>
                                </div>
                                <div class="report-stat">
                                    <span class="stat-label">Active Users:</span>
                                    <span class="stat-value" id="active-users">0</span>
                                </div>
                                <div class="report-stat">
                                    <span class="stat-label">Inactive Users:</span>
                                    <span class="stat-value" id="inactive-users">0</span>
                                </div>
                            </div>
                        </div>

                        <div class="report-card">
                            <h3>Success Rate</h3>
                            <div class="success-rate-chart">
                                <canvas id="successRateChart"></canvas>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Settings Section -->
                <section id="settings-section" class="content-section">
                    <div class="section-header">
                        <h2>Settings</h2>
                    </div>

                    <div class="settings-grid">
                        <div class="settings-card">
                            <h3>Application Settings</h3>
                            <form id="app-settings-form">
                                <div class="form-group">
                                    <label>Application Name</label>
                                    <input type="text" value="Padma Saliar Matrimony" readonly>
                                </div>
                                <div class="form-group">
                                    <label>Admin Email</label>
                                    <input type="email" value="<?php echo ADMIN_EMAIL; ?>" readonly>
                                </div>
                                <div class="form-group">
                                    <label>Max File Size (MB)</label>
                                    <input type="number" value="5" min="1" max="10">
                                </div>
                                <button type="button" class="btn btn-primary" onclick="showComingSoon()">
                                    Update Settings
                                </button>
                            </form>
                        </div>

                        <div class="settings-card">
                            <h3>System Information</h3>
                            <div class="system-info">
                                <div class="info-item">
                                    <span class="info-label">PHP Version:</span>
                                    <span class="info-value"><?php echo phpversion(); ?></span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">MySQL Version:</span>
                                    <span class="info-value" id="mysql-version">Loading...</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Server:</span>
                                    <span class="info-value"><?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'; ?></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    </div>

    <script src="../assets/js/admin.js"></script>
</body>
</html>
