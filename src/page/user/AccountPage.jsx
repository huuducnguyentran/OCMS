import { useEffect, useState } from "react";
import { Table, Tag, Typography, Button, Space, Input, message } from "antd";
import { ReloadOutlined, SearchOutlined, DownloadOutlined, EditOutlined } from '@ant-design/icons';
import { getAllUsers, exportTraineeInfo } from "../../services/userService";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';

const { Title } = Typography;
const { Search } = Input;

const AccountPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [sortedInfo, setSortedInfo] = useState({});
  const [userRole, setUserRole] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy role người dùng từ session
    const role = sessionStorage.getItem('role');
    setUserRole(role);
  }, []);


  const handleChange = (pagination, filters, sorter) => {
    console.log('Pagination changed:', pagination);
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
      message.loading({ content: "Đang chuẩn bị tải xuống...", key: "exportLoading" });
      await exportTraineeInfo(userId);
      message.success({ content: "Tải xuống thành công", key: "exportLoading" });
    } catch (error) {
      console.error("Error exporting trainee info:", error);
      message.error({ content: "Không thể tải xuống file. Vui lòng thử lại", key: "exportLoading" });
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
      sortOrder: sortedInfo.columnKey === 'userId' ? sortedInfo.order : null,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      width: 150,
      ellipsis: true,
      sorter: (a, b) => a.username.localeCompare(b.username),
      sortOrder: sortedInfo.columnKey === 'username' ? sortedInfo.order : null,
    },
    {
      title: "Specialty",
      dataIndex: "specialtyId",
      key: "specialtyId",
      width: 150,
      ellipsis: true,
      sorter: (a, b) => a.specialtyId.localeCompare(b.specialtyId),
      sortOrder: sortedInfo.columnKey === 'specialtyId' ? sortedInfo.order : null,
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      width: 180,
      ellipsis: true,
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      sortOrder: sortedInfo.columnKey === 'fullName' ? sortedInfo.order : null,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
      ellipsis: true,
      sorter: (a, b) => a.email.localeCompare(b.email),
      sortOrder: sortedInfo.columnKey === 'email' ? sortedInfo.order : null,
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: 130,
      ellipsis: true,
      sorter: (a, b) => a.phoneNumber.localeCompare(b.phoneNumber),
      sortOrder: sortedInfo.columnKey === 'phoneNumber' ? sortedInfo.order : null,
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: 100,
      sorter: (a, b) => a.gender.localeCompare(b.gender),
      sortOrder: sortedInfo.columnKey === 'gender' ? sortedInfo.order : null,
    },
    {
      title: "Role",
      dataIndex: "roleName",
      key: "roleName",
      width: 120,
      sorter: (a, b) => a.roleName.localeCompare(b.roleName),
      sortOrder: sortedInfo.columnKey === 'roleName' ? sortedInfo.order : null,
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
      sortOrder: sortedInfo.columnKey === 'dateOfBirth' ? sortedInfo.order : null,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    // Thêm cột Action nếu người dùng là Admin hoặc Reviewer
    ...(userRole === 'Admin' || userRole === 'Reviewer' ? [
      {
        title: "Action",
        key: "action",
        width: 100,
        fixed: "right",
        render: (_, record) => (
          userRole === 'Admin' ? (
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => navigateToUpdate(record.userId)}
              className="bg-blue-500 hover:bg-blue-600"
            />
          ) : (
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              size="small"
              onClick={() => handleExportTraineeInfo(record.userId)}
              disabled={record.roleName !== "Trainee"}
              className="bg-green-500 hover:bg-green-600"
              title={record.roleName !== "Trainee" ? "Only available for Trainee accounts" : "Export trainee information"}
            />
          )
        ),
      },
    ] : []),
  ];

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      setFilteredAccounts(accounts);
    } else {
      const searchValue = value.toLowerCase().trim();
      const filtered = accounts.filter(account => 
        (account.userId?.toString() || '').toLowerCase().includes(searchValue) ||      // Tìm theo UserID
        (account.username || '').toLowerCase().includes(searchValue) ||                // Tìm theo Username
        (account.fullName || '').toLowerCase().includes(searchValue) ||               // Tìm theo Full Name
        (account.email || '').toLowerCase().includes(searchValue) ||                  // Tìm theo Email
        (account.phoneNumber || '').toLowerCase().includes(searchValue) ||            // Tìm theo Phone
        (account.roleName || '').toLowerCase().includes(searchValue) 
        (account.departmentId || '').toLowerCase().includes(searchValue)      
        (account.specialtyId || '').toLowerCase().includes(searchValue)           // Tìm theo Role
      );
      setFilteredAccounts(filtered);
    }
  };

  // Hàm xử lý xuất dữ liệu
  const handleExportData = () => {
    try {
      // Chuẩn bị dữ liệu để xuất
      const dataToExport = filteredAccounts.map(account => ({
        'User ID': account.userId,
        'Username': account.username,
        'Full Name': account.fullName,
        'Email': account.email,
        'Phone': account.phoneNumber,
        'Gender': account.gender,
        'Role': account.roleName,
        'Date of Birth': account.dateOfBirth ? new Date(account.dateOfBirth).toLocaleDateString() : '',
      }));

      // Tạo workbook và worksheet
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Accounts");

      // Tạo tên file với timestamp
      const date = new Date();
      const fileName = `accounts_${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}.xlsx`;

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
      setSearchText('');
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      message.error('Unable to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-indigo-200 p-8 animate__animated animate__fadeIn">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-xl">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <Title level={2} className="text-center mb-8 text-gray-800">
              Account List
            </Title>
            <Space size="large">
              <Search
                placeholder="Search by User ID, Username, Full Name, Email, Phone, or Role"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 500 }}
                className="rounded-lg"
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchAccounts}
                loading={loading}
                type="primary"
                size="large"
              >
                Refresh
              </Button>
            </Space>
          </div>
        </div>

        {/* Search Results Summary */}
        {searchText && (
          <div className="mb-4">
            <Tag color="blue" className="text-sm px-3 py-1">
              Tìm thấy {filteredAccounts.length} kết quả cho từ khóa "{searchText}"
            </Tag>
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
              console.log('Page changed to:', page);
              console.log('PageSize changed to:', pageSize);
              setPagination({ current: page, pageSize: pageSize });
            },
          }}
          bordered
          scroll={{ x: "max-content", y: 500 }}
        />

        {userRole === 'Reviewer' && (
          <div className="mt-6 flex justify-end">
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              size="large"
              onClick={handleExportData}
              className="bg-green-600 hover:bg-green-700 border-0"
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