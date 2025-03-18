import React, { useState } from "react";

type RemoveRowModalProps = {
  setIsModalOpen: (isOpen: boolean) => void;
  onRemoveRow: (experimentIds: string[]) => Promise<void>;
  selectedRows: Set<string>;
};

const RemoveRowModal: React.FC<RemoveRowModalProps> = ({
  setIsModalOpen,
  onRemoveRow,
  selectedRows,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async () => {
    if (selectedRows.size === 0) return;

    setLoading(true);
    setError(false);

    try {
      await onRemoveRow([...selectedRows]);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error removing rows:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-xl border border-white/20 bg-white/95 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-all duration-300 ${
          loading
            ? "ring-2 ring-yellow-300"
            : error
            ? "ring-2 ring-red-300"
            : ""
        }`}
      >
        {/* Background elements */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(219,234,254,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(219,234,254,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-70"></div>
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-red-400/20 via-red-500/20 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          <h1 className="mb-4 text-xl font-bold text-blue-900">Remove Row</h1>

          <div className="flex-1 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
            {selectedRows.size > 0 ? (
              <div>
                <div className="mb-4 rounded-lg bg-red-50 p-3">
                  <div className="flex">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="ml-3"></div>
                    <div className="ml-3">
                      <h3 className="text-sm font-bold text-red-800">
                        Warning
                      </h3>
                      <div className="mt-1 text-sm text-red-700">
                        You are about to remove {selectedRows.size} row
                        {selectedRows.size > 1 ? "s" : ""}. This action cannot
                        be undone.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-blue-100 bg-white/80 p-4 shadow-sm">
                  <h3 className="mb-2 text-sm font-semibold text-blue-900">
                    Selected rows to remove:
                  </h3>
                  <ul className="max-h-40 overflow-y-auto space-y-1 pl-2">
                    {[...selectedRows].map((rowId, index) => (
                      <li
                        key={index}
                        className="flex items-center text-sm text-blue-800"
                      >
                        <span className="mr-2 h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                        <span className="truncate">{rowId}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-yellow-50 p-4">
                <div className="flex">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-bold text-yellow-800">
                      No rows selected
                    </h3>
                    <div className="mt-1 text-sm text-yellow-700">
                      Please select at least one row to remove.
                    </div>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <p className="mt-4 flex items-center text-sm text-red-500">
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
                Failed to remove rows. Please try again.
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-900 shadow-sm ring-1 ring-inset ring-blue-100 transition-all hover:bg-blue-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedRows.size === 0 || loading}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
            >
              <span className="relative z-10 flex items-center">
                {loading ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                      viewBox="0 0 24 24"
                    />
                    <span>Removing...</span>
                  </>
                ) : (
                  <span>Remove Row{selectedRows.size > 1 ? "s" : ""}</span>
                )}
              </span>
              <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-red-400 to-red-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-disabled:opacity-0"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveRowModal;
