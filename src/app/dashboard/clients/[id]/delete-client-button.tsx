"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X, AlertTriangle } from "lucide-react";

interface DeleteClientButtonProps {
  clientId: string;
  clientName: string;
}

export function DeleteClientButton({ clientId, clientName }: DeleteClientButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [poCount, setPoCount] = useState<number | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState(false);

  // Fetch PO count when confirmation dialog opens
  useEffect(() => {
    if (showConfirm && poCount === null) {
      setIsLoadingCount(true);
      fetch(`/api/clients/${clientId}`)
        .then(res => res.json())
        .then(data => {
          setPoCount(data._count?.pos || 0);
          setIsLoadingCount(false);
        })
        .catch(() => {
          setPoCount(0);
          setIsLoadingCount(false);
        });
    }
  }, [showConfirm, clientId, poCount]);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete client");
      }

      // Force a hard refresh to show updated data
      router.push("/");
      window.location.href = "/";
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete client");
      setIsDeleting(false);
      setShowConfirm(false);
    }
  }

  function handleCancel() {
    setShowConfirm(false);
    setPoCount(null);
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
        title={`Delete ${clientName}`}
      >
        <Trash2 size={14} />
      </button>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) {
              handleCancel();
            }
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative z-[10000]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Client?</h3>
              </div>
              <button
                onClick={handleCancel}
                disabled={isDeleting}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-700 mb-3">
                Are you sure you want to delete <span className="font-semibold">{clientName}</span>?
              </p>
              
              {isLoadingCount ? (
                <p className="text-sm text-gray-600">Loading...</p>
              ) : poCount !== null && poCount > 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800 font-medium mb-1">
                    ⚠️ Warning: This will also delete all related Price Offers
                  </p>
                  <p className="text-sm text-red-700">
                    {poCount} Price Offer{poCount !== 1 ? "s" : ""} and all associated data will be permanently deleted.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  This action cannot be undone.
                </p>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting || isLoadingCount}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                {isDeleting ? "Deleting..." : "Delete Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

