import { useEffect, useState } from "react";
import {
  List,
  Typography,
  Badge,
  message,
  Spin,
  Tag,
  Button,
  Empty,
  Modal,
  Pagination,
  Alert,
  Input,
  Select,
  Radio,
  Tooltip,
} from "antd";
import { notificationService } from "../../services/notificationService";
import {
  BellOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const { Title } = Typography;
const { Option } = Select;

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]); // Lưu trữ tất cả thông báo không phân trang
  const [filteredNotifications, setFilteredNotifications] = useState([]); // Lưu trữ thông báo sau khi lọc
  const [loading, setLoading] = useState(true);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterTypes, setFilterTypes] = useState([]); // Thay đổi thành mảng để lưu nhiều loại
  const [filterReadStatus, setFilterReadStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' là mới nhất lên đầu, 'asc' là cũ nhất lên đầu
  const [userRole, setUserRole] = useState(sessionStorage.getItem("role"));
  const navigate = useNavigate();

  // Kiểm tra xem người dùng có phải là HeadMaster hoặc Training Staff không
  const isHeadmasterOrTrainingStaff =
    userRole === "HeadMaster" || userRole === "TrainingStaff";

  useEffect(() => {
    const userID = sessionStorage.getItem("userID");
    const role = sessionStorage.getItem("role");
    setUserRole(role);

    if (userID) {
      fetchNotifications(userID);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Khi các điều kiện lọc/tìm kiếm thay đổi, cập nhật dữ liệu hiển thị
  useEffect(() => {
    if (allNotifications.length > 0) {
      applyFiltersAndSearch();
    }
  }, [searchText, filterTypes, filterReadStatus, sortOrder, allNotifications]);

  // Khi filtered notifications thay đổi hoặc trang thay đổi, cập nhật pagination
  useEffect(() => {
    updatePaginatedData();
  }, [filteredNotifications, currentPage, pageSize]);

  const fetchNotifications = async (userID) => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getNotificationsByUserId(
        userID
      );
      console.log("Notifications response:", response);

      // Kiểm tra cấu trúc response và lấy dữ liệu phù hợp
      if (response && response.data) {
        const fetchedNotifications = response.data;
        setAllNotifications(fetchedNotifications);
        setFilteredNotifications(fetchedNotifications);

        // Áp dụng sắp xếp mặc định ban đầu
        applyFiltersAndSearch();
      } else {
        setAllNotifications([]);
        setFilteredNotifications([]);
        setNotifications([]);
        setTotalNotifications(0);
      }
    } catch (error) {
      console.error("Error when loading notifications:", error);

      // Kiểm tra nếu thông báo là "No notifications found for this user."
      if (
        error.response?.data?.message ===
        "No notifications found for this user."
      ) {
        // Đây không phải là lỗi, chỉ là không có dữ liệu
        setError(null);
      } else {
        // Các lỗi khác vẫn hiển thị thông báo lỗi
        setError("Unable to load notifications. Please try again later.");
      }

      setAllNotifications([]);
      setFilteredNotifications([]);
      setNotifications([]);
      setTotalNotifications(0);
    } finally {
      setLoading(false);
    }
  };

  // Hàm áp dụng các bộ lọc và tìm kiếm
  const applyFiltersAndSearch = () => {
    let result = [...allNotifications];

    // Áp dụng tìm kiếm theo tiêu đề
    if (searchText) {
      result = result.filter((item) =>
        item.title.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Áp dụng lọc theo loại thông báo - nhiều loại
    if (filterTypes.length > 0) {
      result = result.filter((item) =>
        filterTypes.includes(item.notificationType)
      );
    }

    // Áp dụng lọc theo trạng thái đã đọc
    if (filterReadStatus !== "all") {
      const isRead = filterReadStatus === "read";
      result = result.filter((item) => isNotificationRead(item) === isRead);
    }

    // Áp dụng sắp xếp theo thời gian
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    setFilteredNotifications(result);
    setTotalNotifications(result.length);
    setCurrentPage(1); // Reset lại trang về 1 khi có thay đổi bộ lọc
  };

  // Cập nhật dữ liệu phân trang
  const updatePaginatedData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filteredNotifications.slice(
      startIndex,
      startIndex + pageSize
    );
    setNotifications(paginatedData);
  };

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    try {
      const response = await notificationService.markAsRead(notificationId);
      console.log("Mark as read response:", response);

      // Cập nhật UI sau khi đánh dấu đã đọc
      const updatedAllNotifications = allNotifications.map((notification) =>
        notification.notificationId === notificationId
          ? { ...notification, isRead: true }
          : notification
      );

      setAllNotifications(updatedAllNotifications);

      // Làm mới số lượng thông báo chưa đọc
      refreshUnreadCount();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      message.error(
        "Cannot update notification: " +
          (error.response?.data?.message ||
            error.message ||
            "Please try again later.")
      );
    }
  };

  const refreshUnreadCount = async () => {
    try {
      const userID = sessionStorage.getItem("userID");
      if (userID) {
        // Khởi tạo một event để cập nhật số lượng thông báo chưa đọc trong header và navbar
        const event = new CustomEvent("refreshNotifications");
        window.dispatchEvent(event);

        // Cập nhật trực tiếp số lượng thông báo trong component này
        const result = await notificationService.getUnreadCount(userID);
        if (result && result.unreadCount !== undefined) {
          console.log("Refreshed unread count:", result.unreadCount);
        }
      }
    } catch (error) {
      console.error("Error refreshing unread count:", error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getNotificationTypeColor = (type) => {
    switch (type) {
      case "Request":
        return "blue";
      case "CandidateImport":
        return "green";
      case "Course":
        return "purple";
      case "Schedule":
        return "orange";
      default:
        return "default";
    }
  };

  const getFormattedDate = (dateString) => {
    return moment(dateString).format("DD/MM/YYYY HH:mm");
  };

  const handleRefresh = () => {
    const userID = sessionStorage.getItem("userID");
    if (userID) {
      fetchNotifications(userID);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const showNotificationDetail = (notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);

    // Nếu thông báo chưa đọc, tự động đánh dấu là đã đọc
    if (!notification.isRead) {
      try {
        // Tạo đối tượng event giả để sử dụng với handleMarkAsRead
        const fakeEvent = {
          stopPropagation: () => {},
        };

        // Sử dụng setTimeout để đảm bảo modal hiển thị trước khi gọi API
        setTimeout(() => {
          handleMarkAsRead(notification.notificationId, fakeEvent);
        }, 500);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  // Kiểm tra trạng thái đã đọc của thông báo
  const isNotificationRead = (notification) => {
    // Nếu thuộc tính isRead là false, trả về false
    // Thuộc tính isRead có thể là boolean hoặc string 'false'/'true'
    if (notification.isRead === false || notification.isRead === "false") {
      return false;
    }
    // Các trường hợp khác (isRead = true, 'true', undefined, null) đều coi là đã đọc
    return true;
  };

  // Xử lý thay đổi trong tìm kiếm
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  // Xử lý thay đổi bộ lọc loại thông báo - nhiều loại
  const handleTypeFilterChange = (values) => {
    setFilterTypes(values);
  };

  // Xử lý thay đổi bộ lọc trạng thái đã đọc
  const handleReadStatusFilterChange = (value) => {
    setFilterReadStatus(value);
  };

  // Xử lý thay đổi sắp xếp
  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
  };

  // Lấy các loại thông báo duy nhất để hiển thị trong dropdown lọc
  const getUniqueNotificationTypes = () => {
    const types = new Set(
      allNotifications.map((item) => item.notificationType)
    );
    return Array.from(types);
  };

  // Hàm xử lý điều hướng dựa vào loại thông báo
  const handleNavigateByType = (notification) => {
    console.log("Notification for navigation:", notification);

    if (
      notification.title &&
      notification.title.includes("CertificateSignature")
    ) {
      navigate("/certificates/pending");
    } else if (
      notification.title &&
      notification.title.includes("DecisionSignature")
    ) {
      navigate("/decisions/pending");
    } else if (
      (notification.title && notification.title.includes("Request")) ||
      notification.notificationType === "Request" ||
      (notification.message && notification.message.includes("request"))
    ) {
      navigate("/request");
    } else if (
      notification.title &&
      notification.title.includes("Trainee Assignment")
    ) {
      navigate("/assign-trainee");
    } else {
      // Mặc định nếu không phù hợp với các trường hợp trên
      message.info("No specific navigation for this notification type");
    }
    handleCloseModal();
  };

  // Kiểm tra liệu thông báo có thể điều hướng được không
  const canNavigate = (notification) => {
    return (
      notification.title &&
      (notification.title.includes("CertificateSignature") ||
        notification.title.includes("DecisionSignature") ||
        notification.title.includes("Request") ||
        (notification.message &&
          notification.message.toLowerCase().includes("request")) ||
        notification.notificationType === "Request" ||
        notification.title.includes("Trainee Assignment"))
    );
  };

  // Kiểm tra nếu có thông báo chưa đọc
  const hasUnreadNotifications = () => {
    return allNotifications.some(
      (notification) => !isNotificationRead(notification)
    );
  };

  // Hàm xử lý đánh dấu tất cả thông báo là đã đọc
  const handleMarkAllAsRead = async () => {
    try {
      const userID = sessionStorage.getItem("userID");
      if (!userID) {
        message.error("User ID not found, please log in again");
        return;
      }

      setLoading(true);
      message.loading({
        content: "Marking all notifications...",
        key: "markAllAsRead",
      });

      // Lọc ra các thông báo chưa đọc
      const unreadNotifications = allNotifications.filter(
        (notification) => !isNotificationRead(notification)
      );

      if (unreadNotifications.length === 0) {
        message.info("No notifications to mark as read");
        setLoading(false);
        return;
      }

      // Gọi API để đánh dấu từng thông báo là đã đọc
      // Tạo mảng các promise để thực hiện các cuộc gọi API song song
      const markPromises = unreadNotifications.map((notification) =>
        notificationService.markAsRead(notification.notificationId)
      );

      // Chờ tất cả các cuộc gọi API hoàn thành
      await Promise.all(markPromises);

      // Cập nhật UI
      const updatedNotifications = allNotifications.map((notification) => ({
        ...notification,
        isRead: true,
      }));

      setAllNotifications(updatedNotifications);
      applyFiltersAndSearch();

      // Làm mới số lượng thông báo chưa đọc
      refreshUnreadCount();

      message.success({
        content: "Marked all notifications as read",
        key: "markAllAsRead",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      message.error({
        content:
          "Cannot mark all notifications: " +
          (error.message || "An error occurred"),
        key: "markAllAsRead",
      });
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị thông tin debug về vai trò người dùng khi component mount
  useEffect(() => {
    console.log("Current user role:", userRole);
    console.log(
      "Is Headmaster or Training Staff:",
      isHeadmasterOrTrainingStaff
    );
  }, [userRole, isHeadmasterOrTrainingStaff]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Title level={2} className="text-center text-cyan-950 mb-0">
            Notifications
          </Title>
          {hasUnreadNotifications() && (
            <Tooltip title="Mark all as read">
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleMarkAllAsRead}
                loading={loading}
                className="!bg-cyan-600 hover:!bg-cyan-700 border-0 !text-white"
              >
                Mark All as Read
              </Button>
            </Tooltip>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            className="mb-4"
            action={
              <Button size="small" type="primary" onClick={handleRefresh}>
                Retry
              </Button>
            }
          />
        )}

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by title..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={handleSearchChange}
                allowClear
              />
            </div>

            <div className="flex flex-1 gap-2">
              <Select
                placeholder="Notification types"
                style={{ minWidth: "140px", flex: 1 }}
                value={filterTypes}
                onChange={handleTypeFilterChange}
                allowClear
                mode="multiple"
                maxTagCount={2}
              >
                {getUniqueNotificationTypes().map((type) => (
                  <Option key={type} value={type}>
                    <Tag color="cyan">{type}</Tag>
                  </Option>
                ))}
              </Select>

              <Select
                placeholder="Read status"
                style={{ minWidth: "120px", flex: 1 }}
                value={filterReadStatus}
                onChange={handleReadStatusFilterChange}
                allowClear
              >
                <Option value="all">All status</Option>
                <Option value="read">Read</Option>
                <Option value="unread">Unread</Option>
              </Select>
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <Radio.Group
              value={sortOrder}
              onChange={handleSortOrderChange}
              buttonStyle="solid"
            >
              <Radio.Group
                value={sortOrder}
                onChange={handleSortOrderChange}
                buttonStyle="solid"
                className="flex gap-2"
              >
                <Radio.Button
                  value="desc"
                  className={`!border !rounded-md px-4 py-1 transition-colors duration-200 ${
                    sortOrder === "desc"
                      ? "!bg-cyan-700 !text-white !border-cyan-700 hover:!bg-cyan-800"
                      : "!bg-white !text-cyan-700 !border-cyan-700 hover:!bg-cyan-50 hover:!text-cyan-800"
                  }`}
                >
                  <SortDescendingOutlined className="mr-1" />
                  Newest
                </Radio.Button>

                <Radio.Button
                  value="asc"
                  className={`!border !rounded-md px-4 py-1 transition-colors duration-200 ${
                    sortOrder === "asc"
                      ? "!bg-cyan-700 !text-white !border-cyan-700 hover:!bg-cyan-800"
                      : "!bg-white !text-cyan-700 !border-cyan-700 hover:!bg-cyan-50 hover:!text-cyan-800"
                  }`}
                >
                  <SortAscendingOutlined className="mr-1" />
                  Oldest
                </Radio.Button>
              </Radio.Group>
            </Radio.Group>
          </div>
        </div>

        {/* Notification List */}
        <Spin spinning={loading}>
          {notifications.length > 0 ? (
            <>
              <List
                className="bg-white rounded-lg shadow-sm"
                itemLayout="horizontal"
                dataSource={notifications}
                renderItem={(item) => {
                  const isRead = isNotificationRead(item);
                  return (
                    <List.Item
                      key={item.notificationId}
                      className={`cursor-pointer border-b p-4 transition-colors ${
                        isRead
                          ? "hover:bg-cyan-50"
                          : "bg-cyan-100 hover:bg-cyan-200"
                      }`}
                      onClick={() => showNotificationDetail(item)}
                    >
                      <div className="flex justify-between items-start w-full">
                        <List.Item.Meta
                          className="p-6"
                          avatar={
                            <div className="rounded-full bg-cyan-200 p-2 flex items-center justify-center">
                              <BellOutlined
                                style={{ fontSize: 18, color: "#0891b2" }}
                              />
                            </div>
                          }
                          title={
                            <span
                              className={`${
                                !isRead ? "font-semibold text-cyan-900" : ""
                              }`}
                            >
                              {item.title}
                            </span>
                          }
                          description={
                            <div className="flex flex-col">
                              <span className="text-gray-600 truncate max-w-lg">
                                {item.message}
                              </span>
                              <div className="flex items-center mt-1">
                                <Tag color="cyan">{item.notificationType}</Tag>
                                <span className="text-xs text-gray-400 ml-2">
                                  {getFormattedDate(item.createdAt)}
                                </span>
                              </div>
                            </div>
                          }
                        />
                        {!isRead && (
                          <Badge status="error" className="ml-3 mt-2" />
                        )}
                      </div>
                    </List.Item>
                  );
                }}
              />

              <div className="mt-4 flex justify-center">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalNotifications}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              </div>
            </>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                error
                  ? "Unable to load notifications"
                  : filteredNotifications.length > 0
                  ? "No matching notifications found"
                  : "No notifications"
              }
            />
          )}
        </Spin>
      </div>

      {/* Notification Detail Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <BellOutlined className="mr-2 text-cyan-600" />
            <span className="text-cyan-800">Notification Details</span>
          </div>
        }
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={
          selectedNotification && isHeadmasterOrTrainingStaff ? (
            <div className="flex justify-end">
              <Button onClick={handleCloseModal} style={{ marginRight: 8 }}>
                Close
              </Button>
              {canNavigate(selectedNotification) && (
                <Button
                  type="primary"
                  icon={<ArrowRightOutlined />}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  onClick={() => handleNavigateByType(selectedNotification)}
                >
                  {selectedNotification.title?.includes("CertificateSignature")
                    ? "Đến Certificate Pending"
                    : selectedNotification.title?.includes("DecisionSignature")
                    ? "Đến Decision Pending"
                    : selectedNotification.title?.includes("Trainee Assignment")
                    ? "Đến Assign Trainee"
                    : "Đến trang Request"}
                </Button>
              )}
            </div>
          ) : null
        }
        width={500}
      >
        {selectedNotification && (
          <div className="notification-detail">
            <div className="mb-4">
              <div className="font-semibold text-lg text-cyan-800">
                {selectedNotification.title}
              </div>
              <Tag color="cyan">{selectedNotification.notificationType}</Tag>
            </div>

            <p className="my-4 text-base text-gray-700 whitespace-pre-line">
              {selectedNotification.message}
            </p>

            <div className="text-right text-gray-500 mt-4">
              {getFormattedDate(selectedNotification.createdAt)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NotificationPage;
