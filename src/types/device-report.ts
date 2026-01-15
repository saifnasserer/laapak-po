export interface DeviceReport {
    id: string;
    client_id?: string | number;
    title?: string;
    description?: string;
    device_model: string;
    serial_number: string;
    inspection_date: string; // ISO string or Date
    status: string;
    created_at?: string;
    hardware_status?: string; // JSON string
    external_images?: string; // JSON string
    notes?: string;
    amount?: number;
    billing_enabled?: boolean;
}
