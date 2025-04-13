import { useEffect, useState } from "react";
import { Table, Tag, Typography, Button, Space, Input, message } from "antd";
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { getAllUsers } from "../../services/userService";

const { Title } = Typography;
const { Search } = Input;

const AccountPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [sortedInfo, setSortedInfo] = useState({});

  const handleChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
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
  ];

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      setFilteredAccounts(accounts);
    } else {
      const filtered = accounts.filter(account => 
        account.username.toLowerCase().includes(value.toLowerCase()) ||
        account.fullName.toLowerCase().includes(value.toLowerCase()) ||
        account.email.toLowerCase().includes(value.toLowerCase()) ||
        account.phoneNumber.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredAccounts(filtered);
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
                placeholder="Search by Username, Full Name, Email, or Phone"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 400 }}
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
              Found {filteredAccounts.length} results for "{searchText}"
            </Tag>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={filteredAccounts}
          onChange={handleChange}
          loading={loading}
          pagination={{
            total: filteredAccounts.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} records`,
          }}
          bordered
          scroll={{ x: "max-content", y: 500 }}
        />
      </div>
    </div>
  );
};

export default AccountPage; 