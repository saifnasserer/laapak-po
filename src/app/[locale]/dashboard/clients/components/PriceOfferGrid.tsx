import { Link } from "@/i18n/routing";
import { formatCurrency } from "@/lib/utils";
import { FileText, Plus, ExternalLink, Edit, ShoppingBasket, Eye } from "lucide-react";
import { DeletePOButton } from "../[id]/delete-po-button";
import { useTranslations } from 'next-intl';

interface PriceOfferGridProps {
    pos: any[];
    clientId: string;
}

export function PriceOfferGrid({ pos, clientId }: PriceOfferGridProps) {
    const t = useTranslations('PriceOffer');

    if (pos.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">{t('noPOs')}</h3>
                <p className="text-gray-500 mb-6 text-sm">{t('createFirstPO')}</p>
                <Link
                    href={`/dashboard/clients/${clientId}/pos/new`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
                >
                    <Plus size={20} />
                    {t('createFirst')}
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pos.map((po) => {
                const total = po.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
                const dateString = new Date(po.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: '2-digit'
                });
                const viewCount = po.views?.length || 0;

                return (
                    <div
                        key={po.id}
                        className="bg-white rounded-xl border border-gray-200 p-3 hover:border-green-400 hover:shadow-md transition-all group flex flex-col h-full"
                    >
                        {/* Row 1: Status, PO Name, Items */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`text-[9px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded ${po.status === "PUBLISHED"
                                        ? "bg-green-100 text-green-700"
                                        : po.status === "EXPIRED"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-yellow-100 text-yellow-700"
                                        }`}
                                >
                                    {po.status === "PUBLISHED" ? t('sent') : po.status === "EXPIRED" ? t('expired') : t('draft')}
                                </span>
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-tight truncate max-w-[80px]">
                                    PO-{po.publicId}
                                </h3>
                            </div>
                            <div className="flex items-center gap-1.5 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                <ShoppingBasket size={10} className="text-gray-400" />
                                <span className="text-[10px] font-black text-gray-700">{po.items.length}</span>
                            </div>
                        </div>

                        {/* Row 2: Date & View Count */}
                        <div className="flex items-center justify-between mb-3 text-[10px] text-gray-400 font-medium">
                            <p>{dateString}</p>
                            <div className="flex items-center gap-1">
                                <Eye size={10} />
                                <span>{viewCount} {t('views')}</span>
                            </div>
                        </div>

                        {/* Row 3: Total Amount */}
                        <div className="bg-gray-50 rounded-lg p-2 mb-3">
                            <p className="text-sm font-black text-gray-900 leading-none">
                                {formatCurrency(total, po.currency)}
                            </p>
                        </div>

                        {/* Row 4: Actions */}
                        <div className="flex items-center gap-2 mt-auto">
                            <Link
                                href={`/p/${po.publicId}`}
                                target="_blank"
                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-[10px] font-black uppercase tracking-wider"
                            >
                                <ExternalLink size={12} />
                                View
                            </Link>
                            <Link
                                href={`/dashboard/clients/${clientId}/pos/${po.id}`}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors text-[10px] font-black uppercase tracking-wider"
                            >
                                <Edit size={12} />
                                Edit
                            </Link>
                            <DeletePOButton poId={po.id} clientId={clientId} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
