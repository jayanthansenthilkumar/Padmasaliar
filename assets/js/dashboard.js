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
        
        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            profile: 'My Profile',
            search: 'Search Profiles',
            requests: 'Contact Requests',
            matches: 'My Matches',
            messages: 'Messages'
        };
        
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = titles[sectionName] || 'Dashboard';
        }
        
        // Load section-specific data
        switch (sectionName) {
            case 'dashboard':
                loadDashboardData();
                break;
            case 'profile':
                loadProfileData();
                break;
            case 'search':
                searchProfiles();
                break;
            case 'requests':
                loadContactRequests();
                break;
            case 'matches':
                loadMatches();
                break;
            case 'messages':
                loadConversations();
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

// Global variables for messaging
let currentConversationId = null;
let currentChatUserId = null;
let messagePollingInterval = null;
let conversations = [];
let currentMatches = [];

// Messaging System Functions

async function loadMatches() {
    try {
        const response = await fetch('api.php?action=get_matches');
        const result = await response.json();
        
        if (result.success) {
            currentMatches = result.data;
            displayMatches(result.data);
        } else {
            document.getElementById('matches-grid').innerHTML = `
                <div class="empty-state">
                    <i class="ri-heart-line"></i>
                    <h3>No matches found</h3>
                    <p>We'll find great matches for you. Keep your profile complete!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading matches:', error);
        showAlert('error', 'Failed to load matches');
    }
}

function displayMatches(matches) {
    const container = document.getElementById('matches-grid');
    
    if (matches.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="ri-heart-line"></i>
                <h3>No matches found</h3>
                <p>We'll find great matches for you soon!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = matches.map(match => `
        <div class="match-card" onclick="viewMatch(${match.user_id})">
            <div class="match-photo">
                ${match.profile_photo_url ? 
                    `<img src="${match.profile_photo_url}" alt="${match.full_name}">` :
                    `<div class="photo-placeholder"><i class="ri-user-line"></i></div>`
                }
                <div class="compatibility-badge">${match.compatibility_score || '85'}%</div>
            </div>
            <div class="match-info">
                <h4>${match.full_name}</h4>
                <p><i class="ri-map-pin-line"></i> ${match.city || 'City not specified'}</p>
                <p><i class="ri-briefcase-line"></i> ${match.occupation || 'Occupation not specified'}</p>
                <p><i class="ri-cake-line"></i> ${match.age} years old</p>
                <div class="match-actions">
                    <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); likeMatch(${match.user_id})">
                        <i class="ri-heart-line"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); sendMessageToUser(${match.user_id})">
                        <i class="ri-message-line"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function findNewMatches() {
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="ri-loader-4-line spinning"></i> Finding...';
    button.disabled = true;
    
    try {
        await loadMatches();
        showAlert('success', 'New matches loaded!');
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

async function likeMatch(userId) {
    try {
        const response = await fetch('api.php?action=create_match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matched_user_id: userId })
        });
        
        const result = await response.json();
        if (result.success) {
            showAlert('success', 'Match liked successfully!');
            loadMatches(); // Refresh matches
        } else {
            showAlert('error', result.message);
        }
    } catch (error) {
        console.error('Error liking match:', error);
        showAlert('error', 'Failed to like match');
    }
}

async function loadConversations() {
    try {
        const response = await fetch('api.php?action=get_conversations');
        const result = await response.json();
        
        if (result.success) {
            conversations = result.data;
            displayConversations(result.data);
        }
    } catch (error) {
        console.error('Error loading conversations:', error);
    }
}

function displayConversations(conversations) {
    const container = document.getElementById('conversations-list');
    
    if (conversations.length === 0) {
        container.innerHTML = `
            <div class="empty-conversations">
                <i class="ri-chat-3-line"></i>
                <p>No conversations yet</p>
                <button class="btn btn-sm btn-primary" onclick="startNewConversation()">
                    Start chatting
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = conversations.map(conv => `
        <div class="conversation-item ${conv.conversation_id === currentConversationId ? 'active' : ''}" 
             onclick="openConversation(${conv.conversation_id}, ${conv.other_user_id}, '${conv.other_user_name}', '${conv.other_user_photo || ''}')">
            <div class="conversation-avatar">
                ${conv.other_user_photo ? 
                    `<img src="${conv.other_user_photo}" alt="${conv.other_user_name}">` :
                    `<div class="avatar-placeholder"><i class="ri-user-line"></i></div>`
                }
                ${conv.unread_count > 0 ? `<span class="unread-badge">${conv.unread_count}</span>` : ''}
            </div>
            <div class="conversation-info">
                <h4>${conv.other_user_name}</h4>
                <p class="last-message">${conv.last_message || 'No messages yet'}</p>
                <span class="message-time">${formatMessageTime(conv.last_message_at)}</span>
            </div>
        </div>
    `).join('');
}

function openConversation(conversationId, userId, userName, userPhoto) {
    currentConversationId = conversationId;
    currentChatUserId = userId;
    
    // Update chat header
    document.getElementById('chat-user-name').textContent = userName;
    document.getElementById('chat-user-photo').src = userPhoto || 'assets/images/default-avatar.png';
    
    // Show chat interface
    document.getElementById('chat-header').style.display = 'flex';
    document.getElementById('chat-input-area').style.display = 'block';
    
    // Hide no chat selected message
    document.querySelector('.no-chat-selected').style.display = 'none';
    
    // Load messages
    loadMessages(conversationId);
    
    // Start polling for new messages
    if (messagePollingInterval) {
        clearInterval(messagePollingInterval);
    }
    messagePollingInterval = setInterval(() => {
        loadMessages(conversationId, false);
    }, 3000);
    
    // Mark conversation as active
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}

async function loadMessages(conversationId, showLoading = true) {
    try {
        if (showLoading) {
            document.getElementById('chat-messages').innerHTML = `
                <div class="loading-messages">
                    <i class="ri-loader-4-line spinning"></i>
                    <p>Loading messages...</p>
                </div>
            `;
        }
        
        const response = await fetch(`api.php?action=get_messages&conversation_id=${conversationId}`);
        const result = await response.json();
        
        if (result.success) {
            displayMessages(result.data, !showLoading);
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

function displayMessages(messages, append = false) {
    const container = document.getElementById('chat-messages');
    
    if (messages.length === 0) {
        container.innerHTML = `
            <div class="no-messages">
                <i class="ri-chat-3-line"></i>
                <p>No messages yet. Start the conversation!</p>
            </div>
        `;
        return;
    }
    
    const messagesHTML = messages.map(message => `
        <div class="message ${message.sender_id == window.userData.user_id ? 'sent' : 'received'}">
            <div class="message-content">
                <p>${escapeHtml(message.message_text)}</p>
                <span class="message-time">${formatMessageTime(message.sent_at)}</span>
            </div>
        </div>
    `).join('');
    
    if (append) {
        const currentScroll = container.scrollTop;
        const isScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 1;
        
        container.innerHTML = messagesHTML;
        
        if (isScrolledToBottom) {
            container.scrollTop = container.scrollHeight;
        }
    } else {
        container.innerHTML = messagesHTML;
        container.scrollTop = container.scrollHeight;
    }
}

async function sendMessage() {
    const input = document.getElementById('message-input');
    const messageText = input.value.trim();
    
    if (!messageText || !currentChatUserId) return;
    
    const button = document.getElementById('send-message-btn');
    button.disabled = true;
    button.innerHTML = '<i class="ri-loader-4-line spinning"></i>';
    
    try {
        const response = await fetch('api.php?action=send_message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                receiver_id: currentChatUserId,
                message_text: messageText,
                conversation_id: currentConversationId
            })
        });
        
        const result = await response.json();
        if (result.success) {
            input.value = '';
            updateMessageCounter();
            
            if (!currentConversationId) {
                currentConversationId = result.data.conversation_id;
            }
            
            // Reload messages and conversations
            loadMessages(currentConversationId, false);
            loadConversations();
        } else {
            showAlert('error', result.message);
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showAlert('error', 'Failed to send message');
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="ri-send-plane-line"></i>';
    }
}

function startNewConversation() {
    showModal('newConversationModal');
    loadMessageableUsers();
}

async function loadMessageableUsers() {
    try {
        // Get users who have accepted contact requests or matches
        const response = await fetch('api.php?action=search_profiles&limit=20');
        const result = await response.json();
        
        if (result.success) {
            displayMessageableUsers(result.data.profiles);
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function displayMessageableUsers(users) {
    const container = document.getElementById('messageable-users-list');
    
    container.innerHTML = users.map(user => `
        <div class="messageable-user" onclick="startConversationWithUser(${user.user_id}, '${user.full_name}')">
            <div class="user-avatar">
                ${user.profile_photo_url ? 
                    `<img src="${user.profile_photo_url}" alt="${user.full_name}">` :
                    `<div class="avatar-placeholder"><i class="ri-user-line"></i></div>`
                }
            </div>
            <div class="user-info">
                <h4>${user.full_name}</h4>
                <p>${user.city || 'Location not specified'}</p>
            </div>
        </div>
    `).join('');
}

function startConversationWithUser(userId, userName) {
    closeModal('newConversationModal');
    
    // Switch to messages section
    switchSection('messages');
    
    // Set up new conversation
    currentChatUserId = userId;
    currentConversationId = null;
    
    // Update chat header
    document.getElementById('chat-user-name').textContent = userName;
    document.getElementById('chat-header').style.display = 'flex';
    document.getElementById('chat-input-area').style.display = 'block';
    document.querySelector('.no-chat-selected').style.display = 'none';
    
    // Clear messages
    document.getElementById('chat-messages').innerHTML = `
        <div class="no-messages">
            <i class="ri-chat-3-line"></i>
            <p>Start your conversation with ${userName}</p>
        </div>
    `;
}

function sendMessageToUser(userId) {
    // Find user name from matches or make API call
    const match = currentMatches.find(m => m.user_id === userId);
    const userName = match ? match.full_name : 'User';
    
    switchSection('messages');
    startConversationWithUser(userId, userName);
}

function closeChatPanel() {
    currentConversationId = null;
    currentChatUserId = null;
    
    document.getElementById('chat-header').style.display = 'none';
    document.getElementById('chat-input-area').style.display = 'none';
    document.querySelector('.no-chat-selected').style.display = 'block';
    
    if (messagePollingInterval) {
        clearInterval(messagePollingInterval);
        messagePollingInterval = null;
    }
    
    // Remove active class from conversations
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('active');
    });
}

// Message input handlers
document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.addEventListener('input', updateMessageCounter);
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
});

function updateMessageCounter() {
    const input = document.getElementById('message-input');
    const counter = document.getElementById('message-counter');
    if (input && counter) {
        const length = input.value.length;
        counter.textContent = `${length}/1000`;
        counter.style.color = length > 900 ? '#f44336' : '#6c757d';
    }
}

// Utility functions
function formatMessageTime(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
        return 'Just now';
    } else if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString();
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Enhanced profile modal functions
function startConversationFromModal() {
    if (selectedProfileId) {
        const userName = document.querySelector('#profile-modal-content h3')?.textContent || 'User';
        closeModal('profileModal');
        startConversationWithUser(selectedProfileId, userName);
    }
}

// Filter tabs for matches
document.addEventListener('DOMContentLoaded', function() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            filterMatches(filter);
        });
    });
});

function filterMatches(filter) {
    let filteredMatches = [...currentMatches];
    
    switch (filter) {
        case 'mutual':
            filteredMatches = filteredMatches.filter(match => match.is_mutual);
            break;
        case 'recent':
            filteredMatches = filteredMatches.sort((a, b) => new Date(b.match_date) - new Date(a.match_date));
            break;
        default:
            // All matches - no filtering needed
            break;
    }
    
    displayMatches(filteredMatches);
}

// Notification System
let notificationPollingInterval = null;

function initializeNotifications() {
    loadNotifications();
    
    // Poll for new notifications every 30 seconds
    notificationPollingInterval = setInterval(() => {
        loadNotifications(false);
    }, 30000);
}

async function loadNotifications(showLoading = true) {
    try {
        if (showLoading) {
            document.getElementById('notifications-list').innerHTML = `
                <div class="loading-notifications">
                    <i class="ri-loader-4-line spinning"></i>
                    <p>Loading notifications...</p>
                </div>
            `;
        }
        
        const response = await fetch('api.php?action=get_notifications&limit=10');
        const result = await response.json();
        
        if (result.success) {
            displayNotifications(result.data);
            updateNotificationBadge(result.data);
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

function displayNotifications(notifications) {
    const container = document.getElementById('notifications-list');
    
    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="empty-notifications">
                <i class="ri-notification-off-line"></i>
                <p>No notifications</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = notifications.map(notification => `
        <div class="notification-item ${notification.is_read ? 'read' : 'unread'}" onclick="handleNotificationClick(${notification.notification_id}, '${notification.type}', ${notification.related_user_id})">
            <div class="notification-icon">
                <i class="${getNotificationIcon(notification.type)}"></i>
            </div>
            <div class="notification-content">
                <h5>${notification.title}</h5>
                <p>${notification.message}</p>
                <span class="notification-time">${formatNotificationTime(notification.created_at)}</span>
            </div>
            ${!notification.is_read ? '<div class="notification-dot"></div>' : ''}
        </div>
    `).join('');
}

function updateNotificationBadge(notifications) {
    const unreadCount = notifications.filter(n => !n.is_read).length;
    const badge = document.getElementById('notification-count');
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

function getNotificationIcon(type) {
    const icons = {
        message: 'ri-message-line',
        contact_request: 'ri-heart-line',
        profile_view: 'ri-eye-line',
        match: 'ri-user-heart-line'
    };
    return icons[type] || 'ri-notification-line';
}

function formatNotificationTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    
    if (diffInMinutes < 1) {
        return 'Just now';
    } else if (diffInMinutes < 60) {
        return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInMinutes < 1440) {
        return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
}

function toggleNotifications() {
    const panel = document.getElementById('notifications-panel');
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    
    if (panel.style.display === 'block') {
        loadNotifications();
    }
}

async function handleNotificationClick(notificationId, type, relatedUserId) {
    // Mark notification as read
    try {
        await fetch('api.php?action=mark_notification_read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notification_id: notificationId })
        });
        
        loadNotifications(false);
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
    
    // Handle notification action based on type
    switch (type) {
        case 'message':
            switchSection('messages');
            // Find and open conversation with related user
            setTimeout(() => {
                const conversationItem = document.querySelector(`[onclick*="${relatedUserId}"]`);
                if (conversationItem) {
                    conversationItem.click();
                }
            }, 500);
            break;
        case 'contact_request':
            switchSection('requests');
            break;
        case 'match':
            switchSection('matches');
            break;
        case 'profile_view':
            if (relatedUserId) {
                viewProfile(relatedUserId);
            }
            break;
    }
    
    // Close notifications panel
    document.getElementById('notifications-panel').style.display = 'none';
}

async function markAllNotificationsRead() {
    try {
        const notifications = document.querySelectorAll('.notification-item.unread');
        for (const notification of notifications) {
            const notificationId = notification.onclick.toString().match(/handleNotificationClick\((\d+)/)?.[1];
            if (notificationId) {
                await fetch('api.php?action=mark_notification_read', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notification_id: parseInt(notificationId) })
                });
            }
        }
        
        loadNotifications(false);
        showAlert('success', 'All notifications marked as read');
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        showAlert('error', 'Failed to mark notifications as read');
    }
}

// Close notifications when clicking outside
document.addEventListener('click', function(event) {
    const panel = document.getElementById('notifications-panel');
    const button = document.querySelector('.notification-btn');
    
    if (panel && !panel.contains(event.target) && !button.contains(event.target)) {
        panel.style.display = 'none';
    }
});

// Update initialization function
function initializeUserDashboard() {
    setupUserNavigation();
    setupEventListeners();
    loadDashboardData();
    initializeNotifications();
}
