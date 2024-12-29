import { useState, memo } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const UploadArea = memo(
  ({
    sectionTitle,
    files,
    setFiles,
    inputId,
  }: {
    sectionTitle: string;
    files: File[];
    setFiles: React.Dispatch<React.SetStateAction<File[]>>;
    inputId: string;
  }) => {
    const [dragOver, setDragOver] = useState(false);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);

      const uploadedFiles = Array.from(e.dataTransfer.files).filter((file) =>
        [
          "text/csv",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ].includes(file.type)
      );

      if (uploadedFiles.length > 0) {
        setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
      }
    };

    const handleBrowseFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const uploadedFiles = Array.from(e.target.files || []).filter((file) =>
        [
          "text/csv",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ].includes(file.type)
      );

      if (uploadedFiles.length > 0) {
        setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
      }
    };

    const removeFile = (index: number) => {
      setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    return (
      <div className="flex flex-col items-start w-[45%] bg-white rounded-3xl shadow-md p-4">
        <h2 className="flex w-full justify-center text-xl font-semibold text-blue-900 mb-4">
          {sectionTitle}
        </h2>
        <div
          className={`flex flex-col ${
            files.length === 0 ? "items-center justify-center" : "items-start"
          } w-full h-full rounded-lg mb-4 p-4 transition-all duration-500 ease-in-out transform ${
            dragOver
              ? "bg-blue-100 shadow-xl border-dotted border-4 border-blue-600"
              : files.length > 0
              ? "border-dotted border-2 border-gray-300"
              : "bg-white"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById(inputId)?.click()}
        >
          <input
            id={inputId}
            type="file"
            accept=".csv, .xlsx"
            multiple
            className={`${sectionTitle} hidden`}
            onChange={handleBrowseFile}
          />
          {files.length === 0 ? (
            <>
              <CloudUploadIcon className="text-blue-600 text-4xl mb-2" />
              <p className="text-blue-600 text-sm font-semibold text-center">
                Drag & drop your file here
              </p>
              <p className="text-gray-500 text-sm text-center mt-2">
                Or click to browse files
              </p>
            </>
          ) : (
            <ul className="w-full space-y-2 overflow-y-scroll">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-gray-100 rounded-lg p-2"
                >
                  <span className="text-sm">{file.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent click event from reaching parent
                      removeFile(index);
                    }}
                    className="text-red-600 hover:text-red-800 font-semibold text-sm"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }
);

export default UploadArea;
