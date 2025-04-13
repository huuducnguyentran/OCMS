import { useEffect, useState } from "react";
import {
  Spin,
  Tag,
  Typography,
  Button,
  Space,
  Input,
  message,
  Table,
  DatePicker,
  Select,
  Row,
  Col,
  Modal,
  Card,
  Divider,
} from "antd";
import {
  CalendarOutlined,
  FileTextOutlined,
  ProfileOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
  UpOutlined,
  DownOutlined,
  EyeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import {
  getAllRequests,
  getAllEduOfficerRequests,
  deleteRequest,
  getRequestById,
  approveRequest,
  rejectRequest,
} from "../../services/requestService";
import { getUserById } from "../../services/userService";

const { Title } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const RequestTypeEnum = {
  0: "New Plan",
  1: "Recurrent Plan",
  2: "Relearn Plan",
  3: "Complaint",
  4: "Plan Change",
  5: "Plan Delete",
  6: "Create New",
  7: "Create Recurrent",
  8: "Create Relearn",
  9: "Candidate Import",
  10: "Update",
  11: "Delete",
  12: "Assign Trainee",
  13: "Add Trainee Assign",
};

// Hàm helper để kiểm tra xem request type có phải loại training plan không
const isTrainingPlanType = (requestType) => {
  // Xử lý trường hợp requestType là chuỗi tên loại
  if (typeof requestType === "string") {
    if (requestType === "NewPlan" || requestType === "New Plan") return true;
    if (requestType === "RecurrentPlan" || requestType === "Recurrent Plan")
      return true;
    if (requestType === "RelearnPlan" || requestType === "Relearn Plan")
      return true;
    if (requestType === "PlanChange" || requestType === "Plan Change")
      return true;
    if (requestType === "PlanDelete" || requestType === "Plan Delete")
      return true;

    // Thử chuyển về số nếu không khớp với tên
    const type = parseInt(requestType, 10);
    if (!isNaN(type)) {
      return [0, 1, 2, 4, 5].includes(type);
    }
    return false;
  }

  // Trường hợp requestType là số
  return [0, 1, 2, 4, 5].includes(Number(requestType));
};

const RequestList = () => {
  const storedRole = sessionStorage.getItem("role");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [sortedInfo, setSortedInfo] = useState({
    order: "ascend",
    columnKey: "status",
    field: "status",
  });
  const [pageSize, setPageSize] = useState(10);

  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);
  const [requestTypeFilter, setRequestTypeFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);

  // State cho popup chi tiết
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [requestByUser, setRequestByUser] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectModalVisible, setRejectModalVisible] = useState(false);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
    if (pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
    }
  };

  const getDefaultSortedData = (data) => {
    return [...data].sort((a, b) => {
      if (a.status === "Pending" && b.status !== "Pending") return -1;
      if (a.status !== "Pending" && b.status === "Pending") return 1;
      if (a.status === b.status) {
        return new Date(b.requestDate) - new Date(a.requestDate);
      }
      const statusOrder = { Pending: 0, Approved: 1, Rejected: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  };

  const applyFilters = (data) => {
    let filtered = [...data];

    if (searchText) {
      filtered = filtered.filter(
        (request) =>
          request.requestId.toLowerCase().includes(searchText.toLowerCase()) ||
          (request.description &&
            request.description
              .toLowerCase()
              .includes(searchText.toLowerCase()))
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    if (requestTypeFilter !== null) {
      filtered = filtered.filter((request) => {
        const requestTypeNum = Number(request.requestType);
        return !isNaN(requestTypeNum) && requestTypeNum === requestTypeFilter;
      });
    }

    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      filtered = filtered.filter((request) => {
        const date = new Date(request.requestDate);
        return (
          date >= start.startOf("day").toDate() &&
          date <= end.endOf("day").toDate()
        );
      });
    }

    return getDefaultSortedData(filtered);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setFilteredRequests(applyFilters(requests));
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let result;

      if (storedRole === "Training staff") {
        result = await getAllEduOfficerRequests();
        const reqs = Array.isArray(result?.requests) ? result.requests : [];
        setRequests(reqs);
        setFilteredRequests(getDefaultSortedData(reqs));
      } else {
        result = await getAllRequests();
        const reqs = Array.isArray(result) ? result : [];
        setRequests(reqs);
        setFilteredRequests(getDefaultSortedData(reqs));
      }
      setSearchText("");
      setStatusFilter(null);
      setRequestTypeFilter(null);
      setDateRange(null);
      setSortedInfo({ order: "ascend", columnKey: "status", field: "status" });
    } catch (err) {
      console.error("Failed to load requests:", err);
      message.error("Failed to load requests");
      setRequests([]);
      setFilteredRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [storedRole]);

  useEffect(() => {
    setSortedInfo({ order: "ascend", columnKey: "status", field: "status" });
  }, []);

  useEffect(() => {
    setFilteredRequests(getDefaultSortedData(applyFilters(requests)));
  }, [searchText, statusFilter, requestTypeFilter, dateRange, requests]);

  const handleDelete = async (requestId) => {
    try {
      await deleteRequest(requestId);
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
      setFilteredRequests((prev) =>
        prev.filter((r) => r.requestId !== requestId)
      );
      message.success("Request deleted successfully");
    } catch (error) {
      console.error("Failed to delete request", error);
      message.error("Failed to delete request");
    }
  };

  // Hàm xử lý xem chi tiết
  const handleViewDetails = async (record) => {
    setDetailsLoading(true);
    setDetailsVisible(true);
    setRequestByUser(null);

    try {
      const requestData = await getRequestById(record.requestId);
      console.log("Request Data:", requestData);
      console.log(
        "Request Type:",
        requestData.requestType,
        "Type of:",
        typeof requestData.requestType
      );
      console.log(
        "Is training plan type:",
        [0, 1, 2, 4, 5].includes(Number(requestData.requestType))
      );
      setCurrentRequest(requestData);

      // Lấy thông tin người gửi yêu cầu nếu có requestById
      if (requestData.requestById) {
        try {
          const userData = await getUserById(requestData.requestById);
          setRequestByUser(userData);
        } catch (userError) {
          console.error("Failed to fetch requester details", userError);
        }
      }
    } catch (error) {
      console.error("Failed to fetch request details", error);
      message.error("Failed to load request details");
    } finally {
      setDetailsLoading(false);
    }
  };

  // Đóng popup
  const handleCloseDetails = () => {
    setDetailsVisible(false);
    setCurrentRequest(null);
    setRequestByUser(null);
  };

  // Hàm approve request
  const handleApprove = async () => {
    if (!currentRequest) return;

    try {
      const response = await approveRequest(currentRequest.requestId);
      message.success("Request approved successfully");

      // Cập nhật state
      const updatedRequest = {
        ...currentRequest,
        status: "Approved",
        approvedById: sessionStorage.getItem("userId") || "Unknown",
        approvedDate: new Date().toISOString(),
      };
      setCurrentRequest(updatedRequest);

      // Cập nhật danh sách
      const updatedRequests = requests.map((req) =>
        req.requestId === currentRequest.requestId
          ? { ...req, status: "Approved" }
          : req
      );
      setRequests(updatedRequests);
      setFilteredRequests(getDefaultSortedData(applyFilters(updatedRequests)));
    } catch (error) {
      console.error("Failed to approve request", error);
      message.error("Failed to approve request");
    }
  };

  // Hàm reject request
  const handleReject = () => {
    if (!currentRequest) return;
    setRejectReason("");
    setRejectModalVisible(true);
  };

  // Hàm xác nhận từ chối với lý do
  const confirmReject = async () => {
    if (!currentRequest) return;

    try {
      // Gọi API với lý do từ chối
      const response = await rejectRequest(currentRequest.requestId, {
        rejectReason,
      });
      message.success("Request rejected successfully");

      // Cập nhật state
      const updatedRequest = {
        ...currentRequest,
        status: "Rejected",
        approvedById: sessionStorage.getItem("userId") || "Unknown",
        approvedDate: new Date().toISOString(),
      };
      setCurrentRequest(updatedRequest);

      // Cập nhật danh sách
      const updatedRequests = requests.map((req) =>
        req.requestId === currentRequest.requestId
          ? { ...req, status: "Rejected" }
          : req
      );
      setRequests(updatedRequests);
      setFilteredRequests(getDefaultSortedData(applyFilters(updatedRequests)));

      // Đóng modal từ chối
      setRejectModalVisible(false);
    } catch (error) {
      console.error("Failed to reject request", error);
      message.error("Failed to reject request");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "requestId",
      key: "requestId",
      sorter: (a, b) => a.requestId.localeCompare(b.requestId),
      render: (text, record) => (
        <Link
          to={`/requests/${record.requestId}`}
          className="text-blue-600 hover:text-blue-800"
        >
          {text}
        </Link>
      ),
    },
    {
      title: "Type",
      dataIndex: "requestType",
      key: "requestType",
      render: (type) => {
        console.log("Rendering table RequestType:", type, typeof type);
        const typeNum = Number(type);
        return RequestTypeEnum[typeNum] || `${type}`;
      },
      sorter: (a, b) => {
        const typeNumA = Number(a.requestType);
        const typeNumB = Number(b.requestType);
        const typeA = RequestTypeEnum[typeNumA];
        const typeB = RequestTypeEnum[typeNumB];
        return typeA.localeCompare(typeB);
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      defaultSortOrder: "ascend",
      sorter: (a, b) => {
        if (a.status === "Pending" && b.status !== "Pending") return -1;
        if (a.status !== "Pending" && b.status === "Pending") return 1;
        if (a.status === b.status) {
          return new Date(b.requestDate) - new Date(a.requestDate);
        }
        const statusOrder = { Pending: 0, Approved: 1, Rejected: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      },
      sortOrder: sortedInfo.columnKey === "status" ? sortedInfo.order : null,
      render: (status) => {
        let color = "default";
        let icon = null;

        if (status === "Approved") {
          color = "success";
          icon = <CheckCircleOutlined />;
        } else if (status === "Rejected") {
          color = "error";
          icon = <CloseCircleOutlined />;
        } else if (status === "Pending") {
          color = "warning";
          icon = <ClockCircleOutlined />;
        }

        return (
          <Tag color={color} icon={icon}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "requestDate",
      key: "requestDate",
      render: (date) => (
        <span>
          <CalendarOutlined className="mr-2" />
          {new Date(date).toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      ),
      sorter: (a, b) => new Date(a.requestDate) - new Date(b.requestDate),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text) => (
        <div className="max-w-md truncate">{text || "No description"}</div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            title="View Details"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.requestId)}
            disabled={record.status == "Pending"}
            title="Delete"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6 sm:p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="p-6 bg-gradient-to-br from-indigo-100 to-blue-50 rounded-full shadow-lg border-2 border-indigo-200 hover:scale-105 transition-transform">
                <FileTextOutlined className="text-5xl text-indigo-500 drop-shadow-md hover:text-indigo-600" />
              </div>
              <div>
                <Title level={2} className="text-gray-800 mb-2">
                  Request List
                </Title>
                <p className="text-gray-600">
                  {storedRole === "Training staff"
                    ? "Requests submitted by Education Officers"
                    : "All submitted requests and their statuses"}
                </p>
              </div>
            </div>
            <Space size="large" wrap>
              <Search
                placeholder="Search by ID or Description"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                value={searchText}
                style={{ width: 300 }}
              />
              <Button
                icon={showFilters ? <UpOutlined /> : <FilterOutlined />}
                onClick={toggleFilters}
                size="large"
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchRequests}
                loading={loading}
                type="primary"
                size="large"
              >
                Refresh
              </Button>
            </Space>
          </div>

          {showFilters && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <label className="block text-gray-700 font-medium mb-1">
                    Status
                  </label>
                  <Select
                    allowClear
                    placeholder="Select Status"
                    onChange={setStatusFilter}
                    value={statusFilter}
                    style={{ width: "100%" }}
                  >
                    <Option value="Pending">Pending</Option>
                    <Option value="Approved">Approved</Option>
                    <Option value="Rejected">Rejected</Option>
                  </Select>
                </Col>
                <Col xs={24} md={8}>
                  <label className="block text-gray-700 font-medium mb-1">
                    Request Type
                  </label>
                  <Select
                    allowClear
                    placeholder="Select Request Type"
                    onChange={(value) => setRequestTypeFilter(value)}
                    value={requestTypeFilter}
                    style={{ width: "100%" }}
                  >
                    {Object.entries(RequestTypeEnum).map(([key, label]) => (
                      <Option key={key} value={parseInt(key, 10)}>
                        {label}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} md={8}>
                  <label className="block text-gray-700 font-medium mb-1">
                    Date Range
                  </label>
                  <RangePicker
                    style={{ width: "100%" }}
                    onChange={(dates) => setDateRange(dates)}
                    value={dateRange}
                  />
                </Col>
              </Row>
            </div>
          )}

          <Table
            columns={columns}
            dataSource={filteredRequests}
            onChange={handleChange}
            loading={loading}
            pagination={{
              total: filteredRequests.length,
              pageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: ["7", "10", "20", "50", "100"],
              showQuickJumper: true,
              showTotal: (total) => `Total ${total} requests`,
            }}
            bordered
            scroll={{ x: "max-content", y: 500 }}
            className="shadow-md"
            rowClassName={(record) =>
              record.status === "Pending"
                ? "bg-orange-50/50 hover:bg-orange-100/70"
                : ""
            }
          />

          {/* Hiển thị modal chi tiết */}
          <Modal
            title="Request Details"
            open={detailsVisible}
            onCancel={handleCloseDetails}
            width={700}
            footer={null}
          >
            {detailsLoading ? (
              <div className="flex justify-center py-12">
                <Spin size="large" />
              </div>
            ) : currentRequest ? (
              <div className="space-y-6">
                <Card className="shadow-md border border-gray-100">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Request ID: {currentRequest.requestId}
                    </h2>

                    <div className="flex items-center gap-2 text-gray-600">
                      <ProfileOutlined className="text-indigo-500" />
                      <span className="text-sm font-medium">
                        Type:{" "}
                        {RequestTypeEnum[currentRequest.requestType] ||
                          currentRequest.requestType}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <UserOutlined className="text-indigo-500" />
                      <span className="text-sm font-medium">
                        Requested By:{" "}
                        {requestByUser
                          ? `${requestByUser.fullName} (${currentRequest.requestById})`
                          : currentRequest.requestById || "Unknown"}
                      </span>
                    </div>

                    {currentRequest.requestEntityId && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <ProfileOutlined className="text-indigo-500" />
                        <span className="text-sm font-medium">
                          {isTrainingPlanType(currentRequest.requestType)
                            ? "Training Plan ID: "
                            : "Entity ID: "}
                          {
                            // Nếu là các loại request về training plan thì hiển thị link
                            isTrainingPlanType(currentRequest.requestType) ? (
                              <Link
                                to={`/plan/${currentRequest.requestEntityId}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                                title="Click to view Training Plan details"
                              >
                                {currentRequest.requestEntityId}
                              </Link>
                            ) : (
                              currentRequest.requestEntityId
                            )
                          }
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-600">
                      <FileTextOutlined className="text-indigo-500" />
                      <span className="text-sm font-medium">
                        Description:{" "}
                        {currentRequest.description || "No description"}
                      </span>
                    </div>

                    {currentRequest.notes && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileTextOutlined className="text-indigo-500" />
                        <span className="text-sm font-medium">
                          Notes: {currentRequest.notes}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-600">
                      <CalendarOutlined className="text-indigo-500" />
                      <span className="text-sm font-medium">
                        Request Date:{" "}
                        {currentRequest.requestDate
                          ? new Date(
                              currentRequest.requestDate
                            ).toLocaleString()
                          : "N/A"}
                      </span>
                    </div>

                    {currentRequest.approvedById && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <UserOutlined className="text-indigo-500" />
                        <span className="text-sm font-medium">
                          {currentRequest.status === "Approved"
                            ? "Approved"
                            : "Rejected"}{" "}
                          By: {currentRequest.approvedById}
                          {currentRequest.approvedDate &&
                            ` (${new Date(
                              currentRequest.approvedDate
                            ).toLocaleString()})`}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-600">
                      Status:{" "}
                      <Tag
                        icon={
                          currentRequest.status === "Approved" ? (
                            <CheckCircleOutlined />
                          ) : currentRequest.status === "Rejected" ? (
                            <CloseCircleOutlined />
                          ) : (
                            <ClockCircleOutlined />
                          )
                        }
                        color={
                          currentRequest.status === "Approved"
                            ? "green"
                            : currentRequest.status === "Rejected"
                            ? "red"
                            : "orange"
                        }
                        className="text-sm font-medium px-3 py-1 rounded-full"
                      >
                        {currentRequest.status || "Unknown"}
                      </Tag>
                    </div>
                  </div>
                </Card>

                <div className="flex justify-end gap-4 mt-6">
                  {currentRequest.status === "Pending" && (
                    <>
                      <Button
                        type="primary"
                        onClick={handleApprove}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        Approve
                      </Button>
                      <Button danger onClick={handleReject}>
                        Reject
                      </Button>
                    </>
                  )}

                  {/* Thêm nút view training plan nếu là request liên quan đến training plan */}
                  {currentRequest.requestEntityId &&
                    isTrainingPlanType(currentRequest.requestType) && (
                      <Link
                        to={`/training-plan/${currentRequest.requestEntityId}`}
                      >
                        <Button
                          type="primary"
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          View Training Plan
                        </Button>
                      </Link>
                    )}

                  <Button onClick={handleCloseDetails}>Close</Button>
                </div>
              </div>
            ) : (
              <p className="text-red-500">Request not found.</p>
            )}
          </Modal>

          {/* Modal để nhập lý do từ chối */}
          <Modal
            title="Reject Request"
            open={rejectModalVisible}
            onCancel={() => setRejectModalVisible(false)}
            onOk={confirmReject}
            okText="Reject"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
          >
            <div className="mb-4">
              <p className="mb-2 text-gray-700">
                Please provide a reason for rejection:
              </p>
              <Input.TextArea
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full"
              />
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default RequestList;
