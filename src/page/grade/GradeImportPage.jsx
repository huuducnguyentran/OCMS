import { useState } from "react";
import { read, utils } from "xlsx";
import { message, Button, Table, Typography, Spin } from "antd";
import {
  UploadOutlined,
  FileExcelOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { gradeServices } from "../../services/gradeServices";

const { Title } = Typography;

const GradeImportPage = () => {
  const [excelData, setExcelData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileUpload = async (file) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedFile(file);

      if (!file.type.includes("sheet") && !file.type.includes("excel")) {
        throw new Error("Please upload only Excel files (.xlsx, .xls)");
      }

      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        throw new Error("File contains no data");
      }

      const tableColumns = Object.keys(jsonData[0]).map((key) => ({
        title: key,
        dataIndex: key,
        key: key,
      }));

      setColumns(tableColumns);
      setExcelData(jsonData);
      message.success("Excel file read successfully");
    } catch (err) {
      setError("Error reading file: " + err.message);
      message.error("Cannot read file");
    } finally {
      setLoading(false);
      setIsDragging(false);
    }
  };

  const handleImportGrades = async () => {
    try {
      if (!selectedFile) {
        message.error("Please select an Excel file before importing");
        return;
      }

      setLoading(true);
      const response = await gradeServices.importGrades(selectedFile);

      if (response.result) {
        const { totalRecords, successCount, failedCount, errors } =
          response.result;

        if (failedCount > 0 || errors.length > 0) {
          setError(`Import failed: ${errors.join(", ")}`);
          message.error("Grade import failed");
        } else if (successCount > 0) {
          message.success(
            `Successfully imported ${successCount}/${totalRecords} records`
          );
          setExcelData([]);
          setColumns([]);
          setSelectedFile(null);
          setError(null);
        } else {
          setError("No records were imported");
          message.warning("No records were imported");
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setError("Error importing grades: " + (err.message || "Unknown error"));
      message.error("Cannot import grades");
    } finally {
      setLoading(false);
    }
  };

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
        <div className="bg-white rounded-xl shadow-lg p-6">
          <Title level={2} className="mb-6 flex items-center gap-2">
            <FileExcelOutlined className="text-green-600" />
            Import Grades from Excel
          </Title>

          {!excelData.length && (
            <div
              className={`border-2 border-dashed rounded-lg p-12 mb-6 text-center transition-all duration-200 ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <UploadOutlined className="text-5xl text-gray-400" />
                <div className="space-y-2">
                  <p className="text-lg text-gray-600">
                    Drag and drop Excel file here or
                  </p>
                  <label className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer transition-colors duration-200 shadow-md">
                    <UploadOutlined className="mr-2" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".xlsx,.xls"
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500">
                  Supports .xlsx or .xls files only
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
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

          {loading && (
            <div className="flex justify-center items-center py-8">
              <Spin size="large" tip="Processing..." />
            </div>
          )}

          {excelData.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <Title level={4} className="!mb-0">
                  Preview Data ({excelData.length} records)
                </Title>
                <div className="space-x-4">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setExcelData([]);
                      setColumns([]);
                      setError(null);
                    }}
                  >
                    Upload Another File
                  </Button>
                  <Button
                    type="primary"
                    icon={<FileExcelOutlined />}
                    onClick={handleImportGrades}
                    loading={loading}
                  >
                    Import Grades
                  </Button>
                </div>
              </div>

              <Table
                columns={columns}
                dataSource={excelData.map((item, index) => ({
                  ...item,
                  key: index,
                }))}
                bordered
                size="middle"
                scroll={{ x: true }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} records`,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradeImportPage;
