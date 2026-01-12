import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, FileText, ExternalLink, Edit, Receipt } from "lucide-react";
import { formatCurrency, shouldBeExpired } from "@/lib/utils";
import { DeletePOButton } from "./delete-po-button";
import { DeleteClientButton } from "./delete-client-button";
import { unstable_noStore as noStore } from 'next/cache';
import { InvoiceTable } from "../components/InvoiceTable";
import { FetchButton } from "../components/FetchButton";
import { TaxRegistrationControl } from "../components/TaxRegistrationControl";

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

  // Initial fetch
  const client = await (prisma.client as any).findUnique({
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

  const totalInvoicedValue = updatedClient.etaInvoices.reduce((sum: number, inv: any) => sum + inv.totalAmount, 0);
  const totalOffersValue = updatedClient.pos.reduce((sum: number, po: any) => {
    return sum + po.items.reduce((itemSum: number, item: any) => itemSum + item.price * item.quantity, 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors shrink-0"
              >
                <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Back</span>
              </Link>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <img
                  src="/assets/logo-mark.png"
                  alt="Laapak Logo"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain shrink-0"
                />
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{updatedClient.name}</h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs sm:text-sm text-gray-500">
                      {updatedClient.pos.length} Price Offer{updatedClient.pos.length !== 1 ? "s" : ""}
                    </p>
                    {updatedClient.taxRegistrationNumber && (
                      <>
                        <span className="text-gray-300">•</span>
                        <p className="text-[10px] sm:text-xs text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-tight">
                          ETA ID: {updatedClient.taxRegistrationNumber}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Link
                href={`/dashboard/clients/${id}/edit`}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center font-medium"
              >
                <Edit size={18} />
                <span>Edit</span>
              </Link>
              <DeleteClientButton clientId={id} clientName={updatedClient.name} />
              <Link
                href={`/dashboard/clients/${id}/pos/new`}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center font-medium shadow-sm"
              >
                <Plus size={18} />
                <span>New PO</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-500 mb-1">Total Offered</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalOffersValue, "EGP")}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-blue-500">
            <p className="text-sm font-medium text-gray-500 mb-1">Total Invoiced (ETA)</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(totalInvoicedValue, "EGP")}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-500 mb-1">Offers Count</p>
            <p className="text-xl font-bold text-gray-900">{updatedClient.pos.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-500 mb-1">Invoices Count</p>
            <p className="text-xl font-bold text-gray-900">{updatedClient.etaInvoices.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                Company Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact Info</label>
                  <p className="text-gray-600 text-sm mt-1 whitespace-pre-line">
                    {updatedClient.contactInfo || "No contact information provided."}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white shadow-lg">
              <h3 className="font-bold mb-2">Sync with ETA</h3>
              <p className="text-gray-400 text-sm mb-4">
                Pull the latest invoices directly from the Egyptian Tax Authority portal.
              </p>
              <FetchButton
                receiverId={updatedClient.taxRegistrationNumber}
                initialLastSyncDate={updatedClient.etaInvoices[0]?.dateTimeIssued?.toISOString()}
              />
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-8">
            {/* ETA Invoices Section */}
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Receipt className="text-blue-500" size={24} />
                  ETA Invoices
                </h2>
                <div className="w-full sm:w-80">
                  <TaxRegistrationControl clientId={id} initialValue={updatedClient.taxRegistrationNumber} />
                </div>
              </div>

              {!updatedClient.taxRegistrationNumber ? (
                <div className="bg-white rounded-xl border border-dashed border-blue-200 p-12 text-center shadow-sm">
                  <Receipt size={48} className="mx-auto text-blue-100 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Invoices Not Linked</h3>
                  <p className="text-gray-500 mb-6 text-sm">Please provide a Tax Registration Number to fetch invoices from ETA.</p>
                </div>
              ) : (
                <InvoiceTable invoices={(updatedClient as any).etaInvoices} />
              )}
            </div>

            {/* Price Offers Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="text-green-500" size={24} />
                  Price Offers
                </h2>
              </div>

              {updatedClient.pos.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                  <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No Price Offers</h3>
                  <p className="text-gray-500 mb-6 text-sm">Create your first Price Offer for this client.</p>
                  <Link
                    href={`/dashboard/clients/${id}/pos/new`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
                  >
                    <Plus size={20} />
                    Create First PO
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {updatedClient.pos.map((po: any) => {
                    const total = po.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
                    return (
                      <div
                        key={po.id}
                        className="bg-white rounded-xl border border-gray-200 p-5 hover:border-green-400 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                            <FileText size={20} className="text-green-600" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${po.status === "PUBLISHED"
                                ? "bg-green-100 text-green-700"
                                : po.status === "EXPIRED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                                }`}
                            >
                              {po.status === "PUBLISHED" ? "Approved" : po.status === "EXPIRED" ? "Expired" : "Pending"}
                            </span>
                            <DeletePOButton poId={po.id} clientId={id} />
                          </div>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">
                          PO-{po.publicId.toUpperCase()}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4 font-medium">
                          {formatCurrency(total, po.currency)}
                        </p>

                        <div className="flex items-center gap-2 mt-auto">
                          <Link
                            href={`/p/${po.publicId}`}
                            target="_blank"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold"
                          >
                            <ExternalLink size={14} />
                            View
                          </Link>
                          <Link
                            href={`/dashboard/clients/${id}/pos/${po.id}`}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-xs font-bold"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


