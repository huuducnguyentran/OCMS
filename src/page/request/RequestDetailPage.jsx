import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  approveRequest,
  getRequestById,
  rejectRequest,
} from "../../services/requestService";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ProfileOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Spin, Tag, Button, message, Modal } from "antd";

const RequestDetail = () => {
  const { id } = useParams(); // get id from route
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const data = await getRequestById(id);
        setRequest(data);
      } catch (err) {
        console.error("Error fetching request by ID:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);
  const handleApprove = async () => {
    try {
      await approveRequest(request.requestId);
      message.success("Request approved successfully");
      setRequest({ ...request, status: "Approved" });
    } catch {
      message.error("Failed to approve request");
    }
  };

  const handleReject = () => {
    Modal.confirm({
      title: "Reject Request",
      content: "Are you sure you want to reject this request?",
      onOk: async () => {
        try {
          await rejectRequest(request.requestId, "Rejected by admin");
          message.success("Request rejected successfully");
          setRequest({ ...request, status: "Rejected" });
        } catch {
          message.error("Failed to reject request");
        }
      },
    });
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-8 space-x-2">
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 px-0"
          >
            Request List
          </Button>
          <span className="text-gray-400">/</span>
          <span className="font-semibold text-gray-800">
            {request?.requestId || request}
          </span>
        </div>
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <h2 className="text-2xl font-semibold mb-4">Request detail</h2>
          <div className="flex gap-4 mt-4">
            {!loading && request?.status === "Pending" && (
              <div className="flex ml-auto gap-4 mt-4 mb-1">
                <Link
                  onClick={handleApprove}
                  className="!text-blue-600 hover:!text-blue-800 hover:underline cursor-pointer font-medium"
                >
                  Approve
                </Link>
                <Link
                  onClick={handleReject}
                  className="!text-red-600 hover:!text-red-800 hover:underline cursor-pointer font-medium"
                >
                  Reject
                </Link>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spin size="large" />
            </div>
          ) : request ? (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-md p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <div className="relative space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Request ID: {request.requestId}
                  </h2>

                  <div className="flex items-center gap-2 text-gray-600">
                    <ProfileOutlined className="text-indigo-500" />
                    <span className="text-sm font-medium">
                      Type: {request.requestType}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <FileTextOutlined className="text-indigo-500" />
                    <span className="text-sm font-medium">
                      Description: {request.description}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarOutlined className="text-indigo-500" />
                    <span className="text-sm font-medium">
                      Request Date:{" "}
                      {new Date(request.requestDate).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    Status:{" "}
                    <Tag
                      icon={
                        request.status === "Approved" ? (
                          <CheckCircleOutlined />
                        ) : request.status === "Rejected" ? (
                          <CloseCircleOutlined />
                        ) : (
                          <ClockCircleOutlined />
                        )
                      }
                      color={
                        request.status === "Approved"
                          ? "green"
                          : request.status === "Rejected"
                          ? "red"
                          : "orange"
                      }
                      className="text-sm font-medium px-3 py-1 rounded-full"
                    >
                      {request.status}
                    </Tag>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-red-500">Request not found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;
