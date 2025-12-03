import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function generatePublicId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 4; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    result += "-";
    for (let i = 0; i < 4; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
    const formatted = formatter.format(amount);
    // Remove .00 at the end if present
    return formatted.replace(/\.00$/, "");
}

/**
 * Checks if a PO should be expired based on validUntil date
 * Returns true if validUntil exists and has passed
 */
export function shouldBeExpired(validUntil: Date | string | null): boolean {
    if (!validUntil) return false;
    const validDate = typeof validUntil === "string" ? new Date(validUntil) : validUntil;
    const now = new Date();
    // Set time to start of day for comparison
    now.setHours(0, 0, 0, 0);
    validDate.setHours(0, 0, 0, 0);
    return validDate < now;
}
