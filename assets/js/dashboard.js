// User Dashboard JavaScript
let currentSearchPage = 1;
let selectedProfileId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeUserDashboard();
    
    // Setup navigation
    setupUserNavigation();
    
    // Load initial data
    loadDashboardData();
    
    // Setup event listeners
    setupEventListeners();
});

function initializeUserDashboard() {
    // Check user authentication
    if (!window.userData || !window.userData.user_id) {
        window.location.href = 'index.php';
        return;
    }
    
    console.log('User dashboard initialized for:', window.userData.user_name);
}

function setupUserNavigation() {
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
                loadDashboardData();
                break;
            case 'profile':
                loadProfileData();
                break;
            case 'search':
                loadSearchProfiles();
                break;
            case 'requests':
                loadContactRequests();
                break;
        }
    }
}

function setupEventListeners() {
    // Photo upload
    const photoInput = document.getElementById('photo-input');
    if (photoInput) {
        photoInput.addEventListener('change', handlePhotoUpload);
    }
    
    // Profile form
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('input', markFormAsChanged);
    }
    
    // Search filters
    const searchForm = document.getElementById('search-filters-form');
    if (searchForm) {
        const inputs = searchForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('change', debounce(searchProfiles, 500));
        });
    }
    
    // Requests filter
    const requestsFilter = document.getElementById('requests-filter');
    if (requestsFilter) {
        requestsFilter.addEventListener('change', function() {
            loadContactRequests(this.value);
        });
    }
}

async function loadDashboardData() {
    try {
        // Load dashboard stats
        await loadDashboardStats();
        
        // Load profile summary
        await loadProfileSummary();
        
        // Load recent requests
        await loadRecentRequests();
        
        // Load suggested matches
        await loadSuggestedMatches();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showAlert('error', 'Failed to load dashboard data');
    }
}

async function loadDashboardStats() {
    try {
        const response = await fetch('api.php?action=get_dashboard_stats');
        const result = await response.json();
        
        if (result.success) {
            const stats = result.data;
            
            document.getElementById('profile-completion').textContent = stats.profile_completion + '%';
            document.getElementById('received-requests').textContent = stats.received_requests;
            document.getElementById('sent-requests').textContent = stats.sent_requests;
            document.getElementById('available-profiles').textContent = stats.available_profiles;
            
            // Update progress bar for profile completion
            updateProfileCompletionBar(stats.profile_completion);
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

function updateProfileCompletionBar(percentage) {
    const statCard = document.querySelector('#profile-completion').closest('.stat-card');
    
    // Add progress bar if it doesn't exist
    if (!statCard.querySelector('.progress-bar')) {
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.innerHTML = `<div class="progress-fill" style="width: ${percentage}%"></div>`;
        statCard.appendChild(progressBar);
        
        // Add CSS for progress bar
        if (!document.querySelector('#progress-bar-styles')) {
            const style = document.createElement('style');
            style.id = 'progress-bar-styles';
            style.textContent = `
                .progress-bar {
                    width: 100%;
                    height: 4px;
                    background: var(--border-color);
                    border-radius: 2px;
                    margin-top: 0.5rem;
                    overflow: hidden;
                }
                .progress-fill {
                    height: 100%;
                    background: var(--gradient-primary);
                    transition: width 0.3s ease;
                }
            `;
            document.head.appendChild(style);
        }
    } else {
        // Update existing progress bar
        const progressFill = statCard.querySelector('.progress-fill');
        progressFill.style.width = percentage + '%';
    }
}

async function loadProfileSummary() {
    try {
        const response = await fetch(`api.php?action=get_profile&user_id=${window.userData.user_id}`);
        const result = await response.json();
        
        if (result.success) {
            const profile = result.data;
            displayProfileSummary(profile);
        }
    } catch (error) {
        console.error('Error loading profile summary:', error);
    }
}

function displayProfileSummary(profile) {
    const summaryContainer = document.getElementById('profile-summary');
    
    const age = calculateAge(profile.date_of_birth);
    const location = [profile.city, profile.state].filter(Boolean).join(', ');
    
    summaryContainer.innerHTML = `
        <div class="profile-summary-item">
            <div class="profile-photo">
                ${profile.profile_photo_url ? 
                    `<img src="${profile.profile_photo_url}" alt="Profile Photo">` : 
                    '<i class="ri-user-line"></i>'
                }
            </div>
            <div class="profile-info">
                <h4>${profile.full_name}</h4>
                <p class="profile-details">
                    <span><i class="ri-calendar-line"></i> ${age} years</span>
                    ${location ? `<span><i class="ri-map-pin-line"></i> ${location}</span>` : ''}
                    ${profile.occupation ? `<span><i class="ri-briefcase-line"></i> ${profile.occupation}</span>` : ''}
                </p>
                ${profile.about_me ? `<p class="profile-about">${truncateText(profile.about_me, 100)}</p>` : ''}
            </div>
        </div>
    `;
}

async function loadRecentRequests() {
    try {
        const response = await fetch('api.php?action=get_contact_requests&type=received');
        const result = await response.json();
        
        if (result.success) {
            const requests = result.data.slice(0, 3); // Show only 3 recent requests
            displayRecentRequests(requests);
        }
    } catch (error) {
        console.error('Error loading recent requests:', error);
    }
}

function displayRecentRequests(requests) {
    const container = document.getElementById('recent-requests');
    
    if (requests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="ri-heart-line"></i>
                <p>No recent requests</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = requests.map(request => `
        <div class="request-item">
            <div class="request-photo">
                ${request.profile_photo_url ? 
                    `<img src="${request.profile_photo_url}" alt="Profile Photo">` : 
                    '<i class="ri-user-line"></i>'
                }
            </div>
            <div class="request-info">
                <h4>${request.full_name}</h4>
                <p>${request.city}, ${request.state}</p>
                <small>${formatTimeAgo(request.sent_at)}</small>
            </div>
            <div class="request-actions">
                ${request.status === 'Pending' ? `
                    <button class="btn btn-sm btn-success" onclick="respondToRequest(${request.request_id}, 'Accepted')">
                        <i class="ri-check-line"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="respondToRequest(${request.request_id}, 'Rejected')">
                        <i class="ri-close-line"></i>
                    </button>
                ` : `
                    <span class="status-badge status-${request.status.toLowerCase()}">${request.status}</span>
                `}
            </div>
        </div>
    `).join('');
}

async function loadSuggestedMatches() {
    try {
        const response = await fetch('api.php?action=search_profiles&limit=6');
        const result = await response.json();
        
        if (result.success) {
            displaySuggestedMatches(result.data.profiles);
        }
    } catch (error) {
        console.error('Error loading suggested matches:', error);
    }
}

function displaySuggestedMatches(profiles) {
    const container = document.getElementById('suggested-matches-grid');
    
    if (profiles.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="ri-user-heart-line"></i>
                <p>No suggested matches available</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = profiles.map(profile => `
        <div class="profile-card" onclick="viewProfile(${profile.user_id})">
            <div class="profile-card-photo">
                ${profile.profile_photo_url ? 
                    `<img src="${profile.profile_photo_url}" alt="Profile Photo">` : 
                    '<i class="ri-user-line"></i>'
                }
            </div>
            <div class="profile-card-info">
                <h4>${profile.full_name}</h4>
                <p class="profile-age">${profile.age} years</p>
                <p class="profile-location">${profile.city}, ${profile.state}</p>
                <p class="profile-qualification">${profile.highest_qualification || 'Not specified'}</p>
                <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); sendContactRequest(${profile.user_id})">
                    <i class="ri-heart-line"></i>
                    Connect
                </button>
            </div>
        </div>
    `).join('');
}

async function loadProfileData() {
    try {
        const response = await fetch(`api.php?action=get_profile&user_id=${window.userData.user_id}`);
        const result = await response.json();
        
        if (result.success) {
            populateProfileForm(result.data);
        }
    } catch (error) {
        console.error('Error loading profile data:', error);
        showAlert('error', 'Failed to load profile data');
    }
}

function populateProfileForm(profile) {
    const form = document.getElementById('profile-form');
    const formData = new FormData();
    
    Object.keys(profile).forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input && profile[key] !== null) {
            input.value = profile[key];
        }
    });
    
    // Update photo preview
    const photoPreview = document.getElementById('photo-preview');
    if (profile.profile_photo_url) {
        photoPreview.innerHTML = `<img src="${profile.profile_photo_url}" alt="Profile Photo">`;
    }
    
    // Mark form as clean
    form.dataset.changed = 'false';
}

async function saveProfile() {
    const form = document.getElementById('profile-form');
    const formData = new FormData(form);
    
    // Convert FormData to JSON
    const profileData = {};
    formData.forEach((value, key) => {
        if (value.trim() !== '') {
            profileData[key] = value;
        }
    });
    
    try {
        const response = await fetch('api.php?action=update_profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('success', 'Profile updated successfully!');
            form.dataset.changed = 'false';
            
            // Refresh dashboard data
            if (document.getElementById('dashboard-section').classList.contains('active')) {
                loadDashboardData();
            }
        } else {
            showAlert('error', result.message);
        }
    } catch (error) {
        console.error('Error saving profile:', error);
        showAlert('error', 'Failed to save profile');
    }
}

async function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
        showAlert('error', 'Please select a valid image file');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showAlert('error', 'File size must be less than 5MB');
        return;
    }
    
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('is_profile', 'true');
    
    try {
        showAlert('info', 'Uploading photo...', 'Please wait');
        
        const response = await fetch('api.php?action=upload_photo', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('success', 'Photo uploaded successfully!');
            
            // Update photo preview
            const photoPreview = document.getElementById('photo-preview');
            photoPreview.innerHTML = `<img src="${result.data.photo_url}" alt="Profile Photo">`;
            
            // Refresh dashboard if active
            if (document.getElementById('dashboard-section').classList.contains('active')) {
                loadDashboardData();
            }
        } else {
            showAlert('error', result.message);
        }
    } catch (error) {
        console.error('Error uploading photo:', error);
        showAlert('error', 'Failed to upload photo');
    }
}

async function searchProfiles(page = 1) {
    const form = document.getElementById('search-filters-form');
    const formData = new FormData(form);
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', 12);
    
    formData.forEach((value, key) => {
        if (value.trim() !== '') {
            params.append(key, value);
        }
    });
    
    try {
        showSearchLoading();
        
        const response = await fetch(`api.php?action=search_profiles&${params.toString()}`);
        const result = await response.json();
        
        if (result.success) {
            displaySearchResults(result.data);
            updateSearchPagination(result.data);
        } else {
            showSearchError(result.message);
        }
    } catch (error) {
        console.error('Error searching profiles:', error);
        showSearchError('Failed to search profiles');
    }
}

function displaySearchResults(data) {
    const container = document.getElementById('search-profiles-grid');
    const countElement = document.getElementById('results-count');
    
    countElement.textContent = `${data.total} profiles found`;
    
    if (data.profiles.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="ri-search-line"></i>
                <h3>No profiles found</h3>
                <p>Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = data.profiles.map(profile => `
        <div class="profile-card" onclick="viewProfile(${profile.user_id})">
            <div class="profile-card-photo">
                ${profile.profile_photo_url ? 
                    `<img src="${profile.profile_photo_url}" alt="Profile Photo">` : 
                    '<i class="ri-user-line"></i>'
                }
            </div>
            <div class="profile-card-info">
                <h4>${profile.full_name}</h4>
                <p class="profile-age">${profile.age} years</p>
                <p class="profile-location">${profile.city}, ${profile.state}</p>
                <p class="profile-qualification">${profile.highest_qualification || 'Not specified'}</p>
                <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); sendContactRequest(${profile.user_id})">
                    <i class="ri-heart-line"></i>
                    Connect
                </button>
            </div>
        </div>
    `).join('');
}

function updateSearchPagination(data) {
    const container = document.getElementById('search-pagination');
    
    if (data.pages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let paginationHTML = `
        <button onclick="searchProfiles(1)" ${data.page === 1 ? 'disabled' : ''}>
            <i class="ri-skip-back-line"></i>
        </button>
        <button onclick="searchProfiles(${data.page - 1})" ${data.page === 1 ? 'disabled' : ''}>
            <i class="ri-arrow-left-line"></i>
        </button>
    `;
    
    // Show page numbers
    const startPage = Math.max(1, data.page - 2);
    const endPage = Math.min(data.pages, data.page + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button onclick="searchProfiles(${i})" ${i === data.page ? 'class="active"' : ''}>
                ${i}
            </button>
        `;
    }
    
    paginationHTML += `
        <button onclick="searchProfiles(${data.page + 1})" ${data.page === data.pages ? 'disabled' : ''}>
            <i class="ri-arrow-right-line"></i>
        </button>
        <button onclick="searchProfiles(${data.pages})" ${data.page === data.pages ? 'disabled' : ''}>
            <i class="ri-skip-forward-line"></i>
        </button>
    `;
    
    container.innerHTML = paginationHTML;
}

async function loadContactRequests(type = 'received') {
    try {
        const response = await fetch(`api.php?action=get_contact_requests&type=${type}`);
        const result = await response.json();
        
        if (result.success) {
            displayContactRequests(result.data, type);
        }
    } catch (error) {
        console.error('Error loading contact requests:', error);
        showAlert('error', 'Failed to load contact requests');
    }
}

function displayContactRequests(requests, type) {
    const container = document.getElementById('requests-container');
    
    if (requests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="ri-heart-line"></i>
                <h3>No ${type} requests</h3>
                <p>You haven't ${type === 'received' ? 'received' : 'sent'} any contact requests yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = requests.map(request => `
        <div class="request-card">
            <div class="request-photo">
                ${request.profile_photo_url ? 
                    `<img src="${request.profile_photo_url}" alt="Profile Photo">` : 
                    '<i class="ri-user-line"></i>'
                }
            </div>
            <div class="request-content">
                <div class="request-header">
                    <h4>${request.full_name}</h4>
                    <span class="status-badge status-${request.status.toLowerCase()}">${request.status}</span>
                </div>
                <p class="request-location">${request.city}, ${request.state}</p>
                <p class="request-contact">${request.email} | ${request.phone_number}</p>
                ${request.message ? `<p class="request-message">"${request.message}"</p>` : ''}
                <small class="request-time">
                    ${type === 'received' ? 'Sent' : 'Received'} ${formatTimeAgo(request.sent_at)}
                </small>
            </div>
            <div class="request-actions">
                ${type === 'received' && request.status === 'Pending' ? `
                    <button class="btn btn-success btn-sm" onclick="respondToRequest(${request.request_id}, 'Accepted')">
                        <i class="ri-check-line"></i>
                        Accept
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="respondToRequest(${request.request_id}, 'Rejected')">
                        <i class="ri-close-line"></i>
                        Reject
                    </button>
                ` : `
                    <button class="btn btn-outline btn-sm" onclick="viewProfile(${type === 'received' ? request.sender_id : request.receiver_id})">
                        <i class="ri-eye-line"></i>
                        View Profile
                    </button>
                `}
            </div>
        </div>
    `).join('');
}

// Profile interaction functions
async function viewProfile(userId) {
    try {
        const response = await fetch(`api.php?action=get_profile&user_id=${userId}`);
        const result = await response.json();
        
        if (result.success) {
            displayProfileModal(result.data);
            selectedProfileId = userId;
        } else {
            showAlert('error', 'Failed to load profile');
        }
    } catch (error) {
        console.error('Error viewing profile:', error);
        showAlert('error', 'Failed to load profile');
    }
}

function displayProfileModal(profile) {
    const modalContent = document.getElementById('profile-modal-content');
    const age = calculateAge(profile.date_of_birth);
    
    modalContent.innerHTML = `
        <div class="profile-modal-header">
            <div class="profile-modal-photo">
                ${profile.profile_photo_url ? 
                    `<img src="${profile.profile_photo_url}" alt="Profile Photo">` : 
                    '<i class="ri-user-line"></i>'
                }
            </div>
            <div class="profile-modal-basic">
                <h3>${profile.full_name}</h3>
                <p class="profile-age">${age} years old</p>
                <p class="profile-location">${[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}</p>
            </div>
        </div>
        
        <div class="profile-modal-details">
            ${profile.about_me ? `
                <div class="profile-section">
                    <h4>About</h4>
                    <p>${profile.about_me}</p>
                </div>
            ` : ''}
            
            <div class="profile-section">
                <h4>Basic Information</h4>
                <div class="profile-details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Gender:</span>
                        <span class="detail-value">${profile.gender}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Date of Birth:</span>
                        <span class="detail-value">${formatDate(profile.date_of_birth)}</span>
                    </div>
                    ${profile.mother_tongue ? `
                        <div class="detail-item">
                            <span class="detail-label">Mother Tongue:</span>
                            <span class="detail-value">${profile.mother_tongue}</span>
                        </div>
                    ` : ''}
                    ${profile.diet_preference ? `
                        <div class="detail-item">
                            <span class="detail-label">Diet:</span>
                            <span class="detail-value">${profile.diet_preference}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            ${profile.highest_qualification || profile.occupation ? `
                <div class="profile-section">
                    <h4>Education & Career</h4>
                    <div class="profile-details-grid">
                        ${profile.highest_qualification ? `
                            <div class="detail-item">
                                <span class="detail-label">Education:</span>
                                <span class="detail-value">${profile.highest_qualification}</span>
                            </div>
                        ` : ''}
                        ${profile.occupation ? `
                            <div class="detail-item">
                                <span class="detail-label">Occupation:</span>
                                <span class="detail-value">${profile.occupation}</span>
                            </div>
                        ` : ''}
                        ${profile.annual_income ? `
                            <div class="detail-item">
                                <span class="detail-label">Annual Income:</span>
                                <span class="detail-value">₹${formatNumber(profile.annual_income)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
            
            ${profile.father_name || profile.mother_name ? `
                <div class="profile-section">
                    <h4>Family</h4>
                    <div class="profile-details-grid">
                        ${profile.father_name ? `
                            <div class="detail-item">
                                <span class="detail-label">Father's Name:</span>
                                <span class="detail-value">${profile.father_name}</span>
                            </div>
                        ` : ''}
                        ${profile.mother_name ? `
                            <div class="detail-item">
                                <span class="detail-label">Mother's Name:</span>
                                <span class="detail-value">${profile.mother_name}</span>
                            </div>
                        ` : ''}
                        ${profile.family_status ? `
                            <div class="detail-item">
                                <span class="detail-label">Family Type:</span>
                                <span class="detail-value">${profile.family_status}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    showModal('profileModal');
}

async function sendContactRequest(receiverId, message = '') {
    try {
        const { value: requestMessage } = await Swal.fire({
            title: 'Send Contact Request',
            input: 'textarea',
            inputLabel: 'Message (Optional)',
            inputPlaceholder: 'Write a message...',
            inputValue: message,
            showCancelButton: true,
            confirmButtonText: 'Send Request',
            confirmButtonColor: '#e91e63',
            cancelButtonColor: '#6c757d',
            inputValidator: (value) => {
                if (value && value.length > 500) {
                    return 'Message is too long (max 500 characters)';
                }
            }
        });
        
        if (requestMessage !== undefined) {
            const response = await fetch('api.php?action=send_contact_request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    receiver_id: receiverId,
                    message: requestMessage || ''
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showAlert('success', 'Contact request sent successfully!');
                
                // Refresh dashboard stats
                loadDashboardStats();
            } else {
                showAlert('error', result.message);
            }
        }
    } catch (error) {
        console.error('Error sending contact request:', error);
        showAlert('error', 'Failed to send contact request');
    }
}

function sendContactRequestFromModal() {
    if (selectedProfileId) {
        closeModal('profileModal');
        sendContactRequest(selectedProfileId);
    }
}

async function respondToRequest(requestId, response) {
    try {
        const result = await Swal.fire({
            title: `${response} Request`,
            text: `Are you sure you want to ${response.toLowerCase()} this contact request?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: response === 'Accepted' ? '#4caf50' : '#f44336',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Yes, ${response.toLowerCase()} it!`
        });
        
        if (result.isConfirmed) {
            const apiResponse = await fetch('api.php?action=respond_contact_request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    request_id: requestId,
                    response: response
                })
            });
            
            const apiResult = await apiResponse.json();
            
            if (apiResult.success) {
                showAlert('success', `Request ${response.toLowerCase()} successfully!`);
                
                // Refresh requests and dashboard
                const activeFilter = document.getElementById('requests-filter').value;
                loadContactRequests(activeFilter);
                loadDashboardStats();
            } else {
                showAlert('error', apiResult.message);
            }
        }
    } catch (error) {
        console.error('Error responding to request:', error);
        showAlert('error', 'Failed to respond to request');
    }
}

// Utility functions
function clearFilters() {
    const form = document.getElementById('search-filters-form');
    form.reset();
    searchProfiles();
}

function loadSearchProfiles() {
    searchProfiles(1);
}

function markFormAsChanged() {
    const form = document.getElementById('profile-form');
    form.dataset.changed = 'true';
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('collapsed');
}

function showSearchLoading() {
    const container = document.getElementById('search-profiles-grid');
    container.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            Searching profiles...
        </div>
    `;
}

function showSearchError(message) {
    const container = document.getElementById('search-profiles-grid');
    container.innerHTML = `
        <div class="empty-state">
            <i class="ri-error-warning-line"></i>
            <h3>Search Error</h3>
            <p>${message}</p>
        </div>
    `;
}

function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = (now - date) / 1000;
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatNumber(num) {
    return new Intl.NumberFormat('en-IN').format(num);
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        selectedProfileId = null;
    }
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

// Alert function
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
