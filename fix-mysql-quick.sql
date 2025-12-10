-- Quick fix for MySQL authentication
-- Run this with: sudo mysql < fix-mysql-quick.sql

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '0000';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
SELECT 'MySQL authentication fixed!' as status;
