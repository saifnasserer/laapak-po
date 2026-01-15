import { reportsPool } from "@/lib/db/reports-db";
import { RowDataPacket } from "mysql2";
import { DeviceReport } from "@/types/device-report";

export class ReportService {

    /**
     * Fetches reports directly from the database for a given phone number.
     * Joins `reports` with `clients` on `client_id`.
     */
    async getReportsByPhone(phone: string): Promise<DeviceReport[]> {
        try {
            // Basic phone formatting if necessary, but assuming exact match for now as per schema unique constraint

            const [rows] = await reportsPool.execute<RowDataPacket[]>(`
                SELECT 
                    r.id,
                    r.client_id,
                    r.order_number as title, -- Using order number as title
                    r.device_model,
                    r.serial_number,
                    r.inspection_date,
                    r.status,
                    r.created_at,
                    r.hardware_status,
                    r.external_images,
                    r.notes,
                    r.amount,
                    r.billing_enabled
                FROM reports r
                JOIN clients c ON r.client_id = c.id
                WHERE c.phone = ? 
                ORDER BY r.inspection_date DESC
            `, [phone]);

            // Map and parse dates if necessary (mysql2 returns Date objects for datetime)
            return rows.map((row: any) => ({
                ...row,
                inspection_date: row.inspection_date instanceof Date ? row.inspection_date.toISOString() : row.inspection_date,
                created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
            })) as DeviceReport[];

        } catch (error) {
            console.error("ReportService (Direct DB) Error:", error);
            // Return empty array on error to prevent app crash
            return [];
        }
    }

    /**
     * Fetches a single report by ID directly from DB
     */
    async getReport(reportId: string): Promise<DeviceReport | null> {
        try {
            const [rows] = await reportsPool.execute<RowDataPacket[]>(`
                SELECT * FROM reports WHERE id = ?
            `, [reportId]);

            if (rows.length === 0) return null;

            const row = rows[0] as any;
            return {
                ...row,
                inspection_date: row.inspection_date instanceof Date ? row.inspection_date.toISOString() : row.inspection_date,
                created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
            } as DeviceReport;
        } catch (error) {
            console.error('Failed to fetch report:', error);
            return null;
        }
    }
}

export const reportService = new ReportService();
