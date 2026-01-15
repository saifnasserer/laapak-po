import { reportService } from "@/lib/services/reportService";
import { DeviceReport } from "@/types/device-report";
import { Link } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { ArrowLeft, Smartphone, Calendar, CheckCircle, Image as ImageIcon, FileText, Activity } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { BackButton } from "../../../components/BackButton";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
    params: Promise<{
        id: string;      // clientId
        reportId: string;
        locale: string;
    }>;
}

export default async function ReportDetailPage({ params }: PageProps) {
    const { id: clientId, reportId, locale } = await params;
    const t = await getTranslations('ReportDetail');

    // Use the direct fetch method which now points to the correct endpoint
    const report = await reportService.getReport(reportId);

    if (!report) {
        notFound();
    }

    // Parse JSON fields
    let hardwareStatus: any[] = [];
    try {
        if (report.hardware_status) {
            hardwareStatus = JSON.parse(report.hardware_status);
        }
    } catch (e) {
        console.error("Failed to parse hardware_status", e);
    }

    let externalImages: any[] = [];
    try {
        if (report.external_images) {
            externalImages = JSON.parse(report.external_images);
        }
    } catch (e) {
        console.error("Failed to parse external_images", e);
    }


    // Filter media types
    const deviceImages = externalImages.filter(img =>
        typeof img === 'string' ||
        (img.type === 'image' || img.type === 'video' || !img.type)
    );

    const testScreenshots = externalImages.filter(img =>
        img.type === 'test_screenshot'
    );

    const isRTL = locale === 'ar';

    return (
        <div className="min-h-screen bg-gray-50 pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <BackButton
                            isRTL={isRTL}
                            fallbackUrl={`/dashboard/clients/${clientId}`}
                        />
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Smartphone className="text-purple-600" size={24} />
                                {report.device_model}
                            </h1>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                <span className="font-mono">{report.serial_number}</span>
                                <span className="text-gray-300">•</span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={14} className="text-gray-400" />
                                    {new Date(report.inspection_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${report.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {report.status}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* Hardware Status - Full Width */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wider text-xs">
                        <CheckCircle size={14} className="text-green-600" />
                        {t('hardwareCheck')}
                    </h2>

                    {hardwareStatus.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {hardwareStatus.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                                    <span className="font-medium text-gray-700 text-sm capitalize truncate pr-2">{item.componentName || item.component || item.name}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${item.status === 'working' || item.status === 'good' || item.status === 'passed'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <CheckCircle size={32} className="mx-auto mb-2 opacity-20" />
                            <p className="text-sm">{t('noHardwareData')}</p>
                        </div>
                    )}
                </div>

                {/* Technician Notes - Full Width */}
                {report.notes && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wider text-xs">
                            <FileText size={14} className="text-yellow-600" />
                            {t('technicianNotes')}
                        </h2>
                        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm leading-relaxed border border-yellow-100 italic">
                            "{report.notes}"
                        </div>
                    </div>
                )}

                {/* Device Images & Videos */}
                {deviceImages.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wider text-xs">
                            <ImageIcon size={14} className="text-blue-600" />
                            {t('deviceImages')}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {deviceImages.map((media, idx) => (
                                <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative group">
                                    {media.type === 'video' ? (
                                        <video
                                            src={media.url}
                                            controls
                                            className="w-full h-full object-cover"
                                            poster={media.preview || undefined} // Fallback if preview exists
                                        />
                                    ) : (
                                        <img
                                            src={media.url || (typeof media === 'string' ? media : '')}
                                            alt={`Device ${idx + 1}`}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Test Screenshots */}
                {testScreenshots.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wider text-xs">
                            <Activity size={14} className="text-indigo-600" />
                            {t('testScreenshots')}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {testScreenshots.map((img, idx) => (
                                <div key={idx} className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative group">
                                    <img
                                        src={img.url}
                                        alt={`Test ${idx + 1}`}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                    {img.component && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1.5 text-center font-medium backdrop-blur-sm">
                                            {img.component}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </main>
        </div >
    );
}
