import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, FileText, ExternalLink, Edit, Receipt } from "lucide-react";
import { formatCurrency, shouldBeExpired } from "@/lib/utils";
import { DeletePOButton } from "./delete-po-button";
import { DeleteClientButton } from "./delete-client-button";
import { unstable_noStore as noStore } from 'next/cache';
import { InvoiceTable } from "../components/InvoiceTable";
import { FetchButton } from "../components/FetchButton";
import { ClientDashboardTabs } from "../components/ClientDashboardTabs";
import { getTranslations } from 'next-intl/server';

// Force dynamic rendering - don't cache this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

noStore(); // Explicitly disable caching

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: PageProps) {
  noStore(); // Ensure no caching
  const { id } = await params;
  const t = await getTranslations('ClientDetails');

  // Initial fetch
  const client = await (prisma.client as any).findUnique({
    where: { id },
    include: {
      pos: {
        include: {
          items: true,
          views: true,
        },
        orderBy: { createdAt: "desc" },
      },
      etaInvoices: { orderBy: { dateTimeIssued: 'desc' } }
    }
  });

  if (!client) {
    notFound();
  }

  // Check and update expired POs
  const expiredPOs = (client as any).pos.filter((po: any) =>
    po.validUntil &&
    po.status === "DRAFT" &&
    shouldBeExpired(po.validUntil)
  );

  if (expiredPOs.length > 0) {
    await Promise.all(
      expiredPOs.map((po: any) =>
        prisma.purchaseOffer.update({
          where: { id: po.id },
          data: { status: "EXPIRED" },
        })
      )
    );
  }

  // Refetch updated data
  const updatedClient = await (prisma.client as any).findUnique({
    where: { id },
    include: {
      pos: {
        include: {
          items: true,
          _count: { select: { views: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      etaInvoices: { orderBy: { dateTimeIssued: 'desc' } }
    }
  });

  if (!updatedClient) {
    notFound();
  }


  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900 shrink-0"
              >
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 shrink-0">
                  <img
                    src="/assets/logo-mark.png"
                    alt="Logo"
                    className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-black text-gray-900 truncate tracking-tight">{updatedClient.name}</h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    {updatedClient.taxRegistrationNumber && (
                      <p className="text-[10px] sm:text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 uppercase tracking-tight">
                        {t('etaId')}: {updatedClient.taxRegistrationNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Link
                href={`/dashboard/clients/${id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold shadow-sm"
              >
                <Edit size={18} className="text-gray-400" />
                <span>{t('editProfile')}</span>
              </Link>
              <DeleteClientButton clientId={id} clientName={updatedClient.name} />
              <Link
                href={`/dashboard/clients/${id}/pos/new`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all text-sm font-bold shadow-md hover:shadow-lg"
              >
                <Plus size={18} />
                <span>{t('newPriceOffer')}</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ClientDashboardTabs
          clientId={id}
          invoices={(updatedClient as any).etaInvoices}
          pos={updatedClient.pos}
          taxRegistrationNumber={updatedClient.taxRegistrationNumber}
          contactInfo={updatedClient.contactInfo}
          createdAt={updatedClient.createdAt}
        />
      </main>
    </div>
  );
}


