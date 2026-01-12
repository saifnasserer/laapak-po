const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

const INVOICES_DIR = path.join(__dirname, 'invoices');

async function migrateClients() {
    console.log('🚀 Starting Universal Client migration (DB + Local Files)...');

    try {
        const uniqueReceiversMap = new Map(); // key: name-id, value: {id, name}

        // 1. Fetch from Database
        console.log('📡 Reading from database...');
        const dbInvoices = await prisma.eTAInvoice.findMany({
            select: { receiverId: true, receiverName: true }
        });
        dbInvoices.forEach(inv => {
            if (inv.receiverId && inv.receiverName) {
                uniqueReceiversMap.set(`${inv.receiverName}-${inv.receiverId}`, { id: inv.receiverId, name: inv.receiverName });
            }
        });

        // 2. Fetch from Local Files
        if (fs.existsSync(INVOICES_DIR)) {
            console.log(`📂 Reading from ${INVOICES_DIR}...`);
            const files = fs.readdirSync(INVOICES_DIR).filter(f => f.endsWith('.json'));
            console.log(`📄 Found ${files.length} local invoice files.`);

            files.forEach(file => {
                try {
                    const content = fs.readFileSync(path.join(INVOICES_DIR, file), 'utf8');
                    const data = JSON.parse(content);
                    if (data.receiverId && data.receiverName) {
                        uniqueReceiversMap.set(`${data.receiverName}-${data.receiverId}`, { id: data.receiverId, name: data.receiverName });
                    }
                } catch (e) {
                    console.warn(`⚠️ Failed to parse ${file}: ${e.message}`);
                }
            });
        } else {
            console.warn(`⚠️ Directory ${INVOICES_DIR} not found. Skipping file scan.`);
        }

        const uniqueReceivers = Array.from(uniqueReceiversMap.values());
        console.log(`🔍 Total unique receiver pairs discovered: ${uniqueReceivers.length}`);

        let createdCount = 0;
        let updatedCount = 0;
        let syncedCount = 0;
        let conflictCount = 0;

        for (const receiver of uniqueReceivers) {
            // Name-First Logic
            const existingByName = await prisma.client.findFirst({
                where: { name: receiver.name }
            });

            if (existingByName) {
                if (existingByName.taxRegistrationNumber !== receiver.id) {
                    try {
                        await prisma.client.update({
                            where: { id: existingByName.id },
                            data: { taxRegistrationNumber: receiver.id }
                        });
                        console.log(`📝 UPDATED Tax ID for: "${receiver.name}"`);
                        updatedCount++;
                    } catch (e) {
                        console.warn(`❌ CONFLICT: Tax ID ${receiver.id} from "${receiver.name}" is already assigned to a different client.`);
                        conflictCount++;
                    }
                } else {
                    syncedCount++;
                }
                continue;
            }

            // Name not found, check if Tax ID exists under a different name
            const existingById = await prisma.client.findUnique({
                where: { taxRegistrationNumber: receiver.id }
            });

            if (existingById) {
                // Renaming prioritized to handle multilingual aliases
                await prisma.client.update({
                    where: { id: existingById.id },
                    data: { name: receiver.name }
                });
                console.log(`🔄 RENAMED: "${existingById.name}" -> "${receiver.name}" (Tax ID: ${receiver.id})`);
                updatedCount++;
            } else {
                // Create new
                await prisma.client.create({
                    data: {
                        name: receiver.name,
                        taxRegistrationNumber: receiver.id
                    }
                });
                console.log(`✨ CREATED: "${receiver.name}" (Tax ID: ${receiver.id})`);
                createdCount++;
            }
        }

        console.log(`\n📊 Migration Summary:`);
        console.log(`✨ Created: ${createdCount}`);
        console.log(`📝 Updated/Renamed: ${updatedCount}`);
        console.log(`✅ Already Synced: ${syncedCount}`);
        console.log(`⚠️ Conflicts/Errors: ${conflictCount}`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrateClients();
