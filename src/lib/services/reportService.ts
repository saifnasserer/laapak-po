
export interface DeviceReport {
    id: string;
    device_model: string;
    serial_number: string;
    inspection_date: string;
    status: string;
    createdAt: string;
    hardware_status?: string;
    amount?: number;
    billing_enabled?: boolean;
}

export interface ClientLookupResult {
    found: boolean;
    client?: {
        id: number;
        name: string;
        phone: string;
        email: string;
        status: string;
        createdAt: string;
    };
    error?: string;
}

const API_Base_URL = 'https://reports.laapak.com/api/external';
const API_KEY = 'laapak-api-key-2024';

export class ReportService {
    private async makeRequest<T>(endpoint: string, method: 'GET' | 'POST' = 'GET', data: any = null): Promise<T> {
        const options: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            cache: 'no-store'
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${API_Base_URL}${endpoint}`, options);

            if (!response.ok) {
                // Handle specific error cases if needed
                if (response.status === 404) {
                    throw new Error('Not Found');
                }
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const responseData = await response.json();
            return responseData as T;
        } catch (error) {
            console.error(`ReportService Error [${endpoint}]:`, error);
            throw error;
        }
    }

    async lookupClientByPhone(phone: string): Promise<ClientLookupResult> {
        try {
            // The API expects /clients/lookup?phone=...
            // Response structure from docs: { success: true, client: { ... } }
            const data = await this.makeRequest<{ success: boolean; client: any }>(`/clients/lookup?phone=${encodeURIComponent(phone)}`);

            if (data.success && data.client) {
                return { found: true, client: data.client };
            }
            return { found: false };
        } catch (error: any) {
            if (error.message === 'Not Found') {
                return { found: false };
            }
            return { found: false, error: error.message };
        }
    }

    async getClientReports(remoteClientId: number | string): Promise<DeviceReport[]> {
        try {
            // The API expects /clients/:id/reports
            // Response structure from docs: { success: true, reports: [ ... ], count: ... }
            const data = await this.makeRequest<{ success: boolean; reports: DeviceReport[] }>(`/clients/${remoteClientId}/reports`);

            if (data.success && Array.isArray(data.reports)) {
                return data.reports;
            }
            return [];
        } catch (error) {
            console.error('Failed to fetch client reports:', error);
            return [];
        }
    }

    async getReportsByPhone(phone: string): Promise<DeviceReport[]> {
        const lookup = await this.lookupClientByPhone(phone);
        if (lookup.found && lookup.client) {
            return this.getClientReports(lookup.client.id);
        }
        return [];
    }
}

export const reportService = new ReportService();
