import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, FileText, ExternalLink, Edit } from "lucide-react";
import { formatCurrency, shouldBeExpired } from "@/lib/utils";
import { DeletePOButton } from "./delete-po-button";
import { DeleteClientButton } from "./delete-client-button";
import { unstable_noStore as noStore } from 'next/cache';

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
  
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      pos: {
        include: {
          items: true,
          _count: {
            select: { views: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) {
    notFound();
  }

  // Check and update expired POs
  const expiredPOs = client.pos.filter(po => 
    po.validUntil && 
    po.status !== "EXPIRED" && 
    shouldBeExpired(po.validUntil)
  );

  // Update expired POs in the database
  if (expiredPOs.length > 0) {
    await Promise.all(
      expiredPOs.map(po =>
        prisma.purchaseOffer.update({
          where: { id: po.id },
          data: { status: "EXPIRED" },
        })
      )
    );
  }

  // Refetch client data to get updated statuses
  const updatedClient = await prisma.client.findUnique({
    where: { id },
    include: {
      pos: {
        include: {
          items: true,
          _count: {
            select: { views: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!updatedClient) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
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
                  <p className="text-xs sm:text-sm text-gray-500">
                    {updatedClient.pos.length} Price Offer{updatedClient.pos.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Link
                href={`/dashboard/clients/${id}/edit`}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
                title="Edit Client"
              >
                <Edit size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
              <DeleteClientButton clientId={id} clientName={updatedClient.name} />
              <Link
                href={`/dashboard/clients/${id}/pos/new`}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <Plus size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">New PO</span>
                <span className="sm:hidden">New</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Client Info */}
        {updatedClient.contactInfo && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Contact Information</h2>
            <p className="text-gray-600 whitespace-pre-line">{updatedClient.contactInfo}</p>
          </div>
        )}

        {/* Price Offers */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Price Offers</h2>
          {updatedClient.pos.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Price Offers yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first Price Offer for this client.
              </p>
              <Link
                href={`/dashboard/clients/${id}/pos/new`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors"
              >
                <Plus size={20} />
                Create PO
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {updatedClient.pos.map((po) => {
                const total = po.items.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                );
                return (
                  <div
                    key={po.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:border-green-500 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText size={24} className="text-green-600" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            po.status === "PUBLISHED"
                              ? "bg-green-100 text-green-700"
                              : po.status === "EXPIRED"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {po.status === "PUBLISHED"
                            ? "Approved"
                            : po.status === "EXPIRED"
                            ? "Expired"
                            : "Pending"}
                        </span>
                        <DeletePOButton poId={po.id} clientId={id} />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      PO-{po.publicId.toUpperCase()}
                    </h3>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{po.items.length}</span> item
                        {po.items.length !== 1 ? "s" : ""}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total: <span className="font-medium">{formatCurrency(total, po.currency)}</span>
                      </p>
                      {po._count.views > 0 && (
                        <p className="text-sm text-gray-500">
                          {po._count.views} view{po._count.views !== 1 ? "s" : ""}
                        </p>
                      )}
                      {po.validUntil && (
                        <p className="text-sm text-gray-500">
                          Valid until: {new Date(po.validUntil).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/p/${po.publicId}`}
                        target="_blank"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
                      >
                        <ExternalLink size={16} />
                        View
                      </Link>
                      <Link
                        href={`/dashboard/clients/${id}/pos/${po.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
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
      </main>
    </div>
  );
}

