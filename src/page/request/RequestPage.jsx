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
  List,
  Popconfirm,
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
  EyeOutlined,
  UserOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import {
  getAllRequests,
  getAllEduOfficerRequests,
  deleteRequest,
  getRequestById,
  approveRequest,
  rejectRequest,
} from "../../services/requestService";
import { getUserById } from "../../services/userService";
import { getCandidateByRequestId } from "../../services/candidateService";

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
  const isAdmin = storedRole === "Admin";
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
  const [approvedByUser, setApprovedByUser] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectModalVisible, setRejectModalVisible] = useState(false);

  const [candidateData, setCandidateData] = useState([]);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const navigate = useNavigate();

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
    if (pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
    }
  };

  // Lệnh logging để debug giá trị requestType
  const handleDebugRequestType = () => {
    console.log(
      "Current requests with requestType:",
      requests.map((req) => ({
        id: req.requestId,
        type: req.requestType,
        typeNum: Number(req.requestType),
        typeName: RequestTypeEnum[Number(req.requestType)],
      }))
    );
    console.log("Current requestTypeFilter:", requestTypeFilter);
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

    if (requestTypeFilter !== null && requestTypeFilter !== undefined) {
      filtered = filtered.filter((request) => {
        // Chuyển đổi requestType thành số
        const requestTypeValue = Number(request.requestType);
        // Debug để kiểm tra giá trị requestType
        console.log(
          `Filtering: ${request.requestId}, type=${
            request.requestType
          }, typeNum=${requestTypeValue}, filter=${requestTypeFilter}, match=${
            requestTypeValue === requestTypeFilter
          }`
        );
        // So sánh chính xác với giá trị filter
        return requestTypeValue === requestTypeFilter;
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

  const handleDeleteConfirm = async (requestId) => {
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
    setApprovedByUser(null);
    setCandidateData([]);

    try {
      const requestData = await getRequestById(record.requestId);
      console.log("Request Data:", requestData);
      console.log(
        "Request Type:",
        requestData.requestType,
        "Type of:",
        typeof requestData.requestType
      );
      setCurrentRequest(requestData);

      // Lấy thông tin người gửi yêu cầu và người phê duyệt (nếu có)
      if (requestData.requestById) {
        try {
          const userData = await getUserById(requestData.requestById);
          setRequestByUser(userData);

          // Kiểm tra và lấy thông tin người phê duyệt nếu có
          if (requestData.actionByUserId) {
            try {
              const actionByUserData = await getUserById(
                requestData.actionByUserId
              );
              setApprovedByUser(actionByUserData);
            } catch (actionByUserError) {
              console.error(
                "Failed to fetch action user details",
                actionByUserError
              );
            }
          }
        } catch (userError) {
          console.error("Failed to fetch requester details", userError);
        }
      }

      // Nếu là yêu cầu nhập ứng viên (requestType = 9 hoặc "CandidateImport")
      if (
        Number(requestData.requestType) === 9 ||
        requestData.requestType === "CandidateImport" ||
        requestData.requestType === "Candidate Import"
      ) {
        console.log(
          "Detected candidate import request, fetching candidate data..."
        );
        setCandidateLoading(true);
        try {
          const candidateResult = await getCandidateByRequestId(
            record.requestId
          );
          console.log("Candidate Data:", candidateResult);
          setCandidateData(candidateResult || []);
        } catch (candidateError) {
          console.error("Failed to fetch candidate details", candidateError);
          setCandidateData([]);
        } finally {
          setCandidateLoading(false);
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
    setApprovedByUser(null);
    setCandidateData([]);
  };

  // Hàm approve request
  const handleApprove = async () => {
    if (!currentRequest) return;

    try {
      // const response =
      await approveRequest(currentRequest.requestId);
      message.success("Request approved successfully");

      // Lấy thông tin người dùng hiện tại
      const userId = sessionStorage.getItem("userId");
      let approverName = userId || "Unknown";

      try {
        const userData = await getUserById(userId);
        if (userData && userData.fullName) {
          approverName = `${userData.fullName} (${userId})`;
        }
      } catch (userError) {
        console.error("Failed to fetch approver details", userError);
      }

      // Cập nhật state
      const updatedRequest = {
        ...currentRequest,
        status: "Approved",
        actionByUserId: userId,
        approvedByName: approverName,
        approvedDate: new Date().toISOString(),
      };
      setCurrentRequest(updatedRequest);

      // Cập nhật thông tin người phê duyệt
      try {
        const approvedByUserData = await getUserById(userId);
        setApprovedByUser(approvedByUserData);
      } catch (error) {
        console.error("Failed to fetch approver details", error);
      }

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
      // const response =
      await rejectRequest(currentRequest.requestId, {
        rejectReason,
      });
      message.success("Request rejected successfully");

      // Lấy thông tin người dùng hiện tại
      const userId = sessionStorage.getItem("userId");
      let rejecterName = userId || "Unknown";

      try {
        const userData = await getUserById(userId);
        if (userData && userData.fullName) {
          rejecterName = `${userData.fullName} (${userId})`;
        }
      } catch (userError) {
        console.error("Failed to fetch rejecter details", userError);
      }

      // Cập nhật state
      const updatedRequest = {
        ...currentRequest,
        status: "Rejected",
        actionByUserId: userId,
        approvedByName: rejecterName,
        approvedDate: new Date().toISOString(),
      };
      setCurrentRequest(updatedRequest);

      // Cập nhật thông tin người từ chối
      try {
        const approvedByUserData = await getUserById(userId);
        setApprovedByUser(approvedByUserData);
      } catch (error) {
        console.error("Failed to fetch rejecter details", error);
      }

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

  // Sửa lại hàm handleRequestTypeFilterChange
  const handleRequestTypeFilterChange = (value) => {
    console.log("Selected request type filter:", value);
    setRequestTypeFilter(value);
  };

  // Hàm chuyển hướng đến trang chi tiết ứng viên
  const navigateToCandidateDetail = (candidateId) => {
    navigate(`/candidates/${candidateId}`);
    handleCloseDetails();
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
      sortOrder:
        sortedInfo.columnKey === "requestDate" ? sortedInfo.order : null,
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
          {isAdmin && (
            <Popconfirm
              title="Delete Request"
              description="Are you sure you want to delete this request?"
              onConfirm={() => handleDeleteConfirm(record.requestId)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            title="Delete"
          />
            </Popconfirm>
          )}
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
                    onChange={handleRequestTypeFilterChange}
                    value={requestTypeFilter}
                    style={{ width: "100%" }}
                    onDropdownVisibleChange={(open) => {
                      if (open) handleDebugRequestType();
                    }}
                  >
                    {Object.entries(RequestTypeEnum).map(([key, label]) => (
                      <Option key={key} value={Number(key)}>
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

                    {/* Hiển thị thông tin ứng viên khi loại yêu cầu là nhập ứng viên */}
                    {(Number(currentRequest.requestType) === 9 ||
                      currentRequest.requestType === "CandidateImport" ||
                      currentRequest.requestType === "Candidate Import") && (
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <IdcardOutlined className="text-indigo-500" />
                          <span className="text-sm font-semibold">
                            Candidate Information:
                          </span>
                        </div>

                        {candidateLoading ? (
                          <div className="flex justify-center py-2">
                            <Spin size="small" />
                          </div>
                        ) : candidateData.length > 0 ? (
                          <div className="bg-gray-50 p-3 rounded-md">
                            <List
                              size="small"
                              bordered
                              dataSource={candidateData}
                              renderItem={(candidate) => (
                                <List.Item>
                                  <div className="w-full flex items-center justify-between">
                                    <div>
                                      <span
                                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                        onClick={() =>
                                          navigateToCandidateDetail(
                                            candidate.candidateId
                                          )
                                        }
                                      >
                                        {candidate.candidateId}
                                      </span>
                                      <span className="mx-2">-</span>
                                      <span className="font-medium">
                                        {candidate.fullName}
                                      </span>
                                    </div>
                                    <div>
                                      {candidate.candidateStatus === 0 && (
                                        <Tag color="orange">Pending</Tag>
                                      )}
                                      {candidate.candidateStatus === 1 && (
                                        <Tag color="green">Approved</Tag>
                                      )}
                                      {candidate.candidateStatus === 2 && (
                                        <Tag color="red">Rejected</Tag>
                                      )}
                                    </div>
                                  </div>
                                </List.Item>
                              )}
                            />
                            {candidateData.length > 3 && (
                              <div className="mt-2 text-right">
                                <span className="text-gray-500 text-sm">
                                  Total: {candidateData.length} candidates
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            No candidate information available.
                          </p>
                        )}
                      </div>
                    )}

                    {currentRequest.requestEntityId &&
                      !(
                        Number(currentRequest.requestType) === 9 ||
                        currentRequest.requestType === "CandidateImport" ||
                        currentRequest.requestType === "Candidate Import"
                      ) && (
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
                                  to={`/plan/details/${currentRequest.requestEntityId}`}
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

                    {currentRequest.actionByUserId && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <UserOutlined className="text-indigo-500" />
                        <span className="text-sm font-medium">
                          {currentRequest.status === "Approved"
                            ? "Approved"
                            : "Rejected"}{" "}
                          By:{" "}
                          {approvedByUser
                            ? `${approvedByUser.fullName} (${currentRequest.actionByUserId})`
                            : currentRequest.approvedByName ||
                              currentRequest.actionByUserId ||
                              "Unknown"}
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

                  {/* Thêm nút xem chi tiết ứng viên nếu là request nhập ứng viên */}
                  {(Number(currentRequest.requestType) === 9 ||
                    currentRequest.requestType === "CandidateImport" ||
                    currentRequest.requestType === "Candidate Import") &&
                    candidateData.length > 0 &&
                    (candidateData.length === 1 ? (
                      <Button
                        type="primary"
                        className="bg-blue-500 hover:bg-blue-600"
                        onClick={() =>
                          navigateToCandidateDetail(
                            candidateData[0].candidateId
                          )
                        }
                      >
                        View Candidate Details
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        className="bg-blue-500 hover:bg-blue-600"
                        onClick={() =>
                          message.info(
                            "Click on a candidate ID to view details"
                          )
                        }
                      >
                        {`View ${candidateData.length} Candidates`}
                      </Button>
                    ))}

                  {/* Thêm nút view training plan nếu là request liên quan đến training plan */}
                  {currentRequest.requestEntityId &&
                    isTrainingPlanType(currentRequest.requestType) && (
                      <Link
                        to={`/plan/details/${currentRequest.requestEntityId}`}
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
