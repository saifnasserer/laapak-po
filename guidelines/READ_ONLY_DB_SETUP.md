# Read-Only Database Access Setup Guide

To connect the PO System directly to the Reports System database, we need a secure, read-only user and understanding of the database structure.

## 1. Create a Read-Only MySQL User

Run the following SQL commands in your MySQL interface (phpMyAdmin, Workbench, or CLI) on the **Reports Database**.

Replace `password123` with a secure password and `reports_db_name` with the actual name of your reports database.

```sql
-- 1. Create the user (can only connect from localhost since they are on the same server)
CREATE USER 'po_readonly'@'localhost' IDENTIFIED BY 'password123';

-- 2. Grant SELECT (read-only) permissions on the reports database
GRANT SELECT ON reports_db_name.* TO 'po_readonly'@'localhost';

-- 3. Apply changes
FLUSH PRIVILEGES;
```

*If the Docker containers are separate (e.g., PO system in one container, Reports in another), you might need to use `'%'` instead of `'localhost'`, or the specific IP of the PO container.*


## 2. Provide Database Details

✅ **DONE** - Here are the details you need to configure the connection:

*   **Database Host**: `localhost` (Since they are on the same VPS, use `localhost` if connecting from the app on the same server, or `127.0.0.1`)
*   **Database Port**: `3306`
*   **Database Name**: `laapak_report_system`
*   **Username**: `po_readonly`
*   **Password**: `PO_Reader_2026!`

## 3. Provide Database Schema (Structure)

✅ **DONE** - Schema retrieved and saved to `reports_schema.sql`.

### Key Tables Found:

#### `reports` Table
- `id` (PK, varchar)
- `order_number`
- `device_model`
- `serial_number`
- `inspection_date`
- `status`
- `client_phone` (Directly available in reports table)

#### `clients` Table
- `id` (PK, int)
- `name`
- `phone` (Unique)
- `email`

