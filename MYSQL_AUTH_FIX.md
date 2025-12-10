# MySQL Authentication Fix Guide

## Problem
```
ERROR 28000 (1698): Access denied for user 'root'@'localhost'
```

This happens because MySQL 8.0+ uses `auth_socket` plugin for the root user by default, which doesn't allow password-based authentication.

## Solution Options

### Option 1: Fix Root Authentication (Recommended)

Run the automated script:
```bash
./fix-mysql-auth.sh
```

Or manually:
```bash
sudo mysql
```

Then in MySQL:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '0000';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EXIT;
```

### Option 2: Create a Dedicated Database User (More Secure)

This is the recommended approach for production:

```bash
sudo mysql
```

Then in MySQL:
```sql
-- Create a new user for the application
CREATE USER IF NOT EXISTS 'laapak_user'@'localhost' IDENTIFIED BY '0000';

-- Grant privileges only to the laapak_po database
GRANT ALL PRIVILEGES ON laapak_po.* TO 'laapak_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Verify
SELECT user, host FROM mysql.user WHERE user='laapak_user';
EXIT;
```

Then update your `.env.local`:
```bash
DATABASE_URL="mysql://laapak_user:0000@localhost:3306/laapak_po"
```

### Option 3: Use Socket Authentication (Alternative)

If you want to keep using socket authentication, you can connect without a password:

Update `.env.local`:
```bash
# For socket authentication (no password needed)
DATABASE_URL="mysql://root@localhost:3306/laapak_po"
```

However, this may not work with Prisma if MySQL is configured for socket-only authentication.

## Verify the Fix

After applying any solution, test the connection:

```bash
mysql -u root -p0000 -e "SELECT 1;"
# or
mysql -u laapak_user -p0000 -e "SELECT 1;"
```

If successful, restart your Next.js dev server:
```bash
npm run dev
```

## Troubleshooting

### If you get "Access denied" after fixing:
1. Restart MySQL: `sudo systemctl restart mysql`
2. Check MySQL error log: `sudo tail -f /var/log/mysql/error.log`
3. Verify user exists: `sudo mysql -e "SELECT user, host, plugin FROM mysql.user;"`

### If Prisma still can't connect:
1. Regenerate Prisma Client: `npx prisma generate`
2. Check `.env.local` is being loaded (Next.js loads it automatically)
3. Restart the dev server completely

### For Production Server:
The server's `.env` file should use the same authentication method. If the server uses a different MySQL setup, you may need to:
- Use the same fix on the server
- Or create a dedicated user on the server
- Or use the server's existing MySQL credentials

