// Admin Dashboard JavaScript
let currentPage = 1;
let currentUsersPage = 1;
let usersPerPage = 10;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();
    
    // Setup navigation
    setupNavigation();
    
    // Setup search and filters
    setupSearchAndFilters();
    
    // Load initial data
    loadDashboardStats();
    loadUsers();
    loadContactRequests();
    
    // Setup charts
    setupCharts();
});

function initializeDashboard() {
    // Check admin authentication
    if (!isAdminAuthenticated()) {
        window.location.href = '../index.php';
        return;
    }
    
    // Load system info
    loadSystemInfo();
}

function isAdminAuthenticated() {
    // This would normally check session or JWT token
    // For now, we'll assume the PHP session check is sufficient
    return true;
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const section = this.dataset.section;
            if (section) {
                switchSection(section);
                
                // Update active nav item
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                
                // Update page title
                const title = this.querySelector('span').textContent;
                document.getElementById('page-title').textContent = title;
            }
        });
    });
}

function switchSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show target section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load section-specific data
        switch (sectionName) {
            case 'dashboard':
                loadDashboardStats();
                break;
            case 'users':
                loadUsers();
                break;
            case 'requests':
                loadContactRequests();
                break;
            case 'reports':
                loadReports();
                break;
        }
    }
}

function setupSearchAndFilters() {
    // User search
    const userSearch = document.getElementById('user-search');
    if (userSearch) {
        let searchTimeout;
        userSearch.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchUsers(this.value);
            }, 500);
        });
    }
    
    // Request filter
    const requestFilter = document.getElementById('request-filter');
    if (requestFilter) {
        requestFilter.addEventListener('change', function() {
            filterRequests(this.value);
        });
    }
}

async function loadDashboardStats() {
    try {
        // Load basic stats
        await Promise.all([
            loadUserStats(),
            loadRequestStats(),
            loadRecentActivity()
        ]);
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showAlert('error', 'Failed to load dashboard statistics');
    }
}

async function loadUserStats() {
    try {
        const response = await fetch('../api.php?action=admin_get_users&limit=1000');
        const result = await response.json();
        
        if (result.success) {
            const users = result.data.users;
            
            // Update stats
            document.getElementById('total-users').textContent = users.length;
            
            // Calculate new users this month
            const thisMonth = new Date();
            thisMonth.setDate(1);
            const newUsers = users.filter(user => 
                new Date(user.created_at) >= thisMonth
            ).length;
            document.getElementById('new-users').textContent = newUsers;
            
            // Update gender stats for reports
            const maleUsers = users.filter(user => user.gender === 'Male').length;
            const femaleUsers = users.filter(user => user.gender === 'Female').length;
            const activeUsers = users.filter(user => user.account_status === 'Active').length;
            const inactiveUsers = users.length - activeUsers;
            
            document.getElementById('male-users').textContent = maleUsers;
            document.getElementById('female-users').textContent = femaleUsers;
            document.getElementById('active-users').textContent = activeUsers;
            document.getElementById('inactive-users').textContent = inactiveUsers;
            
            // Update charts data
            updateGenderChart(maleUsers, femaleUsers);
            updateRegistrationChart(users);
        }
    } catch (error) {
        console.error('Error loading user stats:', error);
    }
}

async function loadRequestStats() {
    try {
        const response = await fetch('../api.php?action=admin_get_requests');
        const result = await response.json();
        
        if (result.success) {
            const requests = result.data;
            
            document.getElementById('total-requests').textContent = requests.length;
            
            // Calculate successful matches (accepted requests)
            const successfulMatches = requests.filter(req => 
                req.status === 'Accepted'
            ).length;
            document.getElementById('successful-matches').textContent = successfulMatches;
            
            // Update success rate chart
            const pendingRequests = requests.filter(req => req.status === 'Pending').length;
            const rejectedRequests = requests.filter(req => req.status === 'Rejected').length;
            updateSuccessRateChart(successfulMatches, pendingRequests, rejectedRequests);
        }
    } catch (error) {
        console.error('Error loading request stats:', error);
    }
}

async function loadUsers(page = 1) {
    try {
        showLoading('users-table-body');
        
        const response = await fetch(`../api.php?action=admin_get_users&page=${page}&limit=${usersPerPage}`);
        const result = await response.json();
        
        if (result.success) {
            displayUsers(result.data.users);
            updateUsersPagination(result.data.page, result.data.pages, result.data.total);
        } else {
            showError('users-table-body', 'Failed to load users');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showError('users-table-body', 'Error loading users');
    }
}

function displayUsers(users) {
    const tbody = document.getElementById('users-table-body');
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">No users found</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.user_id}</td>
            <td>${user.full_name}</td>
            <td>${user.email}</td>
            <td>${user.gender}</td>
            <td>${user.phone_number || 'N/A'}</td>
            <td>
                <span class="status-badge status-${user.account_status.toLowerCase()}">
                    ${user.account_status}
                </span>
            </td>
            <td>${formatDate(user.created_at)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-success" onclick="updateUserStatus(${user.user_id}, 'Active')" 
                            ${user.account_status === 'Active' ? 'disabled' : ''}>
                        <i class="ri-check-line"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="updateUserStatus(${user.user_id}, 'Suspended')"
                            ${user.account_status === 'Suspended' ? 'disabled' : ''}>
                        <i class="ri-forbid-line"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.user_id})">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateUsersPagination(currentPage, totalPages, totalUsers) {
    const paginationContainer = document.getElementById('users-pagination');
    
    let paginationHTML = `
        <button onclick="loadUsers(1)" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="ri-skip-back-line"></i>
        </button>
        <button onclick="loadUsers(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="ri-arrow-left-line"></i>
        </button>
    `;
    
    // Show page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button onclick="loadUsers(${i})" ${i === currentPage ? 'class="active"' : ''}>
                ${i}
            </button>
        `;
    }
    
    paginationHTML += `
        <button onclick="loadUsers(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="ri-arrow-right-line"></i>
        </button>
        <button onclick="loadUsers(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="ri-skip-forward-line"></i>
        </button>
        <span style="margin-left: 1rem; color: var(--text-secondary);">
            Total: ${totalUsers} users
        </span>
    `;
    
    paginationContainer.innerHTML = paginationHTML;
}

async function loadContactRequests() {
    try {
        showLoading('requests-table-body');
        
        const response = await fetch('../api.php?action=admin_get_requests');
        const result = await response.json();
        
        if (result.success) {
            displayContactRequests(result.data);
        } else {
            showError('requests-table-body', 'Failed to load contact requests');
        }
    } catch (error) {
        console.error('Error loading contact requests:', error);
        showError('requests-table-body', 'Error loading contact requests');
    }
}

function displayContactRequests(requests) {
    const tbody = document.getElementById('requests-table-body');
    
    if (requests.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">No contact requests found</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = requests.map(request => `
        <tr>
            <td>${request.request_id}</td>
            <td>${request.sender_name}</td>
            <td>${request.receiver_name}</td>
            <td>${request.message ? truncateText(request.message, 50) : 'No message'}</td>
            <td>
                <span class="status-badge status-${request.status.toLowerCase()}">
                    ${request.status}
                </span>
            </td>
            <td>${formatDate(request.sent_at)}</td>
            <td>${request.responded_at ? formatDate(request.responded_at) : 'N/A'}</td>
        </tr>
    `).join('');
}

async function loadRecentActivity() {
    // Mock recent activity data
    const activities = [
        {
            icon: 'ri-user-add-line',
            text: 'New user registered: John Doe',
            time: '2 minutes ago'
        },
        {
            icon: 'ri-heart-line',
            text: 'Contact request sent by Jane Smith',
            time: '15 minutes ago'
        },
        {
            icon: 'ri-check-line',
            text: 'Contact request accepted',
            time: '1 hour ago'
        },
        {
            icon: 'ri-user-line',
            text: 'Profile updated by Mike Johnson',
            time: '2 hours ago'
        }
    ];
    
    const activityList = document.getElementById('recent-activity-list');
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <p>${activity.text}</p>
                <small>${activity.time}</small>
            </div>
        </div>
    `).join('');
}

// User management functions
async function updateUserStatus(userId, status) {
    try {
        const result = await Swal.fire({
            title: 'Update User Status',
            text: `Are you sure you want to ${status.toLowerCase()} this user?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#e91e63',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, update it!'
        });
        
        if (result.isConfirmed) {
            const response = await fetch('../api.php?action=admin_update_user_status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    status: status
                })
            });
            
            const apiResult = await response.json();
            
            if (apiResult.success) {
                showAlert('success', 'User status updated successfully');
                loadUsers(currentUsersPage);
            } else {
                showAlert('error', apiResult.message);
            }
        }
    } catch (error) {
        console.error('Error updating user status:', error);
        showAlert('error', 'Failed to update user status');
    }
}

async function deleteUser(userId) {
    try {
        const result = await Swal.fire({
            title: 'Delete User',
            text: 'Are you sure you want to delete this user? This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f44336',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });
        
        if (result.isConfirmed) {
            const response = await fetch('../api.php?action=delete_user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId
                })
            });
            
            const apiResult = await response.json();
            
            if (apiResult.success) {
                showAlert('success', 'User deleted successfully');
                loadUsers(currentUsersPage);
                loadDashboardStats(); // Refresh stats
            } else {
                showAlert('error', apiResult.message);
            }
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showAlert('error', 'Failed to delete user');
    }
}

// Search and filter functions
async function searchUsers(query) {
    // This would typically call an API endpoint with search parameters
    // For now, we'll reload users and implement client-side filtering
    console.log('Searching users:', query);
    // Implementation would depend on backend search capability
}

function filterRequests(status) {
    const rows = document.querySelectorAll('#requests-table-body tr');
    
    rows.forEach(row => {
        if (status === '') {
            row.style.display = '';
        } else {
            const statusCell = row.querySelector('.status-badge');
            if (statusCell && statusCell.textContent.trim() === status) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}

// Chart functions
function setupCharts() {
    // Initialize empty charts
    updateGenderChart(0, 0);
    updateRegistrationChart([]);
    updateSuccessRateChart(0, 0, 0);
}

function updateGenderChart(maleCount, femaleCount) {
    const ctx = document.getElementById('genderChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Male', 'Female'],
            datasets: [{
                data: [maleCount, femaleCount],
                backgroundColor: ['#e91e63', '#ff4081'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateRegistrationChart(users) {
    const ctx = document.getElementById('registrationChart');
    if (!ctx) return;
    
    // Group users by month
    const monthData = {};
    const last6Months = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = date.toISOString().slice(0, 7);
        monthData[monthKey] = 0;
        last6Months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    }
    
    users.forEach(user => {
        const userMonth = user.created_at.slice(0, 7);
        if (monthData.hasOwnProperty(userMonth)) {
            monthData[userMonth]++;
        }
    });
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: last6Months,
            datasets: [{
                label: 'New Registrations',
                data: Object.values(monthData),
                borderColor: '#e91e63',
                backgroundColor: 'rgba(233, 30, 99, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function updateSuccessRateChart(accepted, pending, rejected) {
    const ctx = document.getElementById('successRateChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Accepted', 'Pending', 'Rejected'],
            datasets: [{
                data: [accepted, pending, rejected],
                backgroundColor: ['#4caf50', '#ffc107', '#f44336'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Utility functions
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('collapsed');
}

function refreshUsers() {
    loadUsers(currentUsersPage);
    showAlert('info', 'Users list refreshed');
}

function refreshRequests() {
    loadContactRequests();
    showAlert('info', 'Contact requests refreshed');
}

async function loadSystemInfo() {
    try {
        // This would typically fetch system information from an API
        // For now, we'll just set a placeholder
        document.getElementById('mysql-version').textContent = '8.0.0';
    } catch (error) {
        console.error('Error loading system info:', error);
    }
}

function loadReports() {
    // Reports are already loaded with dashboard stats
    console.log('Reports section loaded');
}

async function handleAdminLogout() {
    try {
        const result = await Swal.fire({
            title: 'Logout',
            text: 'Are you sure you want to logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#e91e63',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, logout'
        });
        
        if (result.isConfirmed) {
            const response = await fetch('../api.php?action=logout', {
                method: 'POST'
            });
            
            const apiResult = await response.json();
            
            if (apiResult.success) {
                showAlert('success', 'Logged out successfully');
                setTimeout(() => {
                    window.location.href = '../index.php';
                }, 1500);
            }
        }
    } catch (error) {
        console.error('Logout error:', error);
        showAlert('error', 'Failed to logout');
    }
}

function showComingSoon() {
    showAlert('info', 'This feature is coming soon!');
}

// Utility functions
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <tr>
                <td colspan="100%" class="text-center">
                    <div class="loading-spinner"></div>
                    Loading...
                </td>
            </tr>
        `;
    }
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <tr>
                <td colspan="100%" class="text-center" style="color: var(--error-color);">
                    <i class="ri-error-warning-line"></i>
                    ${message}
                </td>
            </tr>
        `;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
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
