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
} from "antd";
import { notificationService } from "../../services/notificationService";
import {
  BellOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
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
  const navigate = useNavigate();

  useEffect(() => {
    const userID = sessionStorage.getItem("userID");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Title level={2} className="text-center mb-8 text-gray-800">
          Notifications
        </Title>

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

        {/* Thanh tìm kiếm và bộ lọc */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
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
                mode="multiple" // Cho phép chọn nhiều loại
                maxTagCount={2} // Hiển thị tối đa 2 tag, còn lại +n
              >
                {getUniqueNotificationTypes().map((type) => (
                  <Option key={type} value={type}>
                    <Tag color={getNotificationTypeColor(type)}>{type}</Tag>
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

          {/* Thanh sắp xếp */}
          <div className="mt-3 flex justify-end">
            <Radio.Group
              value={sortOrder}
              onChange={handleSortOrderChange}
              buttonStyle="solid"
            >
              <Radio.Button value="desc">
                <SortDescendingOutlined /> Newest
              </Radio.Button>
              <Radio.Button value="asc">
                <SortAscendingOutlined /> Oldest
              </Radio.Button>
            </Radio.Group>
          </div>
        </div>

        <Spin spinning={loading}>
          {notifications.length > 0 ? (
            <>
              <List
                className="notification-list bg-white rounded-lg shadow-sm p-1"
                itemLayout="horizontal"
                dataSource={notifications}
                renderItem={(item) => {
                  const notificationIsRead = isNotificationRead(item);
                  return (
                    <List.Item
                      key={item.notificationId}
                      className={`cursor-pointer border-b hover:bg-gray-50 p-4 ${
                        !notificationIsRead ? "bg-blue-50" : ""
                      }`}
                      onClick={() => showNotificationDetail(item)}
                    >
                      <div className="relative w-full flex justify-between items-start">
                        <List.Item.Meta
                          avatar={
                            <div className="rounded-full bg-blue-100 p-2 flex items-center justify-center ml-2">
                              <BellOutlined
                                style={{ fontSize: "18px", color: "#1890ff" }}
                              />
                            </div>
                          }
                          title={
                            <div className="flex items-center">
                              <span
                                className={
                                  !notificationIsRead ? "font-semibold" : ""
                                }
                              >
                                {item.title}
                              </span>
                            </div>
                          }
                          description={
                            <div className="flex flex-col">
                              <span className="text-gray-500 truncate max-w-lg">
                                {item.message}
                              </span>
                              <div className="flex items-center mt-1">
                                <Tag
                                  color={getNotificationTypeColor(
                                    item.notificationType
                                  )}
                                >
                                  {item.notificationType}
                                </Tag>
                                <span className="text-xs text-gray-400 ml-2">
                                  {getFormattedDate(item.createdAt)}
                                </span>
                              </div>
                            </div>
                          }
                        />
                        {!notificationIsRead && (
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

      {/* Modal chi tiết thông báo */}
      <Modal
        title={
          <div className="flex items-center">
            <BellOutlined className="mr-2" style={{ color: "#1890ff" }} />
            <span>Notification Details</span>
          </div>
        }
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={500}
      >
        {selectedNotification && (
          <div className="notification-detail">
            <div className="mb-4">
              <div className="font-semibold text-lg">
                {selectedNotification.title}
              </div>
              <Tag
                color={getNotificationTypeColor(
                  selectedNotification.notificationType
                )}
              >
                {selectedNotification.notificationType}
              </Tag>
            </div>

            <p className="my-4 text-base whitespace-pre-line">
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
