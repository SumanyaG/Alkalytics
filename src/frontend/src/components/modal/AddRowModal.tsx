import React, { useState, useEffect } from "react";

type AddRowModalProps = {
  columns: string[];
  data: any[];
  setIsModalOpen: (isOpen: boolean) => void;
  onAddRow: (newRow: Record<string, string | number>) => Promise<any>;
};

const AddRowModal: React.FC<AddRowModalProps> = ({
  data,
  columns,
  setIsModalOpen,
  onAddRow,
}) => {
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [newRowData, setNewRowData] = useState<Record<string, string | number>>(
    columns.reduce((acc, column) => {
      acc[column] = "";
      return acc;
    }, {} as Record<string, string | number>)
  );

  const handleChange = (column: string, value: string | number) => {
    let newValue = value;
    if (typeof value === "string" && !isNaN(Number(value))) {
      newValue = Number(value);
    }

    setNewRowData((prevData) => ({ ...prevData, [column]: newValue }));
  };

  useEffect(() => {
    const isDuplicate = data.some((row) => row["#"] == newRowData["#"]);
    setIsDuplicate(isDuplicate);
  }, [newRowData["#"], data]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(false);

    const experimentId = `#${newRowData["#"]} ${newRowData["Date"]}`;
    const newRow = { ...newRowData, experimentId };

    try {
      const response = await onAddRow(newRow);
      if (response && response.success) {
        setIsModalOpen(false);
      } else {
        setError(true);
      }
    } catch (error) {
      console.error("Error adding row:", error);
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
          <h1 className="text-xl font-bold text-blue-900 mb-2">Add New Row</h1>
          <div className="flex-1 overflow-y-auto max-h-[45vh]">
            <div className="space-y-4">
              {columns.map((column) => {
                if (column === "_id") return null;
                if (column === "experimentId") {
                  return (
                    <section key={column}>
                      <h2 className="text-sm text-blue-900 font-semibold mb-1">
                        {column.replace(/_/g, " ").toUpperCase()}
                      </h2>
                      <input
                        type="text"
                        value={`#${newRowData["#"]} ${newRowData["Date"]}`}
                        readOnly
                        className="w-full p-2 rounded my-2 border border-gray-300 bg-gray-100"
                      />
                    </section>
                  );
                }

                return (
                  <section key={column}>
                    <h2 className="text-sm text-blue-900 font-semibold mb-1">
                      {column.replace(/_/g, " ").toUpperCase()}
                    </h2>
                    <input
                      type={
                        column === "#"
                          ? "number"
                          : column === "Date"
                          ? "date"
                          : "text"
                      }
                      value={newRowData[column]}
                      onChange={(e) => handleChange(column, e.target.value)}
                      className="w-full p-2 rounded my-2 border border-gray-300"
                    />
                    {column === "#" && isDuplicate && (
                      <p className="text-red-500 text-xs mt-1">
                        This # value already exists.
                      </p>
                    )}
                  </section>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="py-2 px-4 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                isDuplicate ||
                !newRowData["#"] ||
                !newRowData["Date"] ||
                loading
              }
              className="py-2 px-4 flex items-center justify-center space-x-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 border-t-2 border-white rounded-full"
                    viewBox="0 0 24 24"
                  />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRowModal;
