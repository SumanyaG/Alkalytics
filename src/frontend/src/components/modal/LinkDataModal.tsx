// -----------------------------------------------------------------------------
// Primary Author: Jason T
// Year: 2025
// Component: LinkDataModal
// Purpose: Modal component for linking data files to experiments.
// -----------------------------------------------------------------------------

import type React from "react";
import { useState } from "react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-white/20 bg-white/95 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-sm">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(219,234,254,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(219,234,254,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-70"></div>
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-orange-400/20 via-orange-500/20 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10">
          <h1 className="mb-4 text-xl font-bold text-blue-900">
            Link Data Files
          </h1>

          <div className="mb-6 rounded-lg bg-orange-50 p-4">
            <div className="flex">
              <WarningIcon
                className="h-5 w-5 flex-shrink-0 text-orange-400"
                aria-hidden="true"
              />
              <div className="ml-3">
                <h2 className="text-sm font-semibold text-orange-800">
                  Ambiguous Data Requires Matching
                </h2>
                <p className="mt-1 text-sm text-orange-700">
                  Please match each data file with the corresponding experiment
                  id.
                </p>
              </div>
            </div>
          </div>

          <section className="mt-4">
            <h2 className="mb-2 text-sm font-semibold text-blue-900">
              Data Id
            </h2>
            <div className="rounded-lg bg-blue-50/50 p-4 shadow-sm">
              <p className="text-sm text-blue-900">
                {ambiguousData[currentIndex]?.dataId}
              </p>
            </div>
          </section>

          <section className="mt-4">
            <h2 className="mb-2 text-sm font-semibold text-blue-900">
              Possible Matching Experiment Id
            </h2>
            <div className="flex flex-wrap justify-center gap-3 rounded-lg bg-blue-50/50 p-4 shadow-sm">
              {ambiguousData[currentIndex]?.matchingExp.map((expId) => (
                <button
                  key={expId}
                  onClick={() =>
                    handleMatchChange(ambiguousData[currentIndex].dataId, expId)
                  }
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                    matchingMap[ambiguousData[currentIndex].dataId] === expId
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-blue-900 ring-1 ring-inset ring-blue-200 hover:bg-blue-50"
                  }`}
                >
                  {expId}
                </button>
              ))}
            </div>
          </section>

          {/* Progress Bar */}
          <div className="mt-8 flex justify-center">
            <div className="relative h-1 w-full rounded-full bg-blue-100">
              <div
                className="absolute top-0 left-0 h-1 rounded-full bg-blue-500"
                style={{
                  width: `${
                    ((currentIndex + 1) / ambiguousData.length) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>
          <div className="mt-2 text-center text-xs text-blue-500">
            {currentIndex + 1} of {ambiguousData.length}
          </div>

          <div
            className={`mt-6 flex ${
              currentIndex !== 0 ? "justify-between" : "justify-end"
            } items-center w-full`}
          >
            {currentIndex !== 0 && (
              <button
                onClick={handlePrev}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-900 shadow-sm ring-1 ring-inset ring-blue-100 transition-all hover:bg-blue-50"
              >
                Previous
              </button>
            )}

            {currentIndex !== ambiguousData.length - 1 ? (
              <button
                onClick={handleNext}
                className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg"
              >
                <span className="relative z-10">Next</span>
                <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={
                  loading ||
                  Object.keys(matchingMap).length !== ambiguousData.length
                }
                className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
              >
                <span className="relative z-10 flex items-center">
                  {loading ? (
                    <>
                      <svg
                        className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                        viewBox="0 0 24 24"
                      />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit</span>
                  )}
                </span>
                <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-disabled:opacity-0"></span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkDataModal;
