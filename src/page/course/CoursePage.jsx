import React, { useState, useEffect } from "react";
import { 
  Layout, Card, Table, Tag, Button, Spin, Tabs, 
  Collapse, List, Avatar, Empty, message, Typography,
  Badge, Tooltip, Statistic 
} from "antd";
import { 
  PlusOutlined, BookOutlined, TeamOutlined, 
  FileTextOutlined, ReloadOutlined,
  EditOutlined, EyeOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { courseService } from "../../services/courseService";

const { Panel } = Collapse;
const { Title, Text, Paragraph } = Typography;

const CoursePage = () => {
  // State management
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch data on mount and when refreshed
  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (location.state?.refresh) {
      fetchCourses();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // API calls
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAllCourses();
      console.log("Courses data:", response);
      setCourses(response.data || []);
      
      if (response.data && response.data.length > 0) {
        setSelectedCourse(response.data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      message.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };
  
  // Utility functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'green';
      case 'Pending': return 'gold';
      case 'Rejected': return 'red';
      default: return 'default';
    }
  };
  
  const getProgressColor = (progress) => {
    switch (progress) {
      case 'Completed': return 'green';
      case 'Ongoing': return 'processing';
      case 'NotStarted': return 'default';
      default: return 'default';
    }
  };

  // Table configuration
  const columns = [
    {
      title: 'Course ID',
      dataIndex: 'courseId',
      key: 'courseId',
      width: 120,
    },
    {
      title: 'Course Name',
      dataIndex: 'courseName',
      key: 'courseName',
      render: (text, record) => (
        <a onClick={() => setSelectedCourse(record)} className="text-gray-700 hover:text-gray-900">
          {text}
        </a>
      ),
    },
    {
      title: 'Level',
      dataIndex: 'courseLevel',
      key: 'courseLevel',
      width: 120,
      render: (level) => {
        const levels = ['Initial', 'Recurrent', 'Relearn'];
        return levels[level] || level;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)} className="rounded-full px-3 py-1">
          {status}
        </Tag>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: (progress) => (
        <Tag color={getProgressColor(progress)} className="rounded-full px-3 py-1">
          {progress}
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <div className="flex space-x-2">
          <Tooltip title="View Details">
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setSelectedCourse(record)}
              className="bg-gray-600 hover:bg-gray-700 border-0"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/course/edit/${record.courseId}`)}
              className="text-gray-600 hover:text-gray-700"
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  // Tab items configuration - Cách mới thay vì sử dụng TabPane
  const getTabItems = () => {
    if (!selectedCourse) return [];
    
    return [
      {
        key: "1",
        label: (
          <span className="flex items-center">
            <FileTextOutlined className="mr-1" />
            Overview
          </span>
        ),
        children: (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 p-4">
            <div className="space-y-4">
              <Statistic 
                title="Course ID" 
                value={selectedCourse.courseId} 
                className="bg-gray-50 p-4 rounded-lg"
              />
              <Statistic 
                title="Training Plan" 
                value={selectedCourse.trainingPlanId}
                className="bg-gray-50 p-4 rounded-lg"
              />
              <Statistic 
                title="Level" 
                value={
                  ['Initial', 'Recurrent', 'Relearn'][selectedCourse.courseLevel] || 
                  selectedCourse.courseLevel
                }
                className="bg-gray-50 p-4 rounded-lg"
              />
            </div>
            <div className="space-y-4">
              <Statistic 
                title="Progress" 
                value={selectedCourse.progress}
                valueStyle={{ 
                  color: selectedCourse.progress === 'Ongoing' ? '#1677ff' : 
                          selectedCourse.progress === 'Completed' ? '#52c41a' : '#8c8c8c' 
                }}
                className="bg-gray-50 p-4 rounded-lg"
              />
              <Statistic 
                title="Created By" 
                value={selectedCourse.createdByUserId || 'N/A'}
                className="bg-gray-50 p-4 rounded-lg"
              />
              <Statistic 
                title="Created At" 
                value={new Date(selectedCourse.createdAt).toLocaleString()}
                className="bg-gray-50 p-4 rounded-lg"
              />
            </div>
          </div>
        )
      },
      {
        key: "2",
        label: (
          <span className="flex items-center">
            <BookOutlined className="mr-1" />
            Subjects
            <span className="ml-2 text-gray-500">
              ({selectedCourse.subjects?.length || 0})
            </span>
          </span>
        ),
        children: selectedCourse.subjects?.length > 0 ? (
          <Collapse accordion bordered={false} className="bg-white custom-collapse">
            {selectedCourse.subjects.map(subject => (
              <Panel 
                header={
                  <div className="flex justify-between items-center">
                    <Text strong>{subject.subjectName}</Text>
                    <Tag 
                      color="default" 
                      className="rounded-full px-3 py-1"
                    >
                      {subject.credits} Credits
                    </Tag>
                  </div>
                } 
                key={subject.subjectId}
                className="mb-2 border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="space-y-3 p-2">
                  <Paragraph><Text strong>ID:</Text> {subject.subjectId}</Paragraph>
                  <Paragraph><Text strong>Description:</Text> {subject.description}</Paragraph>
                  <Paragraph><Text strong>Passing Score:</Text> {subject.passingScore}</Paragraph>
                  <Paragraph><Text strong>Created:</Text> {new Date(subject.createdAt).toLocaleString()}</Paragraph>
                  <div className="flex justify-end mt-4">
                    <Button type="primary" size="small" className="bg-gray-600 hover:bg-gray-700 border-0">
                      View Subject
                    </Button>
                  </div>
                </div>
              </Panel>
            ))}
          </Collapse>
        ) : (
          <Empty 
            description="No subjects available for this course" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="py-12"
          />
        )
      },
      {
        key: "3",
        label: (
          <span className="flex items-center">
            <TeamOutlined className="mr-1" />
            Trainees
            <span className="ml-2 text-gray-500">
              ({selectedCourse.trainees?.length || 0})
            </span>
          </span>
        ),
        children: selectedCourse.trainees?.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={selectedCourse.trainees}
            renderItem={trainee => (
              <List.Item
                actions={[
                  <Tag 
                    color={getStatusColor(trainee.requestStatus)}
                    className="rounded-full px-3 py-1"
                  >
                    {trainee.requestStatus}
                  </Tag>
                ]}
                className="hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<TeamOutlined />} className="bg-gray-400" />}
                  title={<Text strong>{trainee.traineeId}</Text>}
                  description={`Assigned on: ${new Date(trainee.assignDate).toLocaleDateString()}`}
                />
              </List.Item>
            )}
            className="custom-list"
          />
        ) : (
          <Empty 
            description="No trainees assigned to this course" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="py-12"
          />
        )
      }
    ];
  };

  return (
    <Layout className="min-h-screen bg-gray-50 p-6 sm:p-8">
      <Layout.Content className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={2} className="m-0 text-gray-800">Course Management</Title>
            <Text className="text-gray-500">View and manage your training courses</Text>
          </div>
          <div className="flex space-x-3">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchCourses}
              loading={loading}
              className="border-gray-300 text-gray-600 hover:text-gray-800 hover:border-gray-400"
            >
              Refresh
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => navigate("/course/create")}
              className="bg-gray-700 hover:bg-gray-800 border-0"
            >
              Create New Course
            </Button>
          </div>
        </div>

        <Spin spinning={loading}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Courses List - Left Column */}
            <div className="lg:col-span-1">
              <Card 
                title={<Title level={4} className="m-0">Courses</Title>}
                className="h-full shadow-md rounded-lg overflow-hidden"
                extra={<Text className="text-gray-500">Total: {courses.length}</Text>}
              >
                {courses.length === 0 ? (
                  <Empty 
                    description="No courses available" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                  />
                ) : (
                  <Table 
                    columns={columns.filter(col => ['courseId', 'courseName', 'status'].includes(col.key))}
                    dataSource={courses}
                    rowKey="courseId"
                    pagination={{ pageSize: 10 }}
                    size="small"
                    onRow={(record) => ({
                      onClick: () => setSelectedCourse(record),
                      className: `cursor-pointer hover:bg-gray-50 transition-colors ${selectedCourse?.courseId === record.courseId ? 'bg-gray-100' : ''}`
                    })}
                    className="custom-table"
                  />
                )}
              </Card>
            </div>

            {/* Course Details - Right Column */}
            <div className="lg:col-span-2">
              {selectedCourse ? (
                <Card 
                  title={
                    <div className="flex items-center">
                      <Title level={4} className="m-0 mr-3">{selectedCourse.courseName}</Title>
                      <Tag color={getStatusColor(selectedCourse.status)} className="rounded-full px-3 py-1">
                        {selectedCourse.status}
                      </Tag>
                    </div>
                  }
                  className="shadow-md rounded-lg overflow-hidden"
                  extra={
                    <Button 
                      type="primary" 
                      icon={<EditOutlined />}
                      size="small"
                      onClick={() => navigate(`/course/edit/${selectedCourse.courseId}`)}
                      className="bg-gray-600 hover:bg-gray-700 border-0"
                    >
                      Edit
                    </Button>
                  }
                >
                  {/* Thay đổi cách sử dụng Tabs để không dùng TabPane */}
                  <Tabs 
                    defaultActiveKey="1" 
                    type="card"
                    items={getTabItems()}
                  />
                </Card>
              ) : (
                <Card className="shadow-md rounded-lg h-full flex items-center justify-center">
                  <Empty 
                    description="Select a course to view details" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </Card>
              )}
            </div>
          </div>

          <Card 
            title={<Title level={4} className="m-0">All Courses</Title>} 
            className="mt-6 shadow-md rounded-lg overflow-hidden"
            extra={
              <div className="flex items-center">
                <Text className="mr-2">Total: {courses.length}</Text>
                <Button 
                  icon={<ReloadOutlined />} 
                  size="small" 
                  onClick={fetchCourses}
                  loading={loading}
                  className="border-gray-300 text-gray-600"
                />
              </div>
            }
          >
            <Table 
              columns={columns}
              dataSource={courses}
              rowKey="courseId"
              pagination={{ pageSize: 10 }}
              rowClassName={(record) => `hover:bg-gray-50 transition-colors ${selectedCourse?.courseId === record.courseId ? 'bg-gray-100' : ''}`}
              scroll={{ x: true }}
              bordered
              className="custom-table"
            />
          </Card>
        </Spin>
      </Layout.Content>
    </Layout>
  );
};

export default CoursePage; 