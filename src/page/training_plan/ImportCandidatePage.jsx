// src/pages/CandidateImportPage.jsx
import { useState } from "react";
import { read, utils } from "xlsx";
import { message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { importCandidate } from "../../services/candidateService";

const CandidateImportPage = () => {
  // State management
  const [candidateData, setCandidateData] = useState([]); // Stores data from "Candidate" sheet
  const [externalCertifyData, setExternalCertifyData] = useState([]); // Stores data from "ExternalCertificate" sheet
  const [columns, setColumns] = useState([]); // Dynamically generated columns from Excel header
  const [loading, setLoading] = useState(false); // Loading state during file reading
  const [error, setError] = useState(null); // Error message
  const [isDragging, setIsDragging] = useState(false); // Drag-drop UI indicator
  const [selectedFile, setSelectedFile] = useState(null);

  // Handle file upload via input or drag-drop
  const handleFileUpload = async (file) => {
    try {
      setLoading(true);
      setError(null);

      if (!file.type.includes("sheet") && !file.type.includes("excel")) {
        throw new Error("Chỉ chấp nhận file Excel (.xlsx, .xls)");
      }

      setSelectedFile(file); // Save file to submit later

      // ✅ Only read locally for preview, don't call API yet
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const candidateSheet = workbook.Sheets["Candidate"];
      if (!candidateSheet) throw new Error("Không tìm thấy sheet 'Candidate'");
      const jsonCandidate = utils.sheet_to_json(candidateSheet);
      if (jsonCandidate.length === 0) {
        throw new Error("Sheet 'Candidate' không có dữ liệu");
      }

      const externalCertifySheet = workbook.Sheets["ExternalCertificate"];
      const jsonExternalCertify = externalCertifySheet
        ? utils.sheet_to_json(externalCertifySheet)
        : [];

      const tableColumns = Object.keys(jsonCandidate[0]).map((key) => ({
        title: key,
        dataIndex: key,
        key: key,
      }));

      setColumns(tableColumns);
      setCandidateData(jsonCandidate);
      setExternalCertifyData(jsonExternalCertify);
    } catch (err) {
      console.error(err);
      setError("Lỗi: " + err.message);
      message.error("Không thể đọc file");
    } finally {
      setLoading(false);
      setIsDragging(false);
    }
  };

  const handleSubmitToServer = async () => {
    try {
      setLoading(true);
      if (!selectedFile) {
        message.warning("Please select a file before uploading.");
        return;
      }

      const response = await importCandidate(selectedFile);

      if (response?.message) {
        message.success(response.message);
      } else {
        message.success("File uploaded successfully.");
      }
    } catch (error) {
      message.error(error?.response?.data?.message || "Import failed.");
    } finally {
      setLoading(false);
    }
  };

  // Drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
    setIsDragging(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-4xl font-bold mb-4">Candidate Import Page</h2>

          {/* Drag-and-Drop Upload Section */}
          {!candidateData.length && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-all duration-200 ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <UploadOutlined className="text-4xl text-gray-400" />
                <div className="space-y-2">
                  <p className="text-lg text-gray-600">Drag Excel File Here</p>
                  <label className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer transition-colors duration-200">
                    <span className="ml-2">Choose File</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".xlsx,.xls"
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500">
                  Only except .xlsx hoặc .xls file
                </p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Display Imported Candidate Table */}
          {candidateData.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700">
                  Candidate: {candidateData.length}
                </h2>
                <div className="space-x-3">
                  <button
                    onClick={() => {
                      // Reset all
                      setCandidateData([]);
                      setExternalCertifyData([]);
                      setColumns([]);
                      setSelectedFile(null);
                      setError(null);
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    Re-import
                  </button>
                  <button
                    onClick={handleSubmitToServer}
                    className="px-4 py-2 text-sm !bg-blue-500 text-white hover:bg-blue-700 rounded-lg transition-colors duration-200"
                  >
                    Submit to Server
                  </button>
                </div>
              </div>

              {/* Table rendering */}
              <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col.key}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {col.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {candidateData.map((row, index) => {
                      const personalId = row["PersonalID"]; // Identify unique ID
                      return (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          {columns.map((column, colIndex) => (
                            <td
                              key={colIndex}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            >
                              {/* Wrap in Link only if PersonalID exists */}
                              {personalId ? (
                                <Link
                                  to={`/candidate-info/${personalId}`}
                                  state={{
                                    candidate: row,
                                    externalCertifyData: externalCertifyData,
                                  }}
                                  className="text-blue-500 hover:underline"
                                >
                                  {row[column.dataIndex]}
                                </Link>
                              ) : (
                                row[column.dataIndex] || "-"
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateImportPage;
