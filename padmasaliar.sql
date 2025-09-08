-- Step 1: Create the database
CREATE DATABASE IF NOT EXISTS padmasaliar CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Step 2: Use the database
USE padmasaliar;

-- Step 3: Create the users table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    gender ENUM('Male', 'Female') NOT NULL,
    date_of_birth DATE NOT NULL,
    phone_number VARCHAR(15) UNIQUE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    father_name VARCHAR(255),
    mother_name VARCHAR(255),
    siblings_count INT,
    family_income DECIMAL(12,2),
    family_status ENUM('Joint', 'Nuclear'),
    highest_qualification VARCHAR(150),
    institution_name VARCHAR(255),
    graduation_year YEAR,
    occupation VARCHAR(150),
    annual_income DECIMAL(12,2),
    diet_preference ENUM('Vegetarian', 'Non-Vegetarian', 'Eggetarian'),
    smoking_habit ENUM('Yes', 'No'),
    drinking_habit ENUM('Yes', 'No'),
    mother_tongue VARCHAR(100),
    community_certificate VARCHAR(255),
    profile_photo_url VARCHAR(255),
    about_me TEXT,
    last_login DATETIME,
    account_status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
    birth_place VARCHAR(255),
    birth_date DATE,
    birth_time TIME,
    gothram VARCHAR(150),
    house_name VARCHAR(255),
    partner_preferences JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (email),
    INDEX (phone_number),
    INDEX (birth_date),
    INDEX (city),
    INDEX (state),
    INDEX (account_status)
);

-- Step 4: Create the user_photos table
CREATE TABLE user_photos (
    photo_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    photo_url VARCHAR(255) NOT NULL,
    is_profile_photo BOOLEAN DEFAULT FALSE,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Step 5: Create the contact_requests table
CREATE TABLE contact_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT,
    status ENUM('Pending', 'Accepted', 'Rejected') DEFAULT 'Pending',
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    responded_at DATETIME,
    FOREIGN KEY (sender_id) REFERENCES users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES users(user_id),
    INDEX (sender_id),
    INDEX (receiver_id),
    INDEX (status),
    INDEX (sent_at)
);

-- Step 6: Create the conversations table
CREATE TABLE conversations (
    conversation_id INT AUTO_INCREMENT PRIMARY KEY,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    last_message_id INT DEFAULT NULL,
    last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users(user_id),
    FOREIGN KEY (user2_id) REFERENCES users(user_id),
    UNIQUE KEY unique_conversation (user1_id, user2_id),
    INDEX (user1_id),
    INDEX (user2_id),
    INDEX (last_message_at)
);

-- Step 7: Create the messages table
CREATE TABLE messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message_text TEXT NOT NULL,
    message_type ENUM('text', 'image', 'file') DEFAULT 'text',
    attachment_url VARCHAR(255) DEFAULT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME DEFAULT NULL,
    FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES users(user_id),
    INDEX (conversation_id),
    INDEX (sender_id),
    INDEX (receiver_id),
    INDEX (sent_at),
    INDEX (is_read)
);

-- Step 8: Create the notifications table
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('message', 'contact_request', 'profile_view', 'match') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_user_id INT DEFAULT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (related_user_id) REFERENCES users(user_id),
    INDEX (user_id),
    INDEX (type),
    INDEX (is_read),
    INDEX (created_at)
);

-- Step 9: Create the user_matches table
CREATE TABLE user_matches (
    match_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    matched_user_id INT NOT NULL,
    compatibility_score DECIMAL(5,2) DEFAULT 0.00,
    match_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_mutual BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (matched_user_id) REFERENCES users(user_id),
    UNIQUE KEY unique_match (user_id, matched_user_id),
    INDEX (user_id),
    INDEX (matched_user_id),
    INDEX (compatibility_score),
    INDEX (match_date)
);
