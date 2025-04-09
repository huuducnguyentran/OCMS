import { useEffect, useState } from "react";
import { Spin, Tag } from "antd";
import {
  CalendarOutlined,
  FileTextOutlined,
  ProfileOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import {
  getAllRequests,
  getAllEduOfficerRequests,
} from "../../services/requestService";

const RequestList = () => {
  const storedRole = localStorage.getItem("role");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const storedRole = localStorage.getItem("role");
        let result;

        if (storedRole === "Training staff") {
          result = await getAllEduOfficerRequests();
          setRequests(Array.isArray(result?.requests) ? result.requests : []);
        } else {
          result = await getAllRequests();
          setRequests(Array.isArray(result) ? result : []);
        }
      } catch (err) {
        console.error("Failed to load requests:", err);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const renderRequestCards = (list) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 mb-10">
      <div className="space-y-6">
        {list.map((item) => (
          <Link
            to={`/requests/${item.requestId}`}
            key={item.requestId}
            className="block transform transition-all duration-300 hover:scale-[1.01] focus:outline-none"
          >
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg p-6 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <div className="relative">
                <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
                  <div className="space-y-3 flex-1">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Request ID: {item.requestId}
                    </h2>
                    <div className="flex items-center text-gray-600 gap-2">
                      <ProfileOutlined className="text-indigo-500" />
                      <span className="text-sm font-medium">
                        Type: {item.requestType}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 gap-2">
                      <FileTextOutlined className="text-indigo-500" />
                      <span className="text-sm font-medium">
                        {item.description}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 gap-2">
                      <CalendarOutlined className="text-indigo-500" />
                      <span className="text-sm font-medium">
                        {new Date(item.requestDate).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag
                      icon={
                        item.status === "Approved" ? (
                          <CheckCircleOutlined />
                        ) : item.status === "Rejected" ? (
                          <CloseCircleOutlined />
                        ) : (
                          <ClockCircleOutlined />
                        )
                      }
                      color={
                        item.status === "Approved"
                          ? "green"
                          : item.status === "Rejected"
                          ? "red"
                          : "orange"
                      }
                      className="text-sm font-medium px-3 py-1 rounded-full"
                    >
                      {item.status}
                    </Tag>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6 sm:p-8 mb-8 border border-gray-100">
          <div className="flex items-center gap-6">
            <div className="p-6 bg-gradient-to-br from-indigo-100 to-blue-50 rounded-full shadow-lg border-2 border-indigo-200 hover:scale-105 transition-transform">
              <FileTextOutlined className="text-5xl text-indigo-500 drop-shadow-md hover:text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Request List
              </h1>
              <p className="text-gray-600 mt-2">
                {storedRole === "Training staff"
                  ? "Requests submitted by Education Officers"
                  : "All submitted requests and their statuses"}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Spin size="large" />
          </div>
        ) : (
          renderRequestCards(requests)
        )}
      </div>
    </div>
  );
};

export default RequestList;
