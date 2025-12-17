import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Building2, Plus, Edit } from "lucide-react";
import { DeleteClientButton } from "./dashboard/clients/[id]/delete-client-button";
import { unstable_noStore as noStore } from 'next/cache';
import { headers } from 'next/headers';

// Force dynamic rendering - don't cache this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

noStore(); // Explicitly disable caching

export default async function HomePage() {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/bcb70cbe-853b-467e-af13-77a09249f6df',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/page.tsx:16',message:'HomePage - Render start',data:{timestamp:Date.now(),nodeEnv:process.env.NODE_ENV},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  noStore(); // Ensure no caching
  // Use headers() to force dynamic rendering (this API is always dynamic)
  await headers(); // This forces the route to be dynamic
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/bcb70cbe-853b-467e-af13-77a09249f6df',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/page.tsx:22',message:'HomePage - After noStore and headers',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  let clients: Array<{
    id: string;
    name: string;
    contactInfo: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: { pos: number };
  }> = [];
  try {
    console.log("[HomePage] Fetching clients from database...");
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bcb70cbe-853b-467e-af13-77a09249f6df',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/page.tsx:35',message:'HomePage - Before DB query',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    clients = await prisma.client.findMany({
      include: {
        _count: {
          select: { pos: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bcb70cbe-853b-467e-af13-77a09249f6df',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/page.tsx:50',message:'HomePage - After DB query',data:{clientCount:clients.length,clientIds:clients.map(c=>c.id),clientNames:clients.map(c=>c.name),newestClientId:clients[0]?.id,newestClientName:clients[0]?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    console.log(`[HomePage] Successfully fetched ${clients.length} clients`);
    console.log("[HomePage] Client names:", clients.map(c => c.name));
  } catch (error) {
    // Always log errors in both development and production
    console.error("[HomePage] Database error:", error);
    if (error instanceof Error) {
      console.error("[HomePage] Error message:", error.message);
      console.error("[HomePage] Error stack:", error.stack);
    }
    clients = [];
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/logo-mark.png"
                alt="Laapak Logo"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Laapak PO</h1>
                <p className="text-xs sm:text-sm text-gray-500">Price Offer Generator</p>
              </div>
            </div>
            <Link
              href="/dashboard/clients/new"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <Plus size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">New Client</span>
              <span className="sm:hidden">New</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">Clients</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your clients and their Price Offers
          </p>
        </div>

        {clients.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No clients yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first client.
            </p>
            <Link
              href="/dashboard/clients/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors"
            >
              <Plus size={20} />
              Create Client
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:border-green-500 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <Link
                    href={`/dashboard/clients/${client.id}`}
                    className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center hover:bg-green-200 transition-colors"
                  >
                    <Building2 size={24} className="text-green-600" />
                  </Link>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/dashboard/clients/${client.id}/edit`}
                      className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title={`Edit ${client.name}`}
                    >
                      <Edit size={14} />
                    </Link>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <DeleteClientButton clientId={client.id} clientName={client.name} />
                    </div>
                    <span className="text-sm text-gray-500">
                      {client._count.pos} POs
                    </span>
                  </div>
                </div>
                <Link
                  href={`/dashboard/clients/${client.id}`}
                  className="block"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-green-600 transition-colors">
                    {client.name}
                  </h3>
                  {client.contactInfo && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {client.contactInfo}
                    </p>
                  )}
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
