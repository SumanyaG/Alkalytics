import type React from "react";
import { useState, memo, useEffect } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import CloseIcon from "@mui/icons-material/Close";
import WarningIcon from "@mui/icons-material/Warning";

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
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
      // Trigger animation after component mounts
      setAnimate(true);
    }, []);

    const sanitizeFileName = (file: File) => {
      const sanitizedFileName = file.name.replace(/\s+/g, "_");
      return new File([file], sanitizedFileName, { type: file.type });
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);

      const uploadedFiles = Array.from(e.dataTransfer.files)
        .filter((file) =>
          [
            "text/csv",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ].includes(file.type)
        )
        .map(sanitizeFileName);

      if (uploadedFiles.length > 0) {
        setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
      }
    };

    const handleBrowseFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const uploadedFiles = Array.from(e.target.files || [])
        .filter((file) =>
          [
            "text/csv",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ].includes(file.type)
        )
        .map(sanitizeFileName);

      if (uploadedFiles.length > 0) {
        setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
      }
    };

    const removeFile = (index: number) => {
      setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    return (
      <div
        className={`relative flex-1 h-full transition-all duration-700 ${
          animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg">
          {/* Content */}
          <div className="relative z-10 h-full flex flex-col">
            <div className="relative mb-4 text-center">
              <div className="absolute left-1/2 top-1/2 h-8 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-100 blur-xl"></div>
              <h2 className="relative bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent">
                {sectionTitle}
              </h2>
            </div>

            <div
              className={`group relative flex flex-1 w-full flex-col ${
                files.length === 0
                  ? "items-center justify-center"
                  : "items-start justify-start"
              } rounded-xl border-2 border-dashed transition-all duration-300 ${
                dragOver
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
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
                className="hidden"
                onChange={handleBrowseFile}
              />

              {files.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 transition-all duration-300 group-hover:bg-blue-200">
                    <CloudUploadIcon className="h-8 w-8 text-white transition-all duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-blue-600">
                    Drag & Drop Files
                  </h3>
                  <p className="mb-4 text-sm text-gray-600">
                    or click to browse
                  </p>
                  <div className="rounded-lg bg-blue-100 px-4 py-2 text-xs text-blue-600">
                    Accepts .csv and .xlsx files
                  </div>
                </div>
              ) : (
                <div className="h-full w-full p-4 flex flex-col">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-700">
                      {files.length} file{files.length !== 1 ? "s" : ""}{" "}
                      selected
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFiles([]);
                      }}
                      className="rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-200"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="custom-scrollbar flex-1 overflow-y-auto rounded-lg bg-white p-2 shadow-inner">
                    <ul className="space-y-2">
                      {files.map((file, index) => (
                        <li
                          key={index}
                          className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-all hover:bg-gray-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center">
                            <div className="mr-3 rounded-md bg-blue-100 p-2">
                              <DescriptionIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-700 line-clamp-1">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(index);
                            }}
                            className="rounded-full bg-red-100 p-1.5 text-red-600 transition-colors hover:bg-red-200"
                          >
                            <CloseIcon className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 flex items-center justify-center">
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="group flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-blue-600 transition-all hover:bg-gray-50"
                    >
                      <CloudUploadIcon className="mr-2 h-4 w-4" />
                      <span>Add more files</span>
                    </button>
                  </div>
                </div>
              )}

              {dragOver && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-blue-50 backdrop-blur-sm">
                  <div className="rounded-lg bg-white p-4 text-blue-600 shadow-lg">
                    <p className="text-lg font-semibold">Drop files here</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 rounded-lg bg-blue-100 p-3">
              <div className="flex items-start">
                <WarningIcon className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                <p className="text-xs text-gray-600">
                  Files will be processed and linked to your experiments. Make
                  sure your raw data files match the experiment naming convention
                  for automatic linking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

UploadArea.displayName = "UploadArea";

export default UploadArea;
