#!/bin/bash

# Script to fix MySQL authentication for root user
# This allows password-based authentication for root@localhost

echo "🔧 Fixing MySQL authentication for root user..."
echo ""
echo "This script will:"
echo "  1. Change root authentication from auth_socket to mysql_native_password"
echo "  2. Set the password to '0000' (or keep existing if already set)"
echo "  3. Grant all privileges"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

echo ""
echo "Running MySQL commands..."
echo "You may be prompted for your sudo password."

# Method 1: Try with sudo mysql (no password needed)
sudo mysql << 'EOF'
-- Change authentication plugin for root@localhost
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '0000';

-- Grant all privileges
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;

-- Flush privileges
FLUSH PRIVILEGES;

-- Verify
SELECT user, host, plugin FROM mysql.user WHERE user='root';
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ MySQL authentication fixed successfully!"
    echo ""
    echo "You can now connect using:"
    echo "  DATABASE_URL=\"mysql://root:0000@localhost:3306/laapak_po\""
    echo ""
    echo "Testing connection..."
    mysql -u root -p0000 -e "SELECT 1;" 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Connection test successful!"
    else
        echo "⚠️  Connection test failed. You may need to restart MySQL:"
        echo "   sudo systemctl restart mysql"
    fi
else
    echo ""
    echo "❌ Failed to fix authentication. Trying alternative method..."
    echo ""
    echo "Alternative: Create a new MySQL user for the application"
    echo "Run this manually:"
    echo ""
    echo "sudo mysql"
    echo "CREATE USER IF NOT EXISTS 'laapak_user'@'localhost' IDENTIFIED BY '0000';"
    echo "GRANT ALL PRIVILEGES ON laapak_po.* TO 'laapak_user'@'localhost';"
    echo "FLUSH PRIVILEGES;"
    echo "EXIT;"
    echo ""
    echo "Then update your .env.local:"
    echo "DATABASE_URL=\"mysql://laapak_user:0000@localhost:3306/laapak_po\""
fi

