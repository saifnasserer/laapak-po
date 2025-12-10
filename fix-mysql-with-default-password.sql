-- Fix MySQL authentication for root user with password "default"
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'default';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
SELECT 'MySQL authentication fixed with password: default' as status;
