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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
      <div
        className={`bg-white rounded-lg shadow-lg max-w-xl w-full p-6 overflow-hidden border-4 ${
          loading
            ? "border-yellow-500"
            : error
            ? "border-red-500"
            : "border-transparent"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Modal Header */}
          <h1 className="text-xl font-bold text-blue-900 mb-2">Remove Row</h1>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto max-h-[60vh]">
            {selectedRows.size > 0 ? (
              <div>
                <p className="text-sm text-blue-900 font-semibold mb-2">
                  You are about to remove the following rows:
                </p>
                <ul className="list-disc pl-5">
                  {[...selectedRows].map((rowId, index) => (
                    <li key={index}>
                      Row {index + 1}: {rowId}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-red-600">
                No rows selected for removal.
              </p>
            )}
            {error && (
              <p className="text-sm text-red-600 mt-2">
                ❌ Failed to remove rows. Please try again.
              </p>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="py-2 px-4 rounded-lg bg-slate-300 text-gray-900 hover:bg-slate-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedRows.size === 0 || loading}
              className="py-2 px-4 flex items-center justify-center space-x-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 border-t-2 border-white rounded-full"
                    viewBox="0 0 24 24"
                  />
                  <span>Removing...</span>
                </>
              ) : (
                <span>Remove Row</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveRowModal;
