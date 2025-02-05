import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import UploadArea from "../components/upload/UploadArea";
import LinkDataModal from "../components/modal/LinkDataModal";

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

  const [uploadFiles] = useMutation(UPLOAD);

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
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-blue-900">
      <h1 className="text-4xl font-semibold mb-8">Upload Files</h1>
      <div className="flex justify-evenly w-full max-w-[1500px] h-full max-h-[600px]">
        <UploadArea
          sectionTitle="Experiment"
          files={experimentFiles}
          setFiles={setExperimentFiles}
          inputId="experimentFileInput"
        />
        <UploadArea
          sectionTitle="Data"
          files={dataFiles}
          setFiles={setDataFiles}
          inputId="dataFileInput"
        />
      </div>

      <button
        onClick={handleUpload}
        className="mt-8 bg-blue-600 text-white py-3 px-12 rounded-xl hover:bg-blue-700 shadow-lg flex items-center transition-transform transform hover:scale-105"
        disabled={loading}
      >
        {loading ? (
          <span className="text-white mr-3">Uploading...</span>
        ) : (
          "Upload Files"
        )}
      </button>

      {success && (
        <div className="mt-8 text-green-600 flex items-center">
          <CheckCircleIcon className="mr-2" />
          All files uploaded successfully!
        </div>
      )}

      {error && (
        <div className="mt-8 text-red-600 flex items-center">
          <ErrorIcon className="mr-2" />
          Something went wrong, please try again.
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
  );
};

export default Upload;
