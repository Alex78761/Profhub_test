CREATE DATABASE IF NOT EXISTS neurolost;
USE neurolost;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('RESPONDENT', 'EXPERT') NOT NULL,
    gender ENUM('MALE', 'FEMALE') NOT NULL,
    birth_date DATE NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type ENUM('SIMPLE_LIGHT', 'SIMPLE_SOUND', 'COMPLEX_COLOR', 'COMPLEX_SOUND_MATH', 'COMPLEX_VISUAL_MATH') NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS test_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    test_id INT,
    reaction_time FLOAT NOT NULL,
    accuracy FLOAT NOT NULL,
    test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (test_id) REFERENCES tests(id)
);

CREATE TABLE IF NOT EXISTS test_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    expert_id INT,
    respondent_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'PENDING',
    invitation_link VARCHAR(255) UNIQUE,
    FOREIGN KEY (expert_id) REFERENCES users(id),
    FOREIGN KEY (respondent_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS session_tests (
    session_id INT,
    test_id INT,
    test_order INT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES test_sessions(id),
    FOREIGN KEY (test_id) REFERENCES tests(id),
    PRIMARY KEY (session_id, test_id)
); 