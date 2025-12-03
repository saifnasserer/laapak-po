"use client";

import { formatCurrency } from "@/lib/utils";
import { Download, Printer } from "lucide-react";

interface LineItem {
  id: string;
  model: string;
  quantity: number;
  price: number;
  specs: string | null;
  qcProcess: string | null;
  notes: string | null;
  deliveryTime: string | null;
}

interface Client {
  id: string;
  name: string;
  contactInfo: string | null;
}

interface PurchaseOffer {
  id: string;
  publicId: string;
  status: string;
  clientId: string;
  client: Client;
  validUntil: string | null;
  currency: string;
  taxRate: number;
  paymentTerms: string | null;
  warranty: string | null;
  termsAndConditions: string | null;
  showProductOverview: boolean;
  showWarranty: boolean;
  showPricingSummary: boolean;
  showWhyLaapak: boolean;
  showPaymentTerms: boolean;
  showTermsAndConditions: boolean;
  showApproval: boolean;
  items: LineItem[];
  createdAt: string;
}

interface PublicPOViewProps {
  po: PurchaseOffer;
}

export function PublicPOView({ po }: PublicPOViewProps) {
  const subtotal = po.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * (po.taxRate / 100);
  const total = subtotal + tax;
  
  // Check if all items have quantity of 1
  const allQuantitiesAreOne = po.items.every(item => item.quantity === 1);

  function handleDownloadPDF() {
    window.open(`/api/pdf/${po.publicId}`, "_blank");
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Action Bar - Hidden when printing */}
      <header className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/logo-mark.png"
                alt="Laapak Logo"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Price Offer</h1>
                <p className="text-xs sm:text-sm text-gray-500">PO-{po.publicId.toUpperCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={handleDownloadPDF}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors text-sm sm:text-base"
              >
                <Download size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                <Printer size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Print</span>
                <span className="sm:hidden">Print</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 1. Cover Page */}
        <section className="mb-12 text-center cover-page print:mb-0">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <img
                src="/assets/logo.png"
                alt="Laapak Logo"
                className="w-32 h-32 object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Price Offer</h1>
            <p className="text-xl text-gray-600 mb-2">Prepared for</p>
            <p className="text-2xl font-semibold text-gray-900">{po.client.name}</p>
          </div>
          <div className="border-t border-gray-200 pt-6 mt-8 print:mt-6 text-sm text-gray-600">
            <p>Prepared By: Laapak Sales Team</p>
            <p className="mt-2" suppressHydrationWarning>
              Date: {new Date(po.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            {po.validUntil && (
              <p className="mt-2" suppressHydrationWarning>
                Valid Until: {new Date(po.validUntil).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
        </section>

        {/* 2. Product Overview With Prices */}
        {po.showProductOverview && (
        <section className="mb-12 print:page-break-before-always">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Overview</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Model</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Specifications</th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">Unit Price</th>
                  {!allQuantitiesAreOne && (
                    <>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-24">QTY</th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">Total Price</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {po.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 text-gray-900 font-medium">{item.model}</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700 text-sm whitespace-pre-line">{item.specs || "—"}</td>
                    <td className="border border-gray-300 px-4 py-3 text-center text-gray-700">{formatCurrency(item.price, po.currency)}</td>
                    {!allQuantitiesAreOne && (
                      <>
                        <td className="border border-gray-300 px-4 py-3 text-center text-gray-700">{item.quantity}</td>
                        <td className="border border-gray-300 px-4 py-3 text-center font-medium text-gray-900">{formatCurrency(item.price * item.quantity, po.currency)}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Notes Section - Show if any item has notes */}
          {po.items.some(item => item.notes && item.notes.trim()) && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
              <div className="space-y-4">
                {po.items.map((item) => 
                  item.notes && item.notes.trim() ? (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <p className="text-sm font-medium text-gray-900 mb-1">{item.model}</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{item.notes}</p>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}
        </section>
        )}

        {/* 3. Warranty Section */}
        {po.showWarranty && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Warranty</h2>
          <div className="border border-gray-200 rounded-lg p-8 bg-gray-50">
            {po.warranty && po.warranty.trim() ? (
              <div className="text-gray-700 whitespace-pre-line leading-relaxed text-base">
                {po.warranty}
              </div>
            ) : (
              <p className="text-gray-700">Warranty information will be provided upon order confirmation.</p>
            )}
          </div>
        </section>
        )}

        {/* 4. Pricing Summary Table */}
        {po.showPricingSummary && (
        <section className="mb-12 page-break-after">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pricing Summary</h2>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <table className="w-full">
              <tbody>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">Subtotal</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">{formatCurrency(subtotal, po.currency)}</td>
                </tr>
                {po.taxRate > 0 && (
                  <tr>
                    <td className="px-6 py-4 text-gray-700">Tax ({po.taxRate}%)</td>
                    <td className="px-6 py-4 text-right text-gray-700">{formatCurrency(tax, po.currency)}</td>
                  </tr>
                )}
                <tr className="bg-green-50 border-t-2 border-green-600">
                  <td className="px-6 py-4 font-bold text-lg text-gray-900">Grand Total</td>
                  <td className="px-6 py-4 text-right font-bold text-lg text-gray-900">{formatCurrency(total, po.currency)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {po.validUntil && (
            <p className="mt-4 text-sm text-gray-600" suppressHydrationWarning>
              Price valid until: {new Date(po.validUntil).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })}
          </p>
        )}
        </section>
        )}

        {/* 5. Why Laapak? */}
        {po.showWhyLaapak && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Laapak?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Laapak Report</h3>
              <p className="text-gray-700 text-sm">
                Comprehensive device reports with detailed specifications, condition assessment, and quality metrics.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">QC Process</h3>
              <p className="text-gray-700 text-sm">
                Rigorous quality control testing ensures every device meets our high standards before delivery.
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Warranty & Replacement</h3>
              <p className="text-gray-700 text-sm">
                Comprehensive warranty coverage with quick replacement process for any manufacturing defects.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Support Response Time</h3>
              <p className="text-gray-700 text-sm">
                Dedicated support team with fast response times to address any questions or concerns.
              </p>
            </div>
            
          </div>
        </section>
        )}

        {/* 6. Payment Terms */}
        {po.showPaymentTerms && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Terms</h2>
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            {po.paymentTerms ? (
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {po.paymentTerms}
              </div>
            ) : (
              <div className="space-y-4 text-gray-700">
                <div>
                  <p className="font-medium text-gray-900 mb-2">Payment Structure:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• 50% payment upon delivery</li>
                    <li>• 50% payment also upon delivery, via a post-dated bank check dated with the agreed credit term (maximum 14 days)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>
        )}

        {/* 7. Terms and Conditions */}
        {po.showTermsAndConditions && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Terms and Conditions</h2>
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            {po.termsAndConditions && po.termsAndConditions.trim() ? (
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {po.termsAndConditions}
              </div>
            ) : (
              <p className="text-gray-700">Terms and conditions will be provided upon order confirmation.</p>
            )}
          </div>
        </section>
        )}

        {/* 8. Delivery Timeline */}
        {/* <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Timeline</h2>
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900">Reports Preparing</h3>
                <p className="text-sm text-gray-600 mt-1">1-2 business days</p>
              </div>
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900">Delivery</h3>
                <p className="text-sm text-gray-600 mt-1">1 business day</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center mt-4">
              Total estimated delivery time: 2-3 business days from order confirmation
            </p>
          </div>
        </section> */}

        {/* 9. Approval Section */}
        {po.showApproval && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Approval</h2>
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Client Approval</h3>
                <div className="mt-16 border-t-2 border-gray-300 pt-2">
                  <p className="text-sm text-gray-600">Signature</p>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Date: _________________</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Laapak</h3>
                <div className="mt-16 border-t-2 border-gray-300 pt-2">
                  <p className="text-sm text-gray-600">Authorized Signature</p>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600" suppressHydrationWarning>
                    Date: {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        )}

      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          body {
            background: white;
          }
          @page {
            margin: 1cm;
          }
          @page:first {
            margin: 0;
          }
          .cover-page {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 2cm;
            margin: 0 !important;
            margin-bottom: 0 !important;
            width: 100%;
            box-sizing: border-box;
            page-break-after: avoid;
            break-after: avoid;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .cover-page > div {
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
          }
          .cover-page .border-t {
            margin-top: 2rem;
          }
          /* Force next section to start on new page */
          .print\\:page-break-before-always {
            page-break-before: always !important;
            break-before: page !important;
            margin-top: 0 !important;
            padding-top: 0 !important;
          }
          /* Remove all spacing from first section after cover */
          .cover-page ~ section:first-of-type {
            margin-top: 0 !important;
            padding-top: 0 !important;
          }
          .page-break-after {
            page-break-after: always;
            break-after: page;
          }
        }
      `}</style>
    </div>
  );
}

