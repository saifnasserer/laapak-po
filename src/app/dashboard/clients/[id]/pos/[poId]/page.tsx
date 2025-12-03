import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { POForm } from "../new/po-form";

interface PageProps {
  params: Promise<{ id: string; poId: string }>;
}

export default async function EditPOPage({ params }: PageProps) {
  const { id, poId } = await params;
  
  const client = await prisma.client.findUnique({
    where: { id },
  });

  if (!client) {
    notFound();
  }

  const po = await prisma.purchaseOffer.findUnique({
    where: { id: poId },
    include: {
      items: true,
    },
  });

  if (!po || po.clientId !== id) {
    notFound();
  }

  // Convert Date objects to strings for the form component
  const poForForm = {
    ...po,
    validUntil: po.validUntil ? po.validUntil.toISOString().split('T')[0] : null,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <Link
              href={`/dashboard/clients/${id}`}
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
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Edit Price Offer</h1>
                <p className="text-xs sm:text-sm text-gray-500">PO-{po.publicId.toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <POForm clientId={id} initialData={poForForm as any} />
      </main>
    </div>
  );
}

