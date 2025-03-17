import React, { useState } from 'react';
import { read, utils } from 'xlsx';
import { message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const GradeImportPage = () => {
  const [excelData, setExcelData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = async (file) => {
    try {
      setLoading(true);
      setError(null);
      
      // Kiểm tra định dạng file
      if (!file.type.includes('sheet') && !file.type.includes('excel')) {
        throw new Error('Vui lòng chỉ tải lên file Excel (.xlsx, .xls)');
      }

      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        throw new Error('File không có dữ liệu');
      }

      const tableColumns = Object.keys(jsonData[0]).map(key => ({
        title: key,
        dataIndex: key,
        key: key,
      }));

      setColumns(tableColumns);
      setExcelData(jsonData);
      message.success('Đọc file Excel thành công');
    } catch (err) {
      setError('Có lỗi xảy ra khi đọc file: ' + err.message);
      message.error('Không thể đọc file');
    } finally {
      setLoading(false);
      setIsDragging(false);
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
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Đọc File Excel</h1>
          
          {/* Upload Section */}
          {!excelData.length && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-all duration-200 ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <UploadOutlined className="text-4xl text-gray-400" />
                <div className="space-y-2">
                  <p className="text-lg text-gray-600">
                    Kéo thả file Excel vào đây hoặc
                  </p>
                  <label className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer transition-colors duration-200">
                    <span className="ml-2">Chọn File</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".xlsx,.xls"
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500">
                  Chỉ chấp nhận file .xlsx hoặc .xls
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Data Preview */}
          {excelData.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700">
                  Dữ liệu Excel ({excelData.length} dòng)
                </h2>
                <button
                  onClick={() => {
                    setExcelData([]);
                    setColumns([]);
                    setError(null);
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  Đọc file khác
                </button>
              </div>
              <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column.key}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {excelData.map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {columns.map((column) => (
                          <td
                            key={column.key}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {row[column.dataIndex]}
                          </td>
                        ))}
                      </tr>
                    ))}
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

export default GradeImportPage;
