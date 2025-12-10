# Fix MySQL Authentication - Quick Steps

## The Problem
MySQL root user is using `auth_socket` which doesn't allow password authentication.

## The Solution

Run this command in your terminal:

```bash
sudo mysql < fix-mysql-with-default-password.sql
```

**OR** manually:

```bash
sudo mysql
```

Then paste these commands:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'default';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EXIT;
```

## After Running the Fix

1. **Test the connection:**
   ```bash
   mysql -u root -pdefault -e "SELECT 1;"
   ```
   (You should see output, not an error)

2. **Restart your Next.js dev server:**
   - Stop it (Ctrl+C)
   - Start it again: `npm run dev`

3. **Try creating a client again** - it should work now!

## What This Does

- Changes root authentication from `auth_socket` to `mysql_native_password`
- Sets the password to "default"
- Grants all privileges
- Allows Prisma to connect with the password

## If It Still Doesn't Work

Check if MySQL service is running:
```bash
sudo systemctl status mysql
```

If not running, start it:
```bash
sudo systemctl start mysql
```

Then try the fix again.

