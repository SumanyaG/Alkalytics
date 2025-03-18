import React, { useState } from "react";

type SetColumnTypesModalProps = {
  columns: string[];
  columnTypes: Record<string, string>;
  setIsModalOpen: (isOpen: boolean) => void;
  onUpdateColumnTypes: (newColumnTypes: Record<string, string>) => Promise<any>;
};

const SetColumnTypesModal: React.FC<SetColumnTypesModalProps> = ({
  columns,
  columnTypes,
  setIsModalOpen,
  onUpdateColumnTypes,
}) => {
  const filteredColumns = columns.filter(
    (column: string) => column !== "_id" && column !== "experimentId"
  );

  const [newColumnTypes, setNewColumnTypes] = useState<Record<string, string>>(
    () =>
      filteredColumns.reduce((acc, column) => {
        acc[column] = columnTypes[column] || "text";
        return acc;
      }, {} as Record<string, string>)
  );

  const [isChanged, setIsChanged] = useState(false);

  const handleChange = (column: string, type: string) => {
    setNewColumnTypes((prevTypes) => {
      const updatedTypes = { ...prevTypes, [column]: type };
      setIsChanged(updatedTypes[column] !== columnTypes[column]);
      return updatedTypes;
    });
  };

  const handleSubmit = async () => {
    try {
      await onUpdateColumnTypes(newColumnTypes);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error updating column types:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/20 bg-white/95 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-sm">
        <div className="flex flex-col">
          <h1 className="mb-4 text-xl font-bold text-blue-900">
            Set Column Types
          </h1>
          <div className="max-h-[45vh] flex-1 overflow-y-auto pr-2">
            <div className="space-y-4">
              {filteredColumns.map((column: string) => (
                <section
                  key={column}
                  className="flex items-center justify-between gap-x-4 rounded-lg border border-blue-50 bg-blue-50/30 p-3 transition-all hover:border-blue-100 hover:bg-blue-50/50"
                >
                  <div className="flex items-center gap-x-2">
                    <label className="font-semibold text-blue-900">
                      {column}
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      value={newColumnTypes[column]}
                      onChange={(e) => handleChange(column, e.target.value)}
                      className="h-10 w-32 appearance-none rounded-lg border border-blue-100 bg-white/80 pl-3 pr-10 text-sm text-blue-900 shadow-sm backdrop-blur-sm transition-all focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-400">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-900 shadow-sm ring-1 ring-blue-100 transition-all hover:bg-blue-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isChanged}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-50"
            >
              <span className="relative z-10">Save Changes</span>
              <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-disabled:opacity-0"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetColumnTypesModal;
