// src/pages/CandidatePage.jsx
import { useEffect, useState } from "react";
import { Table } from "antd";
import axios from "axios";

const CandidatePage = () => {
  const [candidates, setCandidates] = useState([]);
  const [token, setToken] = useState("");

  // Get token from localStorage on page load
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch candidate data
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await axios.get(
          "https://ocms-vjvn.azurewebsites.net/api/Candidate",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCandidates(response.data || []);
      } catch (error) {
        console.error(" Failed to fetch candidates:", error);
      }
    };

    if (token) {
      fetchCandidates();
    }
  }, [token]);

  const columns = [
    { title: "Candidate ID", dataIndex: "candidateId", key: "candidateId" },
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

        {/* Candidate table */}
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
