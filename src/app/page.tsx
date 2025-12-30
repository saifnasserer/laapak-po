import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Building2, Plus, Edit, Star, Search } from "lucide-react";
import { DeleteClientButton } from "./dashboard/clients/[id]/delete-client-button";
import { unstable_noStore as noStore } from 'next/cache';
import { headers, cookies } from 'next/headers';
import { PasswordGate } from "./components/PasswordGate";
import { getFavorites } from "@/lib/favorites";
import { FavoriteToggleButton } from "./components/FavoriteToggleButton";
import { ClientSearch } from "./components/ClientSearch";

// Force dynamic rendering - don't cache this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  noStore();
  await headers();

  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token');
  const isAuthenticated = authToken?.value === 'authenticated';

  if (!isAuthenticated) {
    return <PasswordGate />;
  }

  const resolvedParams = await searchParams;
  const searchQuery = typeof resolvedParams.search === 'string' ? resolvedParams.search : '';

  interface ClientWithCount {
    id: string;
    name: string;
    contactInfo: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: { pos: number };
  }

  let clients: ClientWithCount[] = [];
  try {
    clients = await prisma.client.findMany({
      where: searchQuery ? {
        name: { contains: searchQuery }
      } : {},
      include: {
        _count: {
          select: { pos: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }) as any;
  } catch (error) {
    console.error("[HomePage] Database error:", error);
  }

  const favoriteIds = await getFavorites();

  // Separate into favorites and others
  const favoriteClients = clients
    .filter(c => favoriteIds.includes(c.id))
    .slice(0, 3); // Limit favorites section to 3

  const otherClients = clients.filter(c => !favoriteIds.includes(c.id) || !favoriteClients.find(fav => fav.id === c.id));

  const SectionHeading = ({ children, icon: Icon, count }: { children: React.ReactNode, icon?: any, count?: number }) => (
    <div className="flex items-center justify-between mb-6 group">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={20} className="text-green-600" />}
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{children}</h2>
        {count !== undefined && (
          <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent ml-4" />
    </div>
  );

  const ClientCard = ({ client, isFavorite }: { client: any, isFavorite: boolean }) => (
    <div
      key={client.id}
      className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-green-500 hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 group relative overflow-hidden"
    >
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-50/50 to-transparent -mr-12 -mt-12 rounded-full group-hover:scale-150 transition-transform duration-500" />

      <div className="flex items-start justify-between mb-5 relative">
        <Link
          href={`/dashboard/clients/${client.id}`}
          className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center group-hover:bg-green-100 transition-colors duration-300"
        >
          <Building2 size={28} className="text-green-600" />
        </Link>
        <div className="flex items-center gap-1">
          <FavoriteToggleButton clientId={client.id} initialIsFavorite={isFavorite} />
          <Link
            href={`/dashboard/clients/${client.id}/edit`}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-all duration-200"
            title={`Edit ${client.name}`}
          >
            <Edit size={18} />
          </Link>
          <DeleteClientButton clientId={client.id} clientName={client.name} />
        </div>
      </div>

      <Link href={`/dashboard/clients/${client.id}`} className="block relative">
        <h3 className="text-lg font-bold text-gray-900 mb-1.5 group-hover:text-green-600 transition-colors line-clamp-1">
          {client.name}
        </h3>
        {client.contactInfo && (
          <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem] leading-relaxed">
            {client.contactInfo}
          </p>
        )}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex -space-x-2">
            {[...Array(Math.min(client._count.pos, 3))].map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-green-100 flex items-center justify-center text-[10px] font-bold text-green-700">
                {i === 2 && client._count.pos > 3 ? '+' : ''}
              </div>
            ))}
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {client._count.pos} Price Offers
          </span>
        </div>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src="/assets/cropped-Logo-mark.png.png"
                alt="Laapak Logo"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Laapak PO</h1>
                <p className="text-xs font-bold text-green-600 uppercase tracking-widest">Generator</p>
              </div>
            </div>

            <div className="flex-1 max-w-2xl w-full flex flex-col sm:flex-row items-center gap-4">
              <ClientSearch />
              <Link
                href="/dashboard/clients/new"
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 whitespace-nowrap"
              >
                <Plus size={20} strokeWidth={3} />
                <span>New Client</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {clients.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={40} className="text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchQuery ? `No results for "${searchQuery}"` : "No clients yet"}
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {searchQuery
                ? "Try adjusting your search terms or create a new client instead."
                : "Get started by creating your first client and generating professional price offers."}
            </p>
            {!searchQuery && (
              <Link
                href="/dashboard/clients/new"
                className="inline-flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-xl shadow-green-100"
              >
                <Plus size={20} strokeWidth={3} />
                Create First Client
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Favorites Section */}
            {favoriteClients.length > 0 && (
              <div>
                <SectionHeading icon={Star} count={favoriteClients.length}>Favorites</SectionHeading>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteClients.map((client) => (
                    <ClientCard key={client.id} client={client} isFavorite={true} />
                  ))}
                </div>
              </div>
            )}

            {/* All Clients Section */}
            {otherClients.length > 0 && (
              <div>
                <SectionHeading icon={Building2} count={otherClients.length}>
                  {favoriteClients.length > 0 ? "Other Clients" : "All Clients"}
                </SectionHeading>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherClients.map((client) => (
                    <ClientCard key={client.id} client={client} isFavorite={favoriteIds.includes(client.id)} />
                  ))}
                </div>
              </div>
            )}

            {otherClients.length === 0 && favoriteClients.length === 0 && searchQuery && (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No clients found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
