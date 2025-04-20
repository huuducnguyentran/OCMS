// src/pages/CandidatePage.jsx
import { useEffect, useState } from "react";
import { Table, Button, message } from "antd";
import { getCandidates } from "../../services/candidateService";
import { useNavigate } from "react-router-dom";
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

const CandidatePage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy role người dùng từ session
    const role = sessionStorage.getItem('role');
    setUserRole(role);
    
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const data = await getCandidates();
      setCandidates(data || []);
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
      message.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý xuất dữ liệu
  const handleExportData = () => {
    try {
      // Chuẩn bị dữ liệu để xuất
      const dataToExport = candidates.map(candidate => ({
        'Candidate ID': candidate.candidateId,
        'Full Name': candidate.fullName,
        'Gender': candidate.gender,
        'Date of Birth': candidate.dateOfBirth ? new Date(candidate.dateOfBirth).toLocaleDateString() : '',
        'Address': candidate.address || '',
        'Email': candidate.email || '',
        'Phone': candidate.phoneNumber || '',
        'Personal ID': candidate.personalID || '',
        'Note': candidate.note || ''
      }));

      // Tạo workbook và worksheet
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");

      // Tạo tên file với timestamp
      const date = new Date();
      const fileName = `candidates_${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}.xlsx`;

      // Xuất file
      XLSX.writeFile(workbook, fileName);
      message.success("Candidate data exported successfully!");
    } catch (error) {
      console.error("Error exporting data:", error);
      message.error("Failed to export data. Please try again.");
    }
  };

  const columns = [
    {
      title: "Candidate ID",
      dataIndex: "candidateId",
      key: "candidateId",
      render: (text, record) => (
        <a
          className="text-blue-600 hover:underline"
          onClick={() => navigate(`/candidates/${record.candidateId}`)}
        >
          {text}
        </a>
      ),
    },
    { title: "Full Name", dataIndex: "fullName", key: "fullName" },
    { title: "Gender", dataIndex: "gender", key: "gender" },
    {
      title: "Date of Birth",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    { title: "Address", dataIndex: "address", key: "address" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phoneNumber", key: "phoneNumber" },
    { title: "Personal ID", dataIndex: "personalID", key: "personalID" },
    { title: "Note", dataIndex: "note", key: "note" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-gray-900 font-semibold">
            Candidate List
          </h2>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchCandidates}
            loading={loading}
            type="primary"
          >
            Refresh
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={candidates.map((item, index) => ({
            ...item,
            key: index,
          }))}
          bordered
          loading={loading}
          scroll={{ x: "max-content", y: 500 }}
        />

        {/* Nút Export dành cho Reviewer */}
        {userRole === 'Reviewer' && (
          <div className="mt-6 flex justify-end">
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              size="large"
              onClick={handleExportData}
              className="bg-green-600 hover:bg-green-700 border-0"
            >
              Export Candidate Information
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidatePage;
