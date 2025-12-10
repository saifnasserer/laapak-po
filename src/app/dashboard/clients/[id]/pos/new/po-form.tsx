"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, FileText, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const DEFAULT_WARRANTY = `1- Warranty for periodic maintenance for a full year.
2- Warranty to replace the laptop in the event of a problem within a maximum period of 14 days.
3- Warranty (6 months) against maintenance defects`;

const DEFAULT_PAYMENT_TERMS = `Payment Structure:
• 50% payment upon delivery
• 50% payment also upon delivery, via a post-dated bank check dated with the agreed credit term (maximum 14 days)`;

interface LineItem {
  model: string;
  quantity: number;
  price: number;
  specs: string;
  notes: string;
}

interface PurchaseOffer {
  id: string;
  currency: string;
  taxRate: number;
  discount: number;
  validUntil: string | null;
  status: string;
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
  items: Array<{
    model: string;
    quantity: number;
    price: number;
    specs: string | null;
    notes: string | null;
  }>;
}

interface POFormProps {
  clientId: string;
  initialData?: PurchaseOffer;
}

function SpecsTextarea({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      onInput={handleInput}
      rows={1}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none overflow-hidden"
      placeholder={placeholder}
      style={{ minHeight: "2.5rem" }}
    />
  );
}

export function POForm({ clientId, initialData }: POFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [currency, setCurrency] = useState(initialData?.currency || "EGP");
  const [taxRate, setTaxRate] = useState(initialData?.taxRate || 0);
  const [discount, setDiscount] = useState(initialData?.discount || 0);
  // Set default validUntil to 3 days from now
  const getDefaultValidUntil = () => {
    if (initialData?.validUntil) {
      return new Date(initialData.validUntil).toISOString().split("T")[0];
    }
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toISOString().split("T")[0];
  };

  const [validUntil, setValidUntil] = useState(getDefaultValidUntil());
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [paymentTerms, setPaymentTerms] = useState(
    initialData?.paymentTerms || DEFAULT_PAYMENT_TERMS
  );
  const [warranty, setWarranty] = useState(
    initialData?.warranty || DEFAULT_WARRANTY
  );
  const [termsAndConditions, setTermsAndConditions] = useState(
    initialData?.termsAndConditions || ""
  );
  const [showProductOverview, setShowProductOverview] = useState(
    initialData?.showProductOverview ?? true
  );
  const [showWarranty, setShowWarranty] = useState(
    initialData?.showWarranty ?? true
  );
  const [showPricingSummary, setShowPricingSummary] = useState(
    initialData?.showPricingSummary ?? true
  );
  const [showWhyLaapak, setShowWhyLaapak] = useState(
    initialData?.showWhyLaapak ?? true
  );
  const [showPaymentTerms, setShowPaymentTerms] = useState(
    initialData?.showPaymentTerms ?? true
  );
  const [showTermsAndConditions, setShowTermsAndConditions] = useState(
    initialData?.showTermsAndConditions ?? true
  );
  const [showApproval, setShowApproval] = useState(
    initialData?.showApproval ?? true
  );
  
  const [items, setItems] = useState<LineItem[]>(
    initialData?.items && initialData.items.length > 0
      ? initialData.items.map((item) => ({
          model: item.model,
          quantity: item.quantity,
          price: item.price,
          specs: item.specs || "",
          notes: item.notes || "",
        }))
      : [
          {
            model: "",
            quantity: 1,
            price: 0,
            specs: "",
          notes: "",
          },
        ]
  );

  function addItem() {
    setItems([
      ...items,
      {
        model: "",
        quantity: 1,
        price: 0,
        specs: "",
        notes: "",
      },
    ]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  }

  function handlePriceChange(index: number, value: string) {
    // Allow empty string for deletion
    if (value === "") {
      updateItem(index, "price", 0);
      return;
    }
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");
    if (numericValue === "" || numericValue === ".") {
      updateItem(index, "price", 0);
    } else {
      const numValue = parseFloat(numericValue);
      if (!isNaN(numValue)) {
        updateItem(index, "price", numValue);
      }
    }
  }

  function handleSpecsResize(e: React.ChangeEvent<HTMLTextAreaElement>) {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate items
    if (items.length === 0) {
      setError("At least one line item is required");
      setIsSubmitting(false);
      return;
    }

    for (const item of items) {
      if (!item.model.trim()) {
        setError("All items must have a model name");
        setIsSubmitting(false);
        return;
      }
      if (item.quantity <= 0) {
        setError("All items must have a quantity greater than 0");
        setIsSubmitting(false);
        return;
      }
      if (item.price < 0) {
        setError("All items must have a valid price");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const url = initialData
        ? `/api/purchase-offers/${initialData.id}`
        : "/api/purchase-offers";
      const method = initialData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          currency,
          taxRate: Number(taxRate) || 0,
          discount: Number(discount) || 0,
          validUntil: validUntil || null,
          status,
          paymentTerms: paymentTerms.trim() || null,
          warranty: warranty.trim() || DEFAULT_WARRANTY,
          termsAndConditions: termsAndConditions.trim() || null,
          showProductOverview,
          showWarranty,
          showPricingSummary,
          showWhyLaapak,
          showPaymentTerms,
          showTermsAndConditions,
          showApproval,
          items: items.map((item) => ({
            model: item.model.trim(),
            quantity: Number(item.quantity),
            price: Number(item.price),
            specs: item.specs?.trim() || null,
            notes: item.notes?.trim() || null,
          })),
        }),
      });

      if (!response.ok) {
        let errorMsg = `Failed to ${initialData ? "update" : "create"} Price Offer`;
        try {
          const data = await response.json();
          if (process.env.NODE_ENV === "development") {
            console.error("API Error Response:", data);
          }
          errorMsg = data.details 
            ? `${data.error}: ${data.details}`
            : data.error || errorMsg;
          if (data.errorName) {
            errorMsg += ` (${data.errorName})`;
          }
        } catch {
          // If response is not JSON, try to get text
          try {
            const text = await response.text();
            if (process.env.NODE_ENV === "development") {
              console.error("API Error Text:", text);
            }
            errorMsg = text || errorMsg;
          } catch {
            // If that also fails, use default message
          }
        }
        throw new Error(errorMsg);
      }

      let po;
      try {
        po = await response.json();
      } catch {
        throw new Error("Failed to parse server response. Please try again.");
      }
      
      // Show success message briefly before redirecting
      setSuccess(true);
      setIsSubmitting(false);
      setError(null);
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        window.location.href = `/dashboard/clients/${clientId}/pos/${po.id}`;
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
      setSuccess(false);
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * (taxRate / 100);
  const totalBeforeDiscount = subtotal + tax;
  const discountAmount = Number(discount) || 0;
  const total = Math.max(0, totalBeforeDiscount - discountAmount);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Line Items */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors"
          >
            <Plus size={20} />
            Add Item
          </button>
        </div>

        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Item {index + 1}</h3>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={item.model}
                  onChange={(e) => updateItem(index, "model", e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="e.g., MacBook Pro 16-inch M2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                    min="1"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.price === 0 ? "" : item.price.toString()}
                    onChange={(e) => handlePriceChange(index, e.target.value)}
                    onBlur={(e) => {
                      if (e.target.value === "" || e.target.value === "0") {
                        updateItem(index, "price", 0);
                      }
                    }}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total
                  </label>
                  <div className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                    {formatCurrency(item.price * item.quantity, currency)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specifications
                </label>
                <SpecsTextarea
                  value={item.specs}
                  onChange={(value) => updateItem(index, "specs", value)}
                  placeholder="CPU, RAM, Storage, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={item.notes}
                  onChange={(e) => updateItem(index, "notes", e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                  placeholder="Additional notes or special instructions"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PO Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">PO Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value="EGP">EGP</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>

          <div>
            <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 mb-2">
              Tax Rate (%)
            </label>
            <input
              type="number"
              id="taxRate"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>

          <div>
            <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-2">
              Discount ({currency})
            </label>
            <input
              type="number"
              id="discount"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>

          <div>
            <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700 mb-2">
              Valid Until (Optional)
            </label>
            <input
              type="date"
              id="validUntil"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          >
            <option value="DRAFT">Pending</option>
            <option value="PUBLISHED">Approved</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>

        <div>
          <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700 mb-2">
            Payment Terms
          </label>
          <textarea
            id="paymentTerms"
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-y"
            placeholder="Enter payment terms..."
          />
        </div>

        <div>
          <label htmlFor="warranty" className="block text-sm font-medium text-gray-700 mb-2">
            Warranty
          </label>
          <textarea
            id="warranty"
            value={warranty}
            onChange={(e) => setWarranty(e.target.value)}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-y"
            placeholder="Enter warranty details..."
          />
        </div>

        <div>
          <label htmlFor="termsAndConditions" className="block text-sm font-medium text-gray-700 mb-2">
            Terms and Conditions
          </label>
          <textarea
            id="termsAndConditions"
            value={termsAndConditions}
            onChange={(e) => setTermsAndConditions(e.target.value)}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-y"
            placeholder="Enter terms and conditions..."
          />
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Section Visibility</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showProductOverview}
                onChange={(e) => setShowProductOverview(e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Product Overview</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showWarranty}
                onChange={(e) => setShowWarranty(e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Warranty</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPricingSummary}
                onChange={(e) => setShowPricingSummary(e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Pricing Summary</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showWhyLaapak}
                onChange={(e) => setShowWhyLaapak(e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Why Laapak?</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPaymentTerms}
                onChange={(e) => setShowPaymentTerms(e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Payment Terms</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showTermsAndConditions}
                onChange={(e) => setShowTermsAndConditions(e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Terms and Conditions</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showApproval}
                onChange={(e) => setShowApproval(e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Approval Section</span>
            </label>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal, currency)}</span>
          </div>
          {taxRate > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Tax ({taxRate}%):</span>
              <span>{formatCurrency(tax, currency)}</span>
            </div>
          )}
          {discountAmount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Discount:</span>
              <span>-{formatCurrency(discountAmount, currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t border-gray-200">
            <span>Total:</span>
            <span>{formatCurrency(total, currency)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          <span>Price Offer {initialData ? "updated" : "created"} successfully! Redirecting...</span>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting || success}
          className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          <FileText size={20} />
          {success
            ? "Success!"
            : isSubmitting
            ? initialData
              ? "Updating..."
              : "Creating..."
            : initialData
            ? "Update Price Offer"
            : "Create Price Offer"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

