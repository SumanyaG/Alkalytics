// -----------------------------------------------------------------------------
// Primary Author: Jason T
// Year: 2025
// Component: Upload
// Purpose: Main upload page for uploading experiment and data files.
// -----------------------------------------------------------------------------

import type React from "react";
import { useState, useEffect } from "react";
import { gql, useMutation } from "@apollo/client";
import UploadArea from "../components/upload/UploadArea";
import LinkDataModal from "../components/modal/LinkDataModal";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

type AmbiguousData = {
  dataId: string;
  dataFile?: {
    filename: string;
    mimetype: string;
    content: string;
  };
  matchingExp: string[];
};

type MatchingMap = {
  [key: string]: string;
};

const UPLOAD = gql`
  mutation Upload(
    $experimentFiles: [Base64FileInput!]!
    $dataFiles: [Base64FileInput!]!
  ) {
    upload(experimentFiles: $experimentFiles, dataFiles: $dataFiles) {
      status
      message
      ambiguousData {
        dataId
        dataFile {
          filename
          mimetype
          content
        }
        matchingExp
      }
    }
  }
`;

const Upload: React.FC = () => {
  const [experimentFiles, setExperimentFiles] = useState<File[]>([]);
  const [dataFiles, setDataFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [ambiguousData, setAmbiguousData] = useState<AmbiguousData[]>([]);
  const [matchingMap, setMatchingMap] = useState<MatchingMap>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [animate, setAnimate] = useState(false);

  const [uploadFiles] = useMutation(UPLOAD);

  useEffect(() => {
    // Trigger animation after component mounts
    setAnimate(true);
  }, []);

  const convertToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });

  const convertFiles = async (files: File[]) =>
    Promise.all(
      files.map(async (file) => ({
        filename: file.name,
        mimetype: file.type,
        content: await convertToBase64(file),
      }))
    );

  const handleUpload = async () => {
    if (experimentFiles.length === 0 && dataFiles.length === 0) return;

    setLoading(true);
    setSuccess(false);
    setError(false);

    try {
      const experimentPayload = await convertFiles(experimentFiles);
      const dataPayload = await convertFiles(dataFiles);

      const response = await uploadFiles({
        variables: {
          experimentFiles: experimentPayload,
          dataFiles: dataPayload,
        },
      });

      if (response.data.upload.status !== "success") {
        throw new Error("Upload failed");
      }

      const ambiguous = response.data.upload.ambiguousData;

      if (ambiguous && ambiguous.length > 0) {
        setAmbiguousData(ambiguous);
        setMatchingMap(
          ambiguous.reduce((acc: MatchingMap, item: { dataId: string }) => {
            acc[item.dataId] = "";
            return acc;
          }, {} as MatchingMap)
        );
        setIsModalOpen(true);
      }

      setSuccess(true);
      setExperimentFiles([]);
      setDataFiles([]);
    } catch (e) {
      console.error("Error during file upload:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-white p-8">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,23,97,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,23,97,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-blue-200 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-indigo-200 blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center">
        <div
          className={`transition-all duration-700 ${
            animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h1 className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-center text-4xl font-bold text-transparent">
            Upload Files
          </h1>
        </div>

        <div
          className={`flex w-full max-w-[1500px] h-[60vh] flex-col justify-center gap-8 lg:flex-row transition-all duration-700 delay-200 ${
            animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <UploadArea
            sectionTitle="Experiment Log Files"
            files={experimentFiles}
            setFiles={setExperimentFiles}
            inputId="experimentFileInput"
          />

          <div className="hidden items-center justify-center lg:flex">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white border-2 border-blue-600">
              <ArrowForwardIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <UploadArea
            sectionTitle="Raw Data Files"
            files={dataFiles}
            setFiles={setDataFiles}
            inputId="dataFileInput"
          />
        </div>

        <div
          className={`mt-12 transition-all duration-700 delay-400 ${
            animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <button
            onClick={handleUpload}
            disabled={
              loading ||
              (experimentFiles.length === 0 && dataFiles.length === 0)
            }
            className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-white shadow-md transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
          >
            <span className="relative z-10 flex items-center">
              {loading ? (
                <>
                  <svg
                    className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
                    viewBox="0 0 24 24"
                  />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <CloudUploadIcon className="mr-2 h-5 w-5" />
                  <span>Upload Files</span>
                </>
              )}
            </span>
            <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
            <span className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-300 group-hover:w-full"></span>
          </button>
        </div>

        {(success || error) && (
          <div
            className={`mt-8 transition-all duration-500 ${
              success || error ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            {success && (
              <div className="flex items-center rounded-lg border border-green-500 bg-green-100 px-4 py-3 text-green-700">
                <CheckCircleIcon className="mr-2 h-5 w-5" />
                <span>All files uploaded successfully!</span>
              </div>
            )}

            {error && (
              <div className="flex items-center rounded-lg border border-red-500 bg-red-100 px-4 py-3 text-red-700">
                <ErrorIcon className="mr-2 h-5 w-5" />
                <span>Something went wrong, please try again.</span>
              </div>
            )}
          </div>
        )}

        {isModalOpen && (
          <LinkDataModal
            ambiguousData={ambiguousData}
            matchingMap={matchingMap}
            setIsModalOpen={setIsModalOpen}
            setMatchingMap={setMatchingMap}
            setAmbiguousData={setAmbiguousData}
          />
        )}
      </div>
    </div>
  );
};

export default Upload;
