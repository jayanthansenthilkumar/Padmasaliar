<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

try {
    switch ($action) {
        case 'login':
            handleLogin($db);
            break;
        case 'register':
            handleRegister($db);
            break;
        case 'logout':
            handleLogout();
            break;
        case 'get_profile':
            getProfile($db);
            break;
        case 'update_profile':
            updateProfile($db);
            break;
        case 'upload_photo':
            uploadPhoto($db);
            break;
        case 'search_profiles':
            searchProfiles($db);
            break;
        case 'send_contact_request':
            sendContactRequest($db);
            break;
        case 'get_contact_requests':
            getContactRequests($db);
            break;
        case 'respond_contact_request':
            respondContactRequest($db);
            break;
        case 'get_dashboard_stats':
            getDashboardStats($db);
            break;
        case 'admin_login':
            handleAdminLogin();
            break;
        case 'admin_get_users':
            adminGetUsers($db);
            break;
        case 'admin_get_requests':
            adminGetRequests($db);
            break;
        case 'admin_update_user_status':
            adminUpdateUserStatus($db);
            break;
        case 'delete_user':
            deleteUser($db);
            break;
        default:
            sendResponse(false, 'Invalid action', null, 400);
    }
} catch (Exception $e) {
    sendResponse(false, 'Server error: ' . $e->getMessage(), null, 500);
}

function sendResponse($success, $message, $data = null, $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit();
}

function handleLogin($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendResponse(false, 'Method not allowed', null, 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $email = sanitizeInput($input['email'] ?? '');
    $password = $input['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        sendResponse(false, 'Email and password are required');
    }
    
    if (!validateEmail($email)) {
        sendResponse(false, 'Invalid email format');
    }
    
    $query = "SELECT user_id, full_name, email, password, account_status FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user['account_status'] !== 'Active') {
            sendResponse(false, 'Account is not active. Please contact administrator.');
        }
        
        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['user_name'] = $user['full_name'];
            $_SESSION['user_email'] = $user['email'];
            
            // Update last login
            $updateQuery = "UPDATE users SET last_login = NOW() WHERE user_id = :user_id";
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->bindParam(':user_id', $user['user_id']);
            $updateStmt->execute();
            
            sendResponse(true, 'Login successful', [
                'user_id' => $user['user_id'],
                'full_name' => $user['full_name'],
                'email' => $user['email']
            ]);
        } else {
            sendResponse(false, 'Invalid password');
        }
    } else {
        sendResponse(false, 'User not found');
    }
}

function handleRegister($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendResponse(false, 'Method not allowed', null, 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $required_fields = ['full_name', 'email', 'password', 'gender', 'date_of_birth', 'phone_number'];
    foreach ($required_fields as $field) {
        if (empty($input[$field])) {
            sendResponse(false, "Field $field is required");
        }
    }
    
    $full_name = sanitizeInput($input['full_name']);
    $email = sanitizeInput($input['email']);
    $password = $input['password'];
    $gender = sanitizeInput($input['gender']);
    $date_of_birth = sanitizeInput($input['date_of_birth']);
    $phone_number = sanitizeInput($input['phone_number']);
    
    if (!validateEmail($email)) {
        sendResponse(false, 'Invalid email format');
    }
    
    if (!validatePhone($phone_number)) {
        sendResponse(false, 'Invalid phone number format');
    }
    
    if (strlen($password) < 6) {
        sendResponse(false, 'Password must be at least 6 characters long');
    }
    
    // Check if email already exists
    $checkQuery = "SELECT user_id FROM users WHERE email = :email OR phone_number = :phone_number";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':email', $email);
    $checkStmt->bindParam(':phone_number', $phone_number);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        sendResponse(false, 'Email or phone number already exists');
    }
    
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    $query = "INSERT INTO users (full_name, email, password, gender, date_of_birth, phone_number, birth_date) 
              VALUES (:full_name, :email, :password, :gender, :date_of_birth, :phone_number, :date_of_birth)";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':full_name', $full_name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $hashed_password);
    $stmt->bindParam(':gender', $gender);
    $stmt->bindParam(':date_of_birth', $date_of_birth);
    $stmt->bindParam(':phone_number', $phone_number);
    
    if ($stmt->execute()) {
        $user_id = $db->lastInsertId();
        $_SESSION['user_id'] = $user_id;
        $_SESSION['user_name'] = $full_name;
        $_SESSION['user_email'] = $email;
        
        sendResponse(true, 'Registration successful', [
            'user_id' => $user_id,
            'full_name' => $full_name,
            'email' => $email
        ]);
    } else {
        sendResponse(false, 'Registration failed');
    }
}

function handleLogout() {
    session_destroy();
    sendResponse(true, 'Logged out successfully');
}

function getProfile($db) {
    if (!isLoggedIn()) {
        sendResponse(false, 'Not authenticated', null, 401);
    }
    
    $user_id = $_GET['user_id'] ?? $_SESSION['user_id'];
    
    $query = "SELECT u.*, GROUP_CONCAT(up.photo_url) as photos 
              FROM users u 
              LEFT JOIN user_photos up ON u.user_id = up.user_id 
              WHERE u.user_id = :user_id AND u.account_status = 'Active'
              GROUP BY u.user_id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        unset($user['password']);
        
        if ($user['photos']) {
            $user['photos'] = explode(',', $user['photos']);
        } else {
            $user['photos'] = [];
        }
        
        if ($user['partner_preferences']) {
            $user['partner_preferences'] = json_decode($user['partner_preferences'], true);
        }
        
        sendResponse(true, 'Profile retrieved', $user);
    } else {
        sendResponse(false, 'Profile not found');
    }
}

function updateProfile($db) {
    if (!isLoggedIn()) {
        sendResponse(false, 'Not authenticated', null, 401);
    }
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendResponse(false, 'Method not allowed', null, 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $user_id = $_SESSION['user_id'];
    
    $updateFields = [];
    $params = [':user_id' => $user_id];
    
    $allowedFields = [
        'full_name', 'address', 'city', 'state', 'country', 'father_name', 'mother_name',
        'siblings_count', 'family_income', 'family_status', 'highest_qualification',
        'institution_name', 'graduation_year', 'occupation', 'annual_income',
        'diet_preference', 'smoking_habit', 'drinking_habit', 'mother_tongue',
        'community_certificate', 'about_me', 'birth_place', 'birth_time',
        'gothram', 'house_name', 'partner_preferences'
    ];
    
    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            if ($field === 'partner_preferences') {
                $updateFields[] = "$field = :$field";
                $params[":$field"] = json_encode($input[$field]);
            } else {
                $updateFields[] = "$field = :$field";
                $params[":$field"] = sanitizeInput($input[$field]);
            }
        }
    }
    
    if (empty($updateFields)) {
        sendResponse(false, 'No fields to update');
    }
    
    $query = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE user_id = :user_id";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute($params)) {
        sendResponse(true, 'Profile updated successfully');
    } else {
        sendResponse(false, 'Failed to update profile');
    }
}

function uploadPhoto($db) {
    if (!isLoggedIn()) {
        sendResponse(false, 'Not authenticated', null, 401);
    }
    
    if (!isset($_FILES['photo'])) {
        sendResponse(false, 'No file uploaded');
    }
    
    $file = $_FILES['photo'];
    $user_id = $_SESSION['user_id'];
    
    if ($file['error'] !== UPLOAD_ERR_OK) {
        sendResponse(false, 'File upload error');
    }
    
    if ($file['size'] > MAX_FILE_SIZE) {
        sendResponse(false, 'File size too large');
    }
    
    $fileInfo = pathinfo($file['name']);
    $extension = strtolower($fileInfo['extension']);
    
    if (!in_array($extension, ALLOWED_EXTENSIONS)) {
        sendResponse(false, 'Invalid file type');
    }
    
    $fileName = $user_id . '_' . time() . '_' . generateRandomString(10) . '.' . $extension;
    $uploadPath = UPLOAD_PATH . $fileName;
    
    if (!file_exists(dirname($uploadPath))) {
        mkdir(dirname($uploadPath), 0777, true);
    }
    
    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
        $isProfile = isset($_POST['is_profile']) && $_POST['is_profile'] === 'true';
        
        if ($isProfile) {
            // Update main profile photo
            $updateQuery = "UPDATE users SET profile_photo_url = :photo_url WHERE user_id = :user_id";
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->bindParam(':photo_url', $uploadPath);
            $updateStmt->bindParam(':user_id', $user_id);
            $updateStmt->execute();
            
            // Set all other photos as non-profile
            $resetQuery = "UPDATE user_photos SET is_profile_photo = FALSE WHERE user_id = :user_id";
            $resetStmt = $db->prepare($resetQuery);
            $resetStmt->bindParam(':user_id', $user_id);
            $resetStmt->execute();
        }
        
        // Insert into user_photos table
        $insertQuery = "INSERT INTO user_photos (user_id, photo_url, is_profile_photo) VALUES (:user_id, :photo_url, :is_profile)";
        $insertStmt = $db->prepare($insertQuery);
        $insertStmt->bindParam(':user_id', $user_id);
        $insertStmt->bindParam(':photo_url', $uploadPath);
        $insertStmt->bindParam(':is_profile', $isProfile, PDO::PARAM_BOOL);
        
        if ($insertStmt->execute()) {
            sendResponse(true, 'Photo uploaded successfully', ['photo_url' => $uploadPath]);
        } else {
            sendResponse(false, 'Failed to save photo record');
        }
    } else {
        sendResponse(false, 'Failed to upload file');
    }
}

function searchProfiles($db) {
    if (!isLoggedIn()) {
        sendResponse(false, 'Not authenticated', null, 401);
    }
    
    $user_id = $_SESSION['user_id'];
    $page = intval($_GET['page'] ?? 1);
    $limit = intval($_GET['limit'] ?? 12);
    $offset = ($page - 1) * $limit;
    
    $conditions = ["u.user_id != :current_user_id", "u.account_status = 'Active'"];
    $params = [':current_user_id' => $user_id];
    
    // Get current user's gender to show opposite gender
    $genderQuery = "SELECT gender FROM users WHERE user_id = :user_id";
    $genderStmt = $db->prepare($genderQuery);
    $genderStmt->bindParam(':user_id', $user_id);
    $genderStmt->execute();
    $currentUser = $genderStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($currentUser) {
        $oppositeGender = $currentUser['gender'] === 'Male' ? 'Female' : 'Male';
        $conditions[] = "u.gender = :gender";
        $params[':gender'] = $oppositeGender;
    }
    
    // Apply filters
    if (isset($_GET['min_age'])) {
        $conditions[] = "TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) >= :min_age";
        $params[':min_age'] = intval($_GET['min_age']);
    }
    
    if (isset($_GET['max_age'])) {
        $conditions[] = "TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) <= :max_age";
        $params[':max_age'] = intval($_GET['max_age']);
    }
    
    if (isset($_GET['city']) && !empty($_GET['city'])) {
        $conditions[] = "u.city LIKE :city";
        $params[':city'] = '%' . sanitizeInput($_GET['city']) . '%';
    }
    
    if (isset($_GET['state']) && !empty($_GET['state'])) {
        $conditions[] = "u.state LIKE :state";
        $params[':state'] = '%' . sanitizeInput($_GET['state']) . '%';
    }
    
    if (isset($_GET['qualification']) && !empty($_GET['qualification'])) {
        $conditions[] = "u.highest_qualification LIKE :qualification";
        $params[':qualification'] = '%' . sanitizeInput($_GET['qualification']) . '%';
    }
    
    if (isset($_GET['occupation']) && !empty($_GET['occupation'])) {
        $conditions[] = "u.occupation LIKE :occupation";
        $params[':occupation'] = '%' . sanitizeInput($_GET['occupation']) . '%';
    }
    
    $whereClause = implode(' AND ', $conditions);
    
    // Count total results
    $countQuery = "SELECT COUNT(*) as total FROM users u WHERE $whereClause";
    $countStmt = $db->prepare($countQuery);
    $countStmt->execute($params);
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get profiles
    $query = "SELECT u.user_id, u.full_name, u.gender, u.date_of_birth, u.city, u.state, 
                     u.highest_qualification, u.occupation, u.profile_photo_url,
                     TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) as age
              FROM users u 
              WHERE $whereClause 
              ORDER BY u.created_at DESC 
              LIMIT :limit OFFSET :offset";
    
    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $profiles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendResponse(true, 'Profiles retrieved', [
        'profiles' => $profiles,
        'total' => $total,
        'page' => $page,
        'pages' => ceil($total / $limit)
    ]);
}

function sendContactRequest($db) {
    if (!isLoggedIn()) {
        sendResponse(false, 'Not authenticated', null, 401);
    }
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendResponse(false, 'Method not allowed', null, 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $sender_id = $_SESSION['user_id'];
    $receiver_id = intval($input['receiver_id'] ?? 0);
    $message = sanitizeInput($input['message'] ?? '');
    
    if (empty($receiver_id)) {
        sendResponse(false, 'Receiver ID is required');
    }
    
    if ($sender_id === $receiver_id) {
        sendResponse(false, 'Cannot send request to yourself');
    }
    
    // Check if request already exists
    $checkQuery = "SELECT request_id FROM contact_requests 
                   WHERE sender_id = :sender_id AND receiver_id = :receiver_id 
                   AND status IN ('Pending', 'Accepted')";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':sender_id', $sender_id);
    $checkStmt->bindParam(':receiver_id', $receiver_id);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        sendResponse(false, 'Contact request already exists');
    }
    
    $query = "INSERT INTO contact_requests (sender_id, receiver_id, message) 
              VALUES (:sender_id, :receiver_id, :message)";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':sender_id', $sender_id);
    $stmt->bindParam(':receiver_id', $receiver_id);
    $stmt->bindParam(':message', $message);
    
    if ($stmt->execute()) {
        sendResponse(true, 'Contact request sent successfully');
    } else {
        sendResponse(false, 'Failed to send contact request');
    }
}

function getContactRequests($db) {
    if (!isLoggedIn()) {
        sendResponse(false, 'Not authenticated', null, 401);
    }
    
    $user_id = $_SESSION['user_id'];
    $type = $_GET['type'] ?? 'received'; // received, sent
    
    if ($type === 'received') {
        $query = "SELECT cr.*, u.full_name, u.email, u.phone_number, u.profile_photo_url, u.city, u.state
                  FROM contact_requests cr
                  JOIN users u ON cr.sender_id = u.user_id
                  WHERE cr.receiver_id = :user_id
                  ORDER BY cr.sent_at DESC";
    } else {
        $query = "SELECT cr.*, u.full_name, u.email, u.phone_number, u.profile_photo_url, u.city, u.state
                  FROM contact_requests cr
                  JOIN users u ON cr.receiver_id = u.user_id
                  WHERE cr.sender_id = :user_id
                  ORDER BY cr.sent_at DESC";
    }
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendResponse(true, 'Contact requests retrieved', $requests);
}

function respondContactRequest($db) {
    if (!isLoggedIn()) {
        sendResponse(false, 'Not authenticated', null, 401);
    }
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendResponse(false, 'Method not allowed', null, 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $request_id = intval($input['request_id'] ?? 0);
    $response = sanitizeInput($input['response'] ?? ''); // Accepted or Rejected
    $user_id = $_SESSION['user_id'];
    
    if (empty($request_id) || !in_array($response, ['Accepted', 'Rejected'])) {
        sendResponse(false, 'Invalid request ID or response');
    }
    
    // Verify the request belongs to current user
    $checkQuery = "SELECT request_id FROM contact_requests 
                   WHERE request_id = :request_id AND receiver_id = :user_id AND status = 'Pending'";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':request_id', $request_id);
    $checkStmt->bindParam(':user_id', $user_id);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() === 0) {
        sendResponse(false, 'Request not found or already responded');
    }
    
    $query = "UPDATE contact_requests SET status = :status, responded_at = NOW() 
              WHERE request_id = :request_id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':status', $response);
    $stmt->bindParam(':request_id', $request_id);
    
    if ($stmt->execute()) {
        sendResponse(true, "Contact request $response successfully");
    } else {
        sendResponse(false, 'Failed to respond to contact request');
    }
}

function getDashboardStats($db) {
    if (!isLoggedIn()) {
        sendResponse(false, 'Not authenticated', null, 401);
    }
    
    $user_id = $_SESSION['user_id'];
    
    // Get profile completion percentage
    $profileQuery = "SELECT * FROM users WHERE user_id = :user_id";
    $profileStmt = $db->prepare($profileQuery);
    $profileStmt->bindParam(':user_id', $user_id);
    $profileStmt->execute();
    $profile = $profileStmt->fetch(PDO::FETCH_ASSOC);
    
    $profileFields = [
        'full_name', 'email', 'gender', 'date_of_birth', 'phone_number', 'address',
        'city', 'state', 'highest_qualification', 'occupation', 'about_me'
    ];
    
    $completedFields = 0;
    foreach ($profileFields as $field) {
        if (!empty($profile[$field])) {
            $completedFields++;
        }
    }
    
    $profileCompletion = round(($completedFields / count($profileFields)) * 100);
    
    // Count contact requests
    $sentQuery = "SELECT COUNT(*) as count FROM contact_requests WHERE sender_id = :user_id";
    $sentStmt = $db->prepare($sentQuery);
    $sentStmt->bindParam(':user_id', $user_id);
    $sentStmt->execute();
    $sentRequests = $sentStmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    $receivedQuery = "SELECT COUNT(*) as count FROM contact_requests WHERE receiver_id = :user_id";
    $receivedStmt = $db->prepare($receivedQuery);
    $receivedStmt->bindParam(':user_id', $user_id);
    $receivedStmt->execute();
    $receivedRequests = $receivedStmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    $pendingQuery = "SELECT COUNT(*) as count FROM contact_requests 
                     WHERE receiver_id = :user_id AND status = 'Pending'";
    $pendingStmt = $db->prepare($pendingQuery);
    $pendingStmt->bindParam(':user_id', $user_id);
    $pendingStmt->execute();
    $pendingRequests = $pendingStmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // Count total profiles available
    $genderQuery = "SELECT gender FROM users WHERE user_id = :user_id";
    $genderStmt = $db->prepare($genderQuery);
    $genderStmt->bindParam(':user_id', $user_id);
    $genderStmt->execute();
    $currentUser = $genderStmt->fetch(PDO::FETCH_ASSOC);
    
    $oppositeGender = $currentUser['gender'] === 'Male' ? 'Female' : 'Male';
    $profilesQuery = "SELECT COUNT(*) as count FROM users 
                      WHERE gender = :gender AND account_status = 'Active' AND user_id != :user_id";
    $profilesStmt = $db->prepare($profilesQuery);
    $profilesStmt->bindParam(':gender', $oppositeGender);
    $profilesStmt->bindParam(':user_id', $user_id);
    $profilesStmt->execute();
    $availableProfiles = $profilesStmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    sendResponse(true, 'Dashboard stats retrieved', [
        'profile_completion' => $profileCompletion,
        'sent_requests' => $sentRequests,
        'received_requests' => $receivedRequests,
        'pending_requests' => $pendingRequests,
        'available_profiles' => $availableProfiles
    ]);
}

function handleAdminLogin() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendResponse(false, 'Method not allowed', null, 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $email = sanitizeInput($input['email'] ?? '');
    $password = $input['password'] ?? '';
    
    if ($email === ADMIN_EMAIL && $password === ADMIN_PASSWORD) {
        $_SESSION['is_admin'] = true;
        $_SESSION['admin_email'] = $email;
        sendResponse(true, 'Admin login successful');
    } else {
        sendResponse(false, 'Invalid admin credentials');
    }
}

function adminGetUsers($db) {
    if (!isAdmin()) {
        sendResponse(false, 'Admin access required', null, 403);
    }
    
    $page = intval($_GET['page'] ?? 1);
    $limit = intval($_GET['limit'] ?? 20);
    $offset = ($page - 1) * $limit;
    
    $countQuery = "SELECT COUNT(*) as total FROM users";
    $countStmt = $db->prepare($countQuery);
    $countStmt->execute();
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    $query = "SELECT user_id, full_name, email, gender, phone_number, city, state, 
                     account_status, created_at, last_login
              FROM users 
              ORDER BY created_at DESC 
              LIMIT :limit OFFSET :offset";
    
    $stmt = $db->prepare($query);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendResponse(true, 'Users retrieved', [
        'users' => $users,
        'total' => $total,
        'page' => $page,
        'pages' => ceil($total / $limit)
    ]);
}

function adminGetRequests($db) {
    if (!isAdmin()) {
        sendResponse(false, 'Admin access required', null, 403);
    }
    
    $query = "SELECT cr.*, 
                     s.full_name as sender_name, s.email as sender_email,
                     r.full_name as receiver_name, r.email as receiver_email
              FROM contact_requests cr
              JOIN users s ON cr.sender_id = s.user_id
              JOIN users r ON cr.receiver_id = r.user_id
              ORDER BY cr.sent_at DESC
              LIMIT 100";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendResponse(true, 'Contact requests retrieved', $requests);
}

function adminUpdateUserStatus($db) {
    if (!isAdmin()) {
        sendResponse(false, 'Admin access required', null, 403);
    }
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendResponse(false, 'Method not allowed', null, 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $user_id = intval($input['user_id'] ?? 0);
    $status = sanitizeInput($input['status'] ?? '');
    
    if (empty($user_id) || !in_array($status, ['Active', 'Inactive', 'Suspended'])) {
        sendResponse(false, 'Invalid user ID or status');
    }
    
    $query = "UPDATE users SET account_status = :status WHERE user_id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':status', $status);
    $stmt->bindParam(':user_id', $user_id);
    
    if ($stmt->execute()) {
        sendResponse(true, 'User status updated successfully');
    } else {
        sendResponse(false, 'Failed to update user status');
    }
}

function deleteUser($db) {
    if (!isAdmin()) {
        sendResponse(false, 'Admin access required', null, 403);
    }
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendResponse(false, 'Method not allowed', null, 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $user_id = intval($input['user_id'] ?? 0);
    
    if (empty($user_id)) {
        sendResponse(false, 'User ID is required');
    }
    
    try {
        $db->beginTransaction();
        
        // Delete user photos
        $deletePhotosQuery = "DELETE FROM user_photos WHERE user_id = :user_id";
        $deletePhotosStmt = $db->prepare($deletePhotosQuery);
        $deletePhotosStmt->bindParam(':user_id', $user_id);
        $deletePhotosStmt->execute();
        
        // Delete contact requests
        $deleteRequestsQuery = "DELETE FROM contact_requests WHERE sender_id = :user_id OR receiver_id = :user_id";
        $deleteRequestsStmt = $db->prepare($deleteRequestsQuery);
        $deleteRequestsStmt->bindParam(':user_id', $user_id);
        $deleteRequestsStmt->execute();
        
        // Delete user
        $deleteUserQuery = "DELETE FROM users WHERE user_id = :user_id";
        $deleteUserStmt = $db->prepare($deleteUserQuery);
        $deleteUserStmt->bindParam(':user_id', $user_id);
        $deleteUserStmt->execute();
        
        $db->commit();
        sendResponse(true, 'User deleted successfully');
    } catch (Exception $e) {
        $db->rollback();
        sendResponse(false, 'Failed to delete user: ' . $e->getMessage());
    }
}
?>
