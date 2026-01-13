"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { Trash2 } from "lucide-react";

interface DeletePOButtonProps {
  poId: string;
  clientId: string;
}

export function DeletePOButton({ poId, clientId }: DeletePOButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/purchase-offers/${poId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete Price Offer");
      }

      // Redirect to client page to show updated list (force fresh data)
      window.location.href = `/dashboard/clients/${clientId}`;
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete Price Offer");
      setIsDeleting(false);
      setShowConfirm(false);
    }
  }

  function handleCancel() {
    setShowConfirm(false);
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleCancel}
          disabled={isDeleting}
          className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          <Trash2 size={12} />
          {isDeleting ? "Deleting..." : "Confirm"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleDelete}
      className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
      title="Delete Price Offer"
    >
      <Trash2 size={16} />
    </button>
  );
}

