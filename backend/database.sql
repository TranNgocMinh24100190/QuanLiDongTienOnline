-- ==========================================
-- DATABASE
-- ==========================================
DROP DATABASE IF EXISTS QuanLyDongTien;
CREATE DATABASE QuanLyDongTien;
USE QuanLyDongTien;

-- ==========================================
-- USERS
-- ==========================================
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==========================================
-- WALLETS
-- ==========================================
CREATE TABLE Wallets (
    wallet_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    wallet_name VARCHAR(100) NOT NULL,
    wallet_type VARCHAR(50),
    balance DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- ==========================================
-- CATEGORIES
-- ==========================================
CREATE TABLE Categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    type ENUM('Income','Expense') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- ==========================================
-- TRANSACTIONS
-- ==========================================
CREATE TABLE Transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_id INT NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    transaction_type ENUM('Income','Expense') NOT NULL,
    description VARCHAR(255),
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES Wallets(wallet_id),
    FOREIGN KEY (category_id) REFERENCES Categories(category_id)
);

-- ==========================================
-- BUDGETS
-- ==========================================
CREATE TABLE Budgets (
    budget_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    amount_limit DECIMAL(15,2) NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (category_id) REFERENCES Categories(category_id)
);

-- ==========================================
-- SAVINGS GOALS
-- ==========================================
CREATE TABLE Savings_Goals (
    goal_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    goal_name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0,
    target_date DATE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- ==========================================
-- TRANSFERS
-- ==========================================
CREATE TABLE Transfers (
    transfer_id INT AUTO_INCREMENT PRIMARY KEY,
    from_wallet_id INT NOT NULL,
    to_wallet_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    transfer_date DATE NOT NULL,
    note VARCHAR(255),
    FOREIGN KEY (from_wallet_id) REFERENCES Wallets(wallet_id),
    FOREIGN KEY (to_wallet_id) REFERENCES Wallets(wallet_id)
);

-- ==========================================
-- SAMPLE DATA
-- ==========================================

-- USERS
INSERT INTO Users(full_name,email,password_hash,phone)
VALUES
('Nguyen Van A','a@gmail.com','123456','0901111111');

-- WALLETS
INSERT INTO Wallets(user_id,wallet_name,wallet_type,balance)
VALUES
(1,'Tien Mat','Cash',5000000),
(1,'Vietcombank','Bank',20000000),
(1,'MoMo','E-Wallet',3000000);

-- CATEGORIES
INSERT INTO Categories(user_id,category_name,type)
VALUES
(1,'Luong','Income'),
(1,'Thuong','Income'),
(1,'Dau Tu','Income'),
(1,'An Uong','Expense'),
(1,'Di Lai','Expense'),
(1,'Mua Sam','Expense'),
(1,'Hoa Don','Expense'),
(1,'Giai Tri','Expense');

-- TRANSACTIONS (10 records)
INSERT INTO Transactions
(wallet_id,category_id,amount,transaction_type,description,transaction_date)
VALUES
(2,1,15000000,'Income','Luong thang 1','2026-01-05'),
(2,2,2000000,'Income','Thuong KPI','2026-01-10'),
(1,4,50000,'Expense','An sang','2026-01-11'),
(1,4,120000,'Expense','An trua','2026-01-11'),
(3,5,100000,'Expense','Do xang','2026-01-12'),
(2,6,1500000,'Expense','Mua giay','2026-01-13'),
(2,7,800000,'Expense','Tien dien','2026-01-14'),
(2,7,300000,'Expense','Tien nuoc','2026-01-14'),
(3,8,250000,'Expense','Xem phim','2026-01-15'),
(2,3,1000000,'Income','Lai dau tu','2026-01-20');

-- BUDGETS
INSERT INTO Budgets
(user_id,category_id,amount_limit,month,year)
VALUES
(1,4,3000000,1,2026),
(1,5,1000000,1,2026),
(1,6,2000000,1,2026),
(1,8,1000000,1,2026);

-- SAVINGS GOALS
INSERT INTO Savings_Goals
(user_id,goal_name,target_amount,current_amount,target_date)
VALUES
(1,'Mua Laptop Moi',30000000,12000000,'2026-12-31'),
(1,'Du Lich Nhat Ban',50000000,15000000,'2027-06-30');

-- TRANSFERS
INSERT INTO Transfers
(from_wallet_id,to_wallet_id,amount,transfer_date,note)
VALUES
(2,3,2000000,'2026-01-18','Nap tien vao MoMo'),
(2,1,1000000,'2026-01-22','Rut tien mat');

ALTER TABLE Wallets
ADD status ENUM('ACTIVE', 'CLOSED') DEFAULT 'ACTIVE';

ALTER TABLE Wallets 
ADD closed_at DATETIME NULL;

ALTER TABLE Transactions
ADD COLUMN is_transfer BOOLEAN DEFAULT 0;

ALTER TABLE Categories 
ADD COLUMN is_system BOOLEAN DEFAULT 0;

ALTER TABLE Transactions 
ADD COLUMN transfer_group_id BIGINT;

