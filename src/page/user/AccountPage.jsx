import { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Typography,
  Button,
  Space,
  Input,
  message,
  Switch,
  Modal,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  DownloadOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  getAllUsers,
  exportTraineeInfo,
  activateUser,
  deactivateUser,
} from "../../services/userService";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const { Title, Text } = Typography;
const { Search } = Input;
const { confirm } = Modal;

const AccountPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [sortedInfo, setSortedInfo] = useState({});
  const [userRole, setUserRole] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy role người dùng từ session
    const role = sessionStorage.getItem("role");
    setUserRole(role);
  }, []);

  // Kiểm tra nếu user là Admin
  const isAdmin = userRole === "Admin";
  const isReviewer = userRole === "Reviewer";

  const handleChange = (pagination, filters, sorter) => {
    console.log("Pagination changed:", pagination);
    setPagination(pagination);
    setSortedInfo(sorter);
  };

  // Hàm chuyển hướng đến trang cập nhật
  const navigateToUpdate = (userId) => {
    navigate(`/account/update/${userId}`);
  };

  // Hàm xử lý xuất thông tin học viên
  const handleExportTraineeInfo = async (userId) => {
    try {
      message.loading({
        content: "Đang chuẩn bị tải xuống...",
        key: "exportLoading",
      });
      await exportTraineeInfo(userId);
      message.success({
        content: "Tải xuống thành công",
        key: "exportLoading",
      });
    } catch (error) {
      console.error("Error exporting trainee info:", error);
      message.error({
        content: "Không thể tải xuống file. Vui lòng thử lại",
        key: "exportLoading",
      });
    }
  };

  // // Hàm xử lý xóa tài khoản
  // const handleDeleteConfirm = (userId) => {
  //   try {
  //     message.loading({ content: "Đang xóa tài khoản...", key: "deleteAccount" });
  //     // Gọi API xóa tài khoản tại đây
  //     // Ví dụ: await deleteUser(userId);

  //     // Sau khi xóa thành công, cập nhật lại danh sách
  //     fetchAccounts();
  //     message.success({ content: "Xóa tài khoản thành công", key: "deleteAccount" });
  //   } catch (error) {
  //     console.error("Error deleting account:", error);
  //     message.error({ content: "Không thể xóa tài khoản. Vui lòng thử lại", key: "deleteAccount" });
  //   }
  // };

  // Cập nhật một tài khoản cụ thể trong danh sách
  const updateAccountInList = (userId, newStatus) => {
    setAccounts((prevAccounts) =>
      prevAccounts.map((account) =>
        account.userId === userId
          ? { ...account, accountStatus: newStatus }
          : account
      )
    );

    setFilteredAccounts((prevFilteredAccounts) =>
      prevFilteredAccounts.map((account) =>
        account.userId === userId
          ? { ...account, accountStatus: newStatus }
          : account
      )
    );
  };

  // Hàm xử lý kích hoạt/vô hiệu hóa tài khoản
  const handleToggleStatus = async (userId, checked, currentStatus) => {
    // Nếu đang chuyển sang trạng thái Deactivated (tắt), hiển thị xác nhận
    if (!checked && currentStatus === "Active") {
      confirm({
        title: "Are you sure you want to deactivate this account?",
        icon: <ExclamationCircleOutlined />,
        content: "Account will not be able to login after being deactivated.",
        okText: "Deactivate",
        okType: "danger",
        cancelText: "Cancel",
        async onOk() {
          await toggleAccountStatus(userId, checked);
        },
      });
    } else {
      // Nếu đang kích hoạt tài khoản, thực hiện luôn
      await toggleAccountStatus(userId, checked);
    }
  };

  // Hàm thực hiện thay đổi trạng thái tài khoản
  const toggleAccountStatus = async (userId, checked) => {
    try {
      setActionLoading(true);
      const messageKey = "toggleStatus";

      message.loading({
        content: checked ? "Activating account..." : "Deactivating account...",
        key: messageKey,
      });

      if (checked) {
        await activateUser(userId);
        updateAccountInList(userId, "Active");
        message.success({
          content: "Account activated successfully",
          key: messageKey,
        });
      } else {
        await deactivateUser(userId);
        updateAccountInList(userId, "Deactivated");
        message.success({
          content: "Account deactivated successfully",
          key: messageKey,
        });
      }
    } catch (error) {
      console.error("Error toggling account status:", error);
      message.error({
        content: checked
          ? "Cannot activate account. Please try again"
          : "Cannot deactivate account. Please try again",
        key: "toggleStatus",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      width: 120,
      ellipsis: true,
      sorter: (a, b) => a.userId.localeCompare(b.userId),
      sortOrder: sortedInfo.columnKey === "userId" ? sortedInfo.order : null,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      width: 150,
      ellipsis: true,
      sorter: (a, b) => a.username.localeCompare(b.username),
      sortOrder: sortedInfo.columnKey === "username" ? sortedInfo.order : null,
    },
    {
      title: "Specialty",
      dataIndex: "specialtyId",
      key: "specialtyId",
      width: 150,
      ellipsis: true,
      sorter: (a, b) => a.specialtyId.localeCompare(b.specialtyId),
      sortOrder:
        sortedInfo.columnKey === "specialtyId" ? sortedInfo.order : null,
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      width: 180,
      ellipsis: true,
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      sortOrder: sortedInfo.columnKey === "fullName" ? sortedInfo.order : null,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
      ellipsis: true,
      sorter: (a, b) => a.email.localeCompare(b.email),
      sortOrder: sortedInfo.columnKey === "email" ? sortedInfo.order : null,
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: 130,
      ellipsis: true,
      sorter: (a, b) => a.phoneNumber.localeCompare(b.phoneNumber),
      sortOrder:
        sortedInfo.columnKey === "phoneNumber" ? sortedInfo.order : null,
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: 100,
      sorter: (a, b) => a.gender.localeCompare(b.gender),
      sortOrder: sortedInfo.columnKey === "gender" ? sortedInfo.order : null,
    },
    {
      title: "Role",
      dataIndex: "roleName",
      key: "roleName",
      width: 120,
      sorter: (a, b) => a.roleName.localeCompare(b.roleName),
      sortOrder: sortedInfo.columnKey === "roleName" ? sortedInfo.order : null,
      render: (roleName) => {
        let color = "default";
        if (roleName === "Admin") color = "red";
        else if (roleName === "Instructor") color = "blue";
        else if (roleName === "Trainee") color = "green";

        return <Tag color={color}>{roleName}</Tag>;
      },
    },
    {
      title: "Date of Birth",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      width: 150,
      sorter: (a, b) => new Date(a.dateOfBirth) - new Date(b.dateOfBirth),
      sortOrder:
        sortedInfo.columnKey === "dateOfBirth" ? sortedInfo.order : null,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "accountStatus",
      key: "accountStatus",
      width: 100,
      fixed: "right",
      render: (accountStatus, record) => {
        const isActive = accountStatus === "Active";
        return (
          <Switch
            checked={isActive}
            onChange={(checked) =>
              handleToggleStatus(record.userId, checked, accountStatus)
            }
            disabled={!isAdmin || actionLoading}
            className={isActive ? "!bg-cyan-500" : "bg-gray-400"}
          />
        );
      },
    },
    // Thêm cột Action nếu người dùng là Admin hoặc Reviewer
    ...(isAdmin || isReviewer
      ? [
          {
            title: "Action",
            key: "action",
            width: 80,
            fixed: "right",
            render: (_, record) =>
              isAdmin ? (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => navigateToUpdate(record.userId)}
                  className="!w-full !bg-cyan-600 hover:!bg-cyan-700 !border-none"
                />
              ) : (
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  size="small"
                  onClick={() => handleExportTraineeInfo(record.userId)}
                  disabled={record.roleName !== "Trainee"}
                  className="!w-full !bg-cyan-800 hover:!bg-cyan-700  disabled:opacity-50 !border-none"
                  title={
                    record.roleName !== "Trainee"
                      ? "Only available for Trainee accounts"
                      : "Export trainee information"
                  }
                />
              ),
          },
        ]
      : []),
  ];

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      setFilteredAccounts(accounts);
    } else {
      const searchValue = value.toLowerCase().trim();
      const filtered = accounts.filter((account) => {
        // Chuyển đổi date of birth thành chuỗi để tìm kiếm
        const dateOfBirthStr = account.dateOfBirth
          ? new Date(account.dateOfBirth).toLocaleDateString()
          : "";

        // Tìm kiếm trong tất cả các trường
        return (
          (account.userId?.toString() || "")
            .toLowerCase()
            .includes(searchValue) || // User ID
          (account.username || "").toLowerCase().includes(searchValue) || // Username
          (account.specialtyId || "").toLowerCase().includes(searchValue) || // Specialty
          (account.fullName || "").toLowerCase().includes(searchValue) || // Full Name
          (account.email || "").toLowerCase().includes(searchValue) || // Email
          (account.phoneNumber || "").toLowerCase().includes(searchValue) || // Phone
          (account.gender || "").toLowerCase().includes(searchValue) || // Gender
          (account.roleName || "").toLowerCase().includes(searchValue) || // Role
          dateOfBirthStr.toLowerCase().includes(searchValue) // Date of Birth
        );
      });
      setFilteredAccounts(filtered);
    }
  };

  // Hàm xử lý xuất dữ liệu
  const handleExportData = () => {
    try {
      // Chuẩn bị dữ liệu để xuất
      const dataToExport = filteredAccounts.map((account) => ({
        "User ID": account.userId,
        Username: account.username,
        "Full Name": account.fullName,
        Email: account.email,
        Phone: account.phoneNumber,
        Gender: account.gender,
        Role: account.roleName,
        "Date of Birth": account.dateOfBirth
          ? new Date(account.dateOfBirth).toLocaleDateString()
          : "",
      }));

      // Tạo workbook và worksheet
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Accounts");

      // Tạo tên file với timestamp
      const date = new Date();
      const fileName = `accounts_${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}_${date.getHours()}-${date.getMinutes()}.xlsx`;

      // Xuất file
      XLSX.writeFile(workbook, fileName);
      message.success("Data exported successfully!");
    } catch (error) {
      console.error("Error exporting data:", error);
      message.error("Failed to export data. Please try again.");
    }
  };

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      const formattedData = (data || []).map((item, index) => ({
        ...item,
        key: index,
      }));
      setAccounts(formattedData);
      setFilteredAccounts(formattedData);
      setSearchText("");
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      message.error("Unable to load accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-8 animate__animated animate__fadeIn">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-2xl shadow-2xl border border-cyan-600">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <Title level={2} className="!text-cyan-800 !mb-0">
            Account List
          </Title>
          <Space size="large" className="flex-wrap">
            <Search
              placeholder="Search by ID, Username, Specialty, Name, etc."
              allowClear
              enterButton={
                <Button
                  type="primary"
                  style={{
                    backgroundColor: "#0e7490", // Tailwind's cyan-800
                    borderColor: "#0e7490",
                  }}
                  icon={<SearchOutlined />}
                />
              }
              size="large"
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 400, borderColor: "#155e75" }}
              className="rounded-lg"
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchAccounts}
              loading={loading}
              size="large"
              className="!bg-cyan-700 hover:!bg-cyan-800 !text-white !border-none"
            >
              Refresh
            </Button>
          </Space>
        </div>

        {searchText && (
          <div className="mb-4">
            <Tag color="cyan" className="text-sm px-3 py-1 rounded">
              Found {filteredAccounts.length} results for {searchText}
            </Tag>
            <Text type="secondary" className="ml-2">
              Searching in: User ID, Username, Specialty, Full Name, Email,
              Phone, Gender, Role, Date of Birth
            </Text>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={filteredAccounts}
          onChange={handleChange}
          loading={loading}
          pagination={{
            ...pagination,
            total: filteredAccounts.length,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} records`,
            onChange: (page, pageSize) => {
              console.log("Page changed to:", page);
              console.log("PageSize changed to:", pageSize);
              setPagination({ current: page, pageSize });
            },
          }}
          bordered
          scroll={{ x: "max-content", y: 500 }}
          className="rounded-xl overflow-hidden"
        />

        {isReviewer && (
          <div className="mt-6 flex justify-end">
            <Button
              icon={<DownloadOutlined />}
              size="large"
              onClick={handleExportData}
              className="!bg-cyan-700 hover:!bg-cyan-800 !text-white !border-none"
            >
              Export All Information
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
