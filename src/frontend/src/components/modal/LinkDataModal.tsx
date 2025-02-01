import React, { useState } from "react";
import WarningIcon from "@mui/icons-material/Warning";
import { gql, useMutation } from "@apollo/client";

const MANUAL_UPLOAD = gql`
  mutation ManualUpload($linkedData: [Base64FileInput!]!) {
    manualUpload(linkedData: $linkedData) {
      status
      message
    }
  }
`;

type AmbiguousData = {
  dataId: string;
  dataFile?: any;
  matchingExp: string[];
};

type LinkDataModalProps = {
  ambiguousData: AmbiguousData[];
  matchingMap: { [key: string]: string };
  setIsModalOpen: (isOpen: boolean) => void;
  setMatchingMap: React.Dispatch<
    React.SetStateAction<{ [key: string]: string }>
  >;
  setAmbiguousData: React.Dispatch<React.SetStateAction<AmbiguousData[]>>;
};

const LinkDataModal: React.FC<LinkDataModalProps> = ({
  ambiguousData,
  matchingMap,
  setIsModalOpen,
  setMatchingMap,
  setAmbiguousData,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false); 
  const [manualUploadFiles] = useMutation(MANUAL_UPLOAD);

  const handleMatchChange = (dataId: string, experimentId: string) => {
    setMatchingMap((prev) => ({ ...prev, [dataId]: experimentId }));
  };

  const handleNext = () => {
    if (currentIndex < ambiguousData.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true); 
    try {
      const linkedData = ambiguousData.map((data) => {
        return {
          filename: data.dataFile.filename,
          mimetype: data.dataFile.mimetype,
          content: data.dataFile.content,
          linkedId: matchingMap[data?.dataFile?.filename],
        };
      });
      const response = await manualUploadFiles({
        variables: {
          linkedData,
        },
      });

      if (response.data.manualUpload.status !== "success") {
        throw new Error("Upload failed");
      }

      setIsModalOpen(false);
      setAmbiguousData([]);
    } catch (e) {
      console.error("Error during file upload:", e);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6">
        <h1 className="text-xl font-bold text-blue-900 mb-2">Warning</h1>

        <div className="rounded-md bg-orange-50 p-4 flex">
          <WarningIcon
            className="h-5 w-5 text-orange-400 flex-shrink-0"
            aria-hidden="true"
          />
          <div className="ml-3">
            <h2 className="text-sm font-semibold text-orange-800">
              Ambiguous Data Requires Matching
            </h2>
            <p className="mt-1 text-sm text-orange-700">
              Please match each data file with the corresponding experiment id.
            </p>
          </div>
        </div>

        <section className="mt-4">
          <h2 className="text-sm text-blue-900 font-semibold mb-1">Data Id</h2>
          <div className="bg-slate-50 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-900">
              {ambiguousData[currentIndex]?.dataId}
            </p>
          </div>
        </section>

        <section className="mt-4">
          <h2 className="text-sm text-blue-900 font-semibold mb-1">
            Possible Matching Experiment Id
          </h2>
          <div className="bg-slate-50 p-4 rounded-lg shadow-sm flex flex-wrap justify-center gap-3">
            {ambiguousData[currentIndex]?.matchingExp.map((expId) => (
              <button
                key={expId}
                onClick={() =>
                  handleMatchChange(ambiguousData[currentIndex].dataId, expId)
                }
                className={`px-4 py-2 border rounded-md ${
                  matchingMap[ambiguousData[currentIndex].dataId] === expId
                    ? "bg-blue-600 text-white"
                    : "border-gray-400"
                }`}
              >
                {expId}
              </button>
            ))}
          </div>
        </section>

        {/* Divider and Progress Bar */}
        <div className="flex justify-center">
          <div className="relative mt-6 h-[1px] w-[95%] bg-slate-300">
            <div
              className="absolute top-0 left-0 h-[1px] bg-blue-600"
              style={{
                width: `${((currentIndex + 1) / ambiguousData.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        <div
          className={`flex ${
            currentIndex !== 0 ? "justify-between" : "justify-end"
          } items-center w-full mt-6`}
        >
          {currentIndex !== 0 && (
            <button
              onClick={handlePrev}
              className={`py-2 px-4 rounded-lg ${
                currentIndex === 0
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Previous
            </button>
          )}

          {currentIndex !== ambiguousData.length - 1 ? (
            <button
              onClick={handleNext}
              className={`py-2 px-4 rounded-lg ${
                currentIndex === ambiguousData.length - 1
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={
                loading ||
                Object.keys(matchingMap).length !== ambiguousData.length
              }
              className={`py-2 px-4 rounded-lg flex items-center justify-center ${
                loading
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              } transition`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <span className="w-4 h-4 border-2 border-t-2 border-gray-600 rounded-full animate-spin"></span>
                  <span>Submitting...</span>
                </div>
              ) : (
                "Submit"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkDataModal;
