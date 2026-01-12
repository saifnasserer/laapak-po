-- Fix MySQL root authentication to use password instead of auth_socket
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '0000';
FLUSH PRIVILEGES;
SELECT 'MySQL authentication fixed' as status;
