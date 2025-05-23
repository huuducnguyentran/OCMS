import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout, Typography, Button, Table, Space, Tag, Tooltip, Input,
  Popconfirm, message, Card, Row, Col, Select, Badge, Spin, Empty
} from "antd";
import {
  PlusOutlined, DeleteOutlined, SearchOutlined, FilterOutlined,
  BookOutlined, TagsOutlined, InfoCircleOutlined
} from "@ant-design/icons";
import { getAllSubjectSpecialties, deleteSubjectSpecialty } from "../../services/subjectSpecialtyServices";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const SubjectSpecialtyPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [filterSpecialty, setFilterSpecialty] = useState(null);
  const [filterSubject, setFilterSubject] = useState(null);

  // Get unique specialties and subjects for filters
  const specialties = [...new Set(data.map(item => item.specialty?.specialtyName))];
  const subjects = [...new Set(data.map(item => item.subject?.subjectName))];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllSubjectSpecialties();
      console.log('API Response:', response);
      
      // Handle different possible response structures
      let subjectSpecialties = [];
      if (Array.isArray(response)) {
        subjectSpecialties = response;
      } else if (response.data && Array.isArray(response.data)) {
        subjectSpecialties = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        subjectSpecialties = response.data.data;
      }
      
      console.log('Processed data:', subjectSpecialties);
      setData(subjectSpecialties);
      setFilteredData(subjectSpecialties);
    } catch (error) {
      console.error("Error fetching subject specialties:", error);
      message.error("Failed to load subject specialties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filter data based on search text and filters
    let filtered = [...data];
    
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.subjectSpecialtyId?.toLowerCase().includes(searchLower) ||
          item.subject?.subjectName?.toLowerCase().includes(searchLower) ||
          item.specialty?.specialtyName?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filterSpecialty) {
      filtered = filtered.filter(item => item.specialty?.specialtyName === filterSpecialty);
    }
    
    if (filterSubject) {
      filtered = filtered.filter(item => item.subject?.subjectName === filterSubject);
    }
    
    setFilteredData(filtered);
  }, [searchText, filterSpecialty, filterSubject, data]);

  const handleDelete = async (id) => {
    try {
      await deleteSubjectSpecialty(id);
      message.success("Subject specialty deleted successfully");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error deleting subject specialty:", error);
      message.error("Failed to delete subject specialty");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "subjectSpecialtyId",
      key: "subjectSpecialtyId",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      render: (subject) => (
        <Space>
          <BookOutlined style={{ color: "#1890ff" }} />
          <span>{subject?.subjectName || "N/A"}</span>
          <Tooltip title={`Subject ID: ${subject?.subjectId || "N/A"}`}>
            <InfoCircleOutlined style={{ color: "#1890ff" }} />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Specialty",
      dataIndex: "specialty",
      key: "specialty",
      render: (specialty) => (
        <Space>
          <TagsOutlined style={{ color: "#52c41a" }} />
          <span>{specialty?.specialtyName || "N/A"}</span>
          <Tooltip title={`Specialty ID: ${specialty?.specialtyId || "N/A"}`}>
            <InfoCircleOutlined style={{ color: "#52c41a" }} />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm
            title="Are you sure you want to delete this subject specialty?"
            onConfirm={() => handleDelete(record.subjectSpecialtyId)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button 
              icon={<DeleteOutlined />} 
              danger 
              type="text"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="w-full px-6 py-8">
        <Card className="shadow-xl rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Title level={2} className="m-0">Subject Specialties</Title>
              <Text type="secondary" className="text-lg">
                Manage subject and specialty associations
              </Text>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/subject-specialty/create")}
              size="large"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create New
            </Button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <Row gutter={16} align="middle">
              <Col xs={24} md={8}>
                <Search
                  placeholder="Search by ID or name"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full"
                />
              </Col>
              <Col xs={24} md={8}>
                <Select
                  placeholder="Filter by Specialty"
                  allowClear
                  style={{ width: "100%" }}
                  size="large"
                  onChange={(value) => setFilterSpecialty(value)}
                  suffixIcon={<FilterOutlined />}
                >
                  {specialties.map((specialty) => (
                    <Option key={specialty} value={specialty}>
                      {specialty}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} md={8}>
                <Select
                  placeholder="Filter by Subject"
                  allowClear
                  style={{ width: "100%" }}
                  size="large"
                  onChange={(value) => setFilterSubject(value)}
                  suffixIcon={<FilterOutlined />}
                >
                  {subjects.map((subject) => (
                    <Option key={subject} value={subject}>
                      {subject}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" tip="Loading subject specialties..." />
            </div>
          ) : filteredData.length === 0 ? (
            <Empty
              description={
                <span className="text-gray-500 text-lg">
                  No subject specialties found
                </span>
              }
              className="my-10"
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/subject-specialty/create")}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Create New
              </Button>
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredData.map(item => ({ ...item, key: item.subjectSpecialtyId }))}
              pagination={{ pageSize: 10 }}
              className="shadow-sm rounded-lg overflow-hidden"
              rowClassName="hover:bg-blue-50 transition-colors"
            />
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default SubjectSpecialtyPage;
