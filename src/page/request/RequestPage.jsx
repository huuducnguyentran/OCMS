// src/pages/request.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Tag, Card } from "antd";

const RequestListPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(
          "https://ocms-vjvn.azurewebsites.net/api/Requests",
          {
            headers: {
              Authorization: `Bearer YOUR_ACCESS_TOKEN_HERE`,
              Accept: "*/*",
            },
          }
        );
        setRequests(res.data);
      } catch (err) {
        console.error("Failed to fetch requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const columns = [
    {
      title: "Request ID",
      dataIndex: "requestId",
      key: "requestId",
    },
    {
      title: "Requested By",
      dataIndex: "requestById",
      key: "requestById",
    },
    {
      title: "Type",
      dataIndex: "requestType",
      key: "requestType",
    },
    {
      title: "Date",
      dataIndex: "requestDate",
      key: "requestDate",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Pending" ? "orange" : "green"}>{status}</Tag>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card title="Request List" className="shadow-md rounded-2xl">
        <Table
          dataSource={requests}
          columns={columns}
          rowKey="requestId"
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>
    </div>
  );
};

export default RequestListPage;
