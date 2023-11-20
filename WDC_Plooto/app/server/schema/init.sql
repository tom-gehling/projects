CREATE DATABASE IF NOT EXISTS db_name;
CREATE DATABASE IF NOT EXISTS test_db;
CREATE USER IF NOT EXISTS 'user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL ON db_name.* TO 'user'@'localhost';
GRANT ALL ON test_db.* TO 'user'@'localhost';
FLUSH PRIVILEGES;
