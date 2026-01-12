const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    try {
        const id = 'fbaa46d2-792a-4620-b538-679541937437';
        console.log(`--- Checking Client: ${id} ---`);
        const client = await prisma.client.findUnique({
            where: { id },
            include: { etaInvoices: true }
        });

        if (!client) {
            console.log('Client not found!');
            return;
        }

        console.log(`Client: ${client.name}`);
        console.log(`Tax ID: "${client.taxRegistrationNumber}" (Length: ${client.taxRegistrationNumber?.length})`);
        console.log(`Invoices in relation: ${client.etaInvoices.length}`);

        const invoices = await prisma.eTAInvoice.findMany({
            where: { receiverId: client.taxRegistrationNumber },
            select: { uuid: true, internalId: true, totalAmount: true, totalTax: true, status: true }
        });
        console.table(invoices);

        const allInvoices = await prisma.eTAInvoice.findMany({
            select: { receiverId: true }
        });
        console.log('\nAll ReceiverIDs in DB:');
        allInvoices.forEach(inv => {
            console.log(`- "${inv.receiverId}" (Length: ${inv.receiverId.length})`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
