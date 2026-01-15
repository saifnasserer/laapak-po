import mysql from 'mysql2/promise';

// Create the connection pool.
// Create the connection pool.
export const reportsPool = mysql.createPool({
    host: process.env.REPORTS_DB_HOST || 'localhost',
    port: Number(process.env.REPORTS_DB_PORT) || 3306,
    user: process.env.REPORTS_DB_USER || 'po_readonly',
    password: process.env.REPORTS_DB_PASSWORD || 'PO_Reader_2026!',
    database: process.env.REPORTS_DB_NAME || 'laapak_report_system',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});
