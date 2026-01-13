"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { Building2 } from "lucide-react";
import { useTranslations } from 'next-intl';

export function ClientForm() {
  const router = useRouter();
  const t = useTranslations('ClientForm');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const contactInfo = formData.get("contactInfo") as string;

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          contactInfo: contactInfo || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t('errorCreating'));
      }

      const client = await response.json();

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/bcb70cbe-853b-467e-af13-77a09249f6df', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'dashboard/clients/new/client-form.tsx:38', message: 'ClientForm - Client created successfully', data: { clientId: client.id, clientName: client.name }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
      // #endregion

      // Refresh the router cache to ensure homepage shows new client
      router.refresh();

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/bcb70cbe-853b-467e-af13-77a09249f6df', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'dashboard/clients/new/client-form.tsx:45', message: 'ClientForm - Router refreshed, redirecting', data: { redirectTo: '/dashboard/clients/' + client.id }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
      // #endregion

      // Navigate to the new client page (this will fetch fresh data)
      // Use router.push with refresh to ensure cache is cleared
      router.push(`/dashboard/clients/${client.id}`);
      // Also do a hard redirect as fallback to ensure cache is cleared
      setTimeout(() => {
        window.location.href = `/dashboard/clients/${client.id}`;
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorOccurred'));
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t('companyName')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
            placeholder={t('enterCompanyName')}
          />
        </div>

        <div>
          <label
            htmlFor="contactInfo"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t('contactInfo')}
          </label>
          <textarea
            id="contactInfo"
            name="contactInfo"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors resize-none"
            placeholder="Email, phone, address, or other contact details"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            <Building2 size={20} />
            {isSubmitting ? t('creating') : t('createClient')}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}

