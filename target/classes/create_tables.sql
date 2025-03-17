-- Создание базы данных
CREATE DATABASE IF NOT EXISTS neurolost;
USE neurolost;

-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    gender VARCHAR(10),
    birth_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы тестов
CREATE TABLE IF NOT EXISTS tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы результатов тестов
CREATE TABLE IF NOT EXISTS test_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    test_id INT NOT NULL,
    reaction_time DOUBLE NOT NULL,
    accuracy DOUBLE NOT NULL,
    test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (test_id) REFERENCES tests(id)
);

-- Вставка тестовых данных для таблицы tests
INSERT INTO tests (type, description) VALUES
('visual', 'Тест на визуальную реакцию'),
('audio', 'Тест на аудиальную реакцию'),
('choice', 'Тест на реакцию выбора')
ON DUPLICATE KEY UPDATE description = VALUES(description); 