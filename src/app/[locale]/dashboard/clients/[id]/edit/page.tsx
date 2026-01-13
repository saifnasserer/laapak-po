import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import {Link} from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { ClientForm } from "./client-form";

// Force dynamic rendering - don't cache this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClientPage({ params }: PageProps) {
  const { id } = await params;
  
  const client = await prisma.client.findUnique({
    where: { id },
  });

  if (!client) {
    notFound();
  }

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
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Edit Client</h1>
                <p className="text-xs sm:text-sm text-gray-500">Update client information</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ClientForm clientId={id} initialData={client} />
      </main>
    </div>
  );
}

