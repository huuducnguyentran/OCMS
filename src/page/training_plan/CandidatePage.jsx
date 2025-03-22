// src/pages/CandidatePage.jsx
import { useEffect, useState } from "react";
import { Table } from "antd";
import { getCandidates } from "../../services/candidateService";
import { useNavigate } from "react-router-dom";

const CandidatePage = () => {
  const [candidates, setCandidates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const data = await getCandidates();
        setCandidates(data || []);
      } catch (error) {
        console.error("Failed to fetch candidates:", error);
      }
    };

    fetchCandidates();
  }, []);

  const columns = [
    {
      title: "Candidate ID",
      dataIndex: "candidateId",
      key: "candidateId",
      render: (text, record) => (
        <button
          className="text-blue-600 hover:underline"
          onClick={() => navigate(`/candidates/${record.candidateId}`)}
        >
          {text}
        </button>
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
        <h2 className="text-xl font-semibold mb-4">Candidate List</h2>

        <Table
          columns={columns}
          dataSource={candidates.map((item, index) => ({
            ...item,
            key: index,
          }))}
          bordered
          scroll={{ x: "max-content", y: 500 }}
        />
      </div>
    </div>
  );
};

export default CandidatePage;
