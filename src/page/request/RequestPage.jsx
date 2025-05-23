import { useEffect, useState, useRef } from "react";
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
  Alert,
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
  WarningOutlined,
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
  14: "Certificate Template",
  15: "Decision Template",
  16: "Sign Request",
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

// Hàm helper kiểm tra loại Complaint
const isComplaintType = (requestType) => {
  if (typeof requestType === "string") {
    if (requestType === "Complaint") return true;

    // Thử chuyển về số nếu không khớp với tên
    const type = parseInt(requestType, 10);
    if (!isNaN(type)) {
      return type === 3;
    }
    return false;
  }

  // Trường hợp requestType là số
  return Number(requestType) === 3;
};

// Hàm helper để kiểm tra xem request type có phải loại Certificate Template không
const isCertificateTemplateType = (requestType) => {
  if (typeof requestType === "string") {
    if (
      requestType === "CertificateTemplate" ||
      requestType === "Certificate Template"
    )
      return true;

    // Thử chuyển về số nếu không khớp với tên
    const type = parseInt(requestType, 10);
    if (!isNaN(type)) {
      return type === 14;
    }
    return false;
  }

  // Trường hợp requestType là số
  return Number(requestType) === 14;
};

// Hàm helper để kiểm tra xem request type có phải loại Decision Template không
const isDecisionTemplateType = (requestType) => {
  if (typeof requestType === "string") {
    if (
      requestType === "DecisionTemplate" ||
      requestType === "Decision Template"
    )
      return true;

    // Thử chuyển về số nếu không khớp với tên
    const type = parseInt(requestType, 10);
    if (!isNaN(type)) {
      return type === 15;
    }
    return false;
  }

  // Trường hợp requestType là số
  return Number(requestType) === 16;
};

// Hàm helper để kiểm tra xem request type có phải loại Assign Trainee không
const isTraineeAssignType = (requestType) => {
  if (typeof requestType === "string") {
    if (requestType === "AssignTrainee" || requestType === "Assign Trainee")
      return true;
    if (
      requestType === "AddTraineeAssign" ||
      requestType === "Add Trainee Assign"
    )
      return true;

    // Thử chuyển về số nếu không khớp với tên
    const type = parseInt(requestType, 10);
    if (!isNaN(type)) {
      return type === 12 || type === 13;
    }
    return false;
  }

  // Trường hợp requestType là số
  return Number(requestType) === 12 || Number(requestType) === 13;
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

  // State cho preview template
  const [templatePreviewVisible, setTemplatePreviewVisible] = useState(false);
  const [templatePreviewUrl, setTemplatePreviewUrl] = useState("");
  const [templatePreviewLoading, setTemplatePreviewLoading] = useState(false);
  const [templatePreviewError, setTemplatePreviewError] = useState(null);
  const templateLoadingTimeoutRef = useRef(null);

  // State cho danh sách học viên
  const [traineesData, setTraineesData] = useState([]);
  const [traineesLoading, setTraineesLoading] = useState(false);

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
    setTraineesData([]);

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

      // Nếu là yêu cầu gán học viên (requestType = 12 hoặc 13)
      if (isTraineeAssignType(requestData.requestType)) {
        console.log(
          "Detected trainee assign request, fetching trainee data..."
        );
        setTraineesLoading(true);
        try {
          const { getTraineesByRequestId } = await import(
            "../../services/requestService"
          );
          const traineesResult = await getTraineesByRequestId(record.requestId);
          console.log("Trainees Data:", traineesResult);
          setTraineesData(traineesResult || []);
        } catch (traineesError) {
          console.error("Failed to fetch trainees details", traineesError);
          setTraineesData([]);
        } finally {
          setTraineesLoading(false);
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
    setTraineesData([]);
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

  // Hàm hiển thị preview certificate template
  const handleViewCertificateTemplate = async (templateId) => {
    setTemplatePreviewLoading(true);
    setTemplatePreviewError(null);
    setTemplatePreviewVisible(true);
    setTemplatePreviewUrl("");

    // Set timeout để tránh trường hợp loading quá lâu
    templateLoadingTimeoutRef.current = setTimeout(() => {
      if (templatePreviewLoading) {
        setTemplatePreviewLoading(false);
        setTemplatePreviewError(
          "Preview loading timeout. The server took too long to respond."
        );
      }
    }, 15000);

    try {
      const { fetchCertificateTemplatebyId } = await import(
        "../../services/certificateService"
      );
      const data = await fetchCertificateTemplatebyId(templateId);

      if (data?.templateFileWithSas) {
        setTemplatePreviewUrl(data.templateFileWithSas);
      } else {
        setTemplatePreviewError("No template preview available");
      }
    } catch (error) {
      console.error("Failed to fetch certificate template:", error);
      setTemplatePreviewError(
        `Error loading template: ${error.message || "Unknown error"}`
      );
    } finally {
      if (templateLoadingTimeoutRef.current) {
        clearTimeout(templateLoadingTimeoutRef.current);
        templateLoadingTimeoutRef.current = null;
      }
      setTemplatePreviewLoading(false);
    }
  };

  // Hàm hiển thị preview decision template
  const handleViewDecisionTemplate = async (templateId) => {
    setTemplatePreviewLoading(true);
    setTemplatePreviewError(null);
    setTemplatePreviewVisible(true);
    setTemplatePreviewUrl("");

    // Set timeout để tránh trường hợp loading quá lâu
    templateLoadingTimeoutRef.current = setTimeout(() => {
      if (templatePreviewLoading) {
        setTemplatePreviewLoading(false);
        setTemplatePreviewError(
          "Preview loading timeout. The server took too long to respond."
        );
      }
    }, 15000);

    try {
      const { fetchDecisionTemplatebyId } = await import(
        "../../services/decisionService"
      );
      const data = await fetchDecisionTemplatebyId(templateId);

      if (data?.templateContentWithSas) {
        setTemplatePreviewUrl(data.templateContentWithSas);
      } else {
        setTemplatePreviewError("No template preview available");
      }
    } catch (error) {
      console.error("Failed to fetch decision template:", error);
      setTemplatePreviewError(
        `Error loading template: ${error.message || "Unknown error"}`
      );
    } finally {
      if (templateLoadingTimeoutRef.current) {
        clearTimeout(templateLoadingTimeoutRef.current);
        templateLoadingTimeoutRef.current = null;
      }
      setTemplatePreviewLoading(false);
    }
  };

  // Đóng modal template preview
  const closeTemplatePreview = () => {
    setTemplatePreviewVisible(false);
    if (templatePreviewUrl) {
      URL.revokeObjectURL(templatePreviewUrl);
      setTemplatePreviewUrl("");
    }
    setTemplatePreviewError(null);
    if (templateLoadingTimeoutRef.current) {
      clearTimeout(templateLoadingTimeoutRef.current);
      templateLoadingTimeoutRef.current = null;
    }
  };

  // Thêm cleanup cho timeout khi component unmount
  useEffect(() => {
    return () => {
      if (templateLoadingTimeoutRef.current) {
        clearTimeout(templateLoadingTimeoutRef.current);
      }
    };
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "requestId",
      key: "requestId",
      sorter: (a, b) => a.requestId.localeCompare(b.requestId),
      render: (text, record) => (
        <Link
          to={`/requests/${record.requestId}`}
          className="!text-cyan-600 hover:text-cyan-800 font-medium"
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-white to-cyan-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-2xl p-6 sm:p-8 mb-8 border border-cyan-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="p-6 bg-gradient-to-br from-cyan-200 to-cyan-100 rounded-full shadow-lg border-2 border-cyan-300 hover:scale-105 transition-transform">
                <FileTextOutlined className="text-5xl text-cyan-700 drop-shadow-md hover:text-cyan-800" />
              </div>
              <div>
                <Title level={2} className="text-cyan-900 mb-2">
                  Request List
                </Title>
                <p className="text-cyan-700">
                  {storedRole === "Training staff"
                    ? "Requests submitted to Training Staff"
                    : "Requests submitted to Head Master"}
                </p>
              </div>
            </div>
            <Space size="large" wrap>
              <Search
                placeholder="Search by ID or Description"
                allowClear
                enterButton={
                  <Button
                    type="primary"
                    style={{
                      backgroundColor: "#155e75", // Tailwind's cyan-800
                      borderColor: "#155e75",
                    }}
                    icon={<SearchOutlined />}
                  />
                }
                size="large"
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                value={searchText}
                style={{ width: 300, borderColor: "#155e75" }}
              />

              <Button
                icon={showFilters ? <UpOutlined /> : <FilterOutlined />}
                onClick={toggleFilters}
                size="large"
                className="!text-cyan-800 !border-cyan-600 hover:bg-cyan-50"
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchRequests}
                loading={loading}
                type="primary"
                size="large"
                className="!bg-cyan-700 hover:!bg-cyan-800 !border-cyan-800"
              >
                Refresh
              </Button>
            </Space>
          </div>

          {showFilters && (
            <div className="mb-6 p-4 bg-cyan-50 rounded-xl border border-cyan-200 shadow-sm">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <label className="block text-cyan-800 font-medium mb-1">
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
                  <label className="block text-cyan-800 font-medium mb-1">
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
                  <label className="block text-cyan-800 font-medium mb-1">
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
                ? "bg-cyan-50 hover:bg-cyan-100/80"
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
                                        className="text-cyan-600 hover:text-cyan-800 hover:underline cursor-pointer"
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

                    {/* Hiển thị thông tin học viên khi loại yêu cầu là gán học viên */}
                    {isTraineeAssignType(currentRequest.requestType) && (
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <IdcardOutlined className="text-indigo-500" />
                          <span className="text-sm font-semibold">
                            Assigned Trainees:
                          </span>
                        </div>

                        {traineesLoading ? (
                          <div className="flex justify-center py-2">
                            <Spin size="small" />
                          </div>
                        ) : traineesData.length > 0 ? (
                          <div className="bg-gray-50 p-3 rounded-md">
                            <List
                              size="small"
                              bordered
                              dataSource={traineesData}
                              renderItem={(trainee) => (
                                <List.Item>
                                  <div className="w-full flex items-center justify-between">
                                    <div>
                                      <span
                                        className="text-cyan-600 hover:text-cyan-800 hover:underline cursor-pointer"
                                        onClick={() =>
                                          navigate(
                                            `/assigned-trainee/${trainee.traineeAssignId}`
                                          )
                                        }
                                      >
                                        {trainee.traineeAssignId}
                                      </span>
                                    </div>
                                    <div>
                                      {trainee.requestStatus === "Pending" && (
                                        <Tag color="orange">Pending</Tag>
                                      )}
                                      {trainee.requestStatus === "Approved" && (
                                        <Tag color="green">Approved</Tag>
                                      )}
                                      {trainee.requestStatus === "Rejected" && (
                                        <Tag color="red">Rejected</Tag>
                                      )}
                                    </div>
                                  </div>
                                </List.Item>
                              )}
                            />
                            {traineesData.length > 3 && (
                              <div className="mt-2 text-right">
                                <span className="text-gray-500 text-sm">
                                  Total: {traineesData.length} trainees
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            No trainees information available.
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
                              : isComplaintType(currentRequest.requestType)
                              ? "Subject ID: "
                              : isCertificateTemplateType(
                                  currentRequest.requestType
                                )
                              ? "Certificate Template ID: "
                              : isDecisionTemplateType(
                                  currentRequest.requestType
                                )
                              ? "Decision Template ID: "
                              : "Entity ID: "}
                            {
                              // Nếu là các loại request về training plan thì hiển thị link
                              isTrainingPlanType(currentRequest.requestType) ? (
                                <Link
                                  to={`/plan/details/${currentRequest.requestEntityId}`}
                                  className="text-cyan-600 hover:text-cyan-800 hover:underline"
                                  title="Click to view Training Plan details"
                                >
                                  {currentRequest.requestEntityId}
                                </Link>
                              ) : isComplaintType(
                                  currentRequest.requestType
                                ) ? (
                                <Link
                                  to={`/subject/${currentRequest.requestEntityId}`}
                                  className="text-cyan-600 hover:text-cyan-800 hover:underline"
                                  title="Click to view Subject details"
                                >
                                  {currentRequest.requestEntityId}
                                </Link>
                              ) : isCertificateTemplateType(
                                  currentRequest.requestType
                                ) ? (
                                <Button
                                  type="link"
                                  className="text-cyan-600 hover:text-cyan-800 hover:underline p-0"
                                  onClick={() =>
                                    handleViewCertificateTemplate(
                                      currentRequest.requestEntityId
                                    )
                                  }
                                  title="Click to preview Certificate Template"
                                >
                                  {currentRequest.requestEntityId}
                                </Button>
                              ) : isDecisionTemplateType(
                                  currentRequest.requestType
                                ) ? (
                                <Button
                                  type="link"
                                  className="text-cyan-600 hover:text-cyan-800 hover:underline p-0"
                                  onClick={() =>
                                    handleViewDecisionTemplate(
                                      currentRequest.requestEntityId
                                    )
                                  }
                                  title="Click to preview Decision Template"
                                >
                                  {currentRequest.requestEntityId}
                                </Button>
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

                <div className="flex justify-between flex-wrap gap-4 mt-6">
                  {/* Left-side buttons (view, preview, etc.) */}
                  <div className="flex flex-wrap gap-3">
                    {/* Candidate detail button */}
                    {(Number(currentRequest.requestType) === 9 ||
                      currentRequest.requestType === "CandidateImport" ||
                      currentRequest.requestType === "Candidate Import") &&
                      candidateData.length > 0 &&
                      (candidateData.length === 1 ? (
                        <Button
                          type="primary"
                          className="!bg-cyan-700 hover:!bg-cyan-800"
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
                          className="!bg-cyan-700 hover:!bg-cyan-800"
                          onClick={() =>
                            message.info(
                              "Click on a candidate ID to view details"
                            )
                          }
                        >
                          {`View ${candidateData.length} Candidates`}
                        </Button>
                      ))}

                    {/* Trainee detail button */}
                    {isTraineeAssignType(currentRequest.requestType) &&
                      traineesData.length > 0 &&
                      (traineesData.length === 1 ? (
                        <Button
                          type="primary"
                          className="!bg-cyan-700 hover:!bg-cyan-800"
                          onClick={() =>
                            navigate(
                              `/assigned-trainee/${traineesData[0].train}`
                            )
                          }
                        >
                          View Trainee Details
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          className="!bg-cyan-700 hover:!bg-cyan-800"
                          onClick={() => navigate("/assigned-trainee")}
                        >
                          {`View All Trainees`}
                        </Button>
                      ))}

                    {/* Training Plan button */}
                    {currentRequest.requestEntityId &&
                      isTrainingPlanType(currentRequest.requestType) && (
                        <Link
                          to={`/plan/details/${currentRequest.requestEntityId}`}
                        >
                          <Button
                            type="primary"
                            className="!bg-cyan-700 hover:!bg-cyan-800"
                          >
                            View Training Plan
                          </Button>
                        </Link>
                      )}

                    {/* Subject button */}
                    {currentRequest.requestEntityId &&
                      isComplaintType(currentRequest.requestType) && (
                        <Link to={`/subject/${currentRequest.requestEntityId}`}>
                          <Button
                            type="primary"
                            className="!bg-cyan-700 hover:!bg-cyan-800"
                          >
                            View Subject
                          </Button>
                        </Link>
                      )}

                    {/* Certificate Template preview */}
                    {currentRequest.requestEntityId &&
                      isCertificateTemplateType(currentRequest.requestType) && (
                        <Button
                          type="primary"
                          className="!bg-cyan-700 hover:!bg-cyan-800"
                          onClick={() =>
                            handleViewCertificateTemplate(
                              currentRequest.requestEntityId
                            )
                          }
                        >
                          Preview Certificate Template
                        </Button>
                      )}

                    {/* Decision Template preview */}
                    {currentRequest.requestEntityId &&
                      isDecisionTemplateType(currentRequest.requestType) && (
                        <Button
                          type="primary"
                          className="!bg-cyan-700 hover:!bg-cyan-800"
                          onClick={() =>
                            handleViewDecisionTemplate(
                              currentRequest.requestEntityId
                            )
                          }
                        >
                          Preview Decision Template
                        </Button>
                      )}
                  </div>

                  {/* Right-side buttons (Approve, Reject, Close) */}
                  <div className="flex gap-3">
                    {currentRequest.status === "Pending" && (
                      <>
                        <Button
                          type="primary"
                          onClick={handleApprove}
                          className="!bg-green-600 hover:!bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button danger onClick={handleReject}>
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
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

          {/* Modal xem trước template */}
          <Modal
            title="Template Preview"
            open={templatePreviewVisible}
            onCancel={closeTemplatePreview}
            footer={[
              <Button key="close" onClick={closeTemplatePreview}>
                Close
              </Button>,
            ]}
            width={800}
            maskClosable
            closable
            destroyOnClose
          >
            {templatePreviewLoading ? (
              <div className="flex justify-center items-center h-60">
                <Spin tip="Loading template..." />
              </div>
            ) : templatePreviewError ? (
              <Alert
                message="Error Loading Preview"
                description={
                  <Space direction="vertical">
                    <div>{templatePreviewError}</div>
                    <Button
                      type="primary"
                      danger
                      onClick={closeTemplatePreview}
                    >
                      <CloseCircleOutlined /> Close Preview
                    </Button>
                  </Space>
                }
                type="error"
                showIcon
                icon={<WarningOutlined />}
              />
            ) : (
              templatePreviewUrl && (
                <iframe
                  src={templatePreviewUrl}
                  title="Template Preview"
                  style={{ width: "100%", height: "600px", border: "none" }}
                  onError={() =>
                    setTemplatePreviewError("Failed to load template content.")
                  }
                />
              )
            )}
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default RequestList;
