"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markClientAsContacted(clientId: string) {
    if (!clientId) return;

    try {
        await prisma.client.update({
            where: { id: clientId },
            data: {
                updatedAt: new Date(), // Updating this timestamp removes them from the "Inactive > 30 days" list
            },
        });

        revalidatePath("/dashboard/analysis");
        return { success: true };
    } catch (error) {
        console.error("Failed to mark client as contacted:", error);
        return { success: false, error: "Failed to update client status" };
    }
}
