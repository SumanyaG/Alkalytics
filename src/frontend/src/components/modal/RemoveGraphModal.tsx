// -----------------------------------------------------------------------------
// Primary Author: Kate M
// Year: 2025
// Component: RemoveGraphModal
// Purpose: Modal component for removing a graph from list of graphs.
// -----------------------------------------------------------------------------

import React from "react";

type RemoveGraphModalProps = {
  setIsModalOpen: (isOpen: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  error?: boolean;
};

const RemoveGraphModal: React.FC<RemoveGraphModalProps> = ({
  setIsModalOpen,
  onConfirm,
  isLoading,
  error,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl border-4 border-white/20 bg-white/95 p-6 shadow-lg backdrop-blur-sm">
        <h1 className="mb-4 text-xl font-bold text-blue-900">
          Confirm Graph Deletion
        </h1>
        <p className="text-sm text-gray-700">
          Are you sure you want to delete this graph?
        </p>
        <p className="text-sm text-gray-700">This action cannot be undone.</p>
        {error && (
          <p className="mt-2 flex items-center text-sm text-red-500">
            <svg
              className="mr-1.5 h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            Failed to delete graph. Please try again.
          </p>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setIsModalOpen(false)}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-900 shadow-sm ring-1 ring-inset ring-blue-100 transition-all hover:bg-blue-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
          >
            <span className="relative z-10 flex items-center">
              {isLoading ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                    viewBox="0 0 24 24"
                  />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Graph</span>
              )}
            </span>
            <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-red-400 to-red-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-disabled:opacity-0"></span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveGraphModal;
